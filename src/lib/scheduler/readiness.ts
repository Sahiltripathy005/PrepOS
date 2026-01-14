// src/lib/scheduler/readiness.ts
import { prisma } from "@/lib/prisma";

/**
 * Readiness score per category is computed as:
 * readiness = 0.35*accuracy + 0.25*speed + 0.20*coverage + 0.20*revisionDiscipline
 *
 * accuracy: correctTotal/attemptsTotal
 * speed: normalized based on avgTimeSec vs expected baseline time
 * coverage: practicedTopics / totalTopics in that category
 * revisionDiscipline: how well revisions are being done on time (TopicStat nextRevisionDate)
 */

export type CategoryKey = "DSA" | "APTI" | "CS" | "DEV";

export type ReadinessBreakdown = {
  overall: number; // 0..100
  dsa: number; // 0..100
  apti: number; // 0..100
  cs: number; // 0..100
  dev: number; // 0..100
};

type GoalWeights = {
  wDsa: number;
  wApti: number;
  wCs: number;
  wDev: number;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(a: Date, b: Date) {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Normalize speed based on avg time vs baseline (lower avgTimeSec => higher speed score).
 * If attempts are 0 => speed = 0
 *
 * speedScore in [0..100]
 */
function computeSpeedScore(avgTimeSec: number, baselineSec: number) {
  if (!baselineSec || baselineSec <= 0) return 0;

  // ratio < 1 means faster than baseline
  const ratio = avgTimeSec / baselineSec;

  // We map ratio to score:
  // ratio <= 0.5 => 100
  // ratio = 1.0 => 70
  // ratio = 1.5 => 40
  // ratio >= 2.5 => 0
  if (ratio <= 0.5) return 100;
  if (ratio >= 2.5) return 0;

  // piecewise linear between the anchors
  if (ratio <= 1.0) {
    // 0.5 -> 100, 1.0 -> 70
    const t = (ratio - 0.5) / (1.0 - 0.5);
    return clamp(100 - t * 30);
  }
  if (ratio <= 1.5) {
    // 1.0 -> 70, 1.5 -> 40
    const t = (ratio - 1.0) / (1.5 - 1.0);
    return clamp(70 - t * 30);
  }

  // 1.5 -> 40, 2.5 -> 0
  const t = (ratio - 1.5) / (2.5 - 1.5);
  return clamp(40 - t * 40);
}

/**
 * Revision discipline:
 * We look at TopicStat rows in a category where nextRevisionDate is set.
 * If lastPracticedAt is on or after nextRevisionDate (or within tolerance of 1 day), it's disciplined.
 *
 * Returns 0..100
 */
function computeRevisionDiscipline(stats: Array<{ lastPracticedAt: Date | null; nextRevisionDate: Date | null }>) {
  const relevant = stats.filter((s) => s.nextRevisionDate != null);
  if (relevant.length === 0) return 0;

  let disciplined = 0;

  for (const s of relevant) {
    if (!s.nextRevisionDate) continue;

    const due = startOfDay(s.nextRevisionDate);
    const last = s.lastPracticedAt ? startOfDay(s.lastPracticedAt) : null;

    // If never practiced, not disciplined
    if (!last) continue;

    // disciplined if done on due day or within 1 day after due
    const deltaDays = daysBetween(due, last); // last - due
    if (deltaDays >= 0 && deltaDays <= 1) disciplined += 1;
  }

  return clamp((disciplined / relevant.length) * 100);
}

/**
 * Coverage: practicedTopics / totalTopics in category
 * practicedTopics = TopicStat rows with attemptsTotal > 0 OR lastPracticedAt not null
 */
function computeCoverage(totalTopics: number, practicedTopics: number) {
  if (totalTopics <= 0) return 0;
  return clamp((practicedTopics / totalTopics) * 100);
}

/**
 * Accuracy: correct / attempts
 */
function computeAccuracy(correct: number, attempts: number) {
  if (attempts <= 0) return 0;
  return clamp((correct / attempts) * 100);
}

function computeReadinessScore(params: {
  accuracy: number;
  speed: number;
  coverage: number;
  revisionDiscipline: number;
}) {
  const { accuracy, speed, coverage, revisionDiscipline } = params;

  const readiness =
    0.35 * (accuracy / 100) +
    0.25 * (speed / 100) +
    0.20 * (coverage / 100) +
    0.20 * (revisionDiscipline / 100);

  return clamp(readiness * 100);
}

const BASELINE_TIME_SEC: Record<CategoryKey, number> = {
  DSA: 15 * 60, // 15 min baseline
  APTI: 2 * 60, // 2 min baseline
  CS: 10 * 60, // 10 min baseline
  DEV: 30 * 60, // 30 min baseline (projects/tasks are long)
};

async function getGoalWeights(userId: string): Promise<GoalWeights> {
  // Use the latest goal by startDate (or created order)
  const goal = await prisma.goal.findFirst({
    where: { userId },
    orderBy: { startDate: "desc" },
    select: { wDsa: true, wApti: true, wCs: true, wDev: true },
  });

  // if goal missing, fallback to equal weights
  if (!goal) {
    return { wDsa: 0.25, wApti: 0.25, wCs: 0.25, wDev: 0.25 };
  }

  // normalize weights to sum=1
  const sum = goal.wDsa + goal.wApti + goal.wCs + goal.wDev;
  if (sum <= 0) return { wDsa: 0.25, wApti: 0.25, wCs: 0.25, wDev: 0.25 };

  return {
    wDsa: goal.wDsa / sum,
    wApti: goal.wApti / sum,
    wCs: goal.wCs / sum,
    wDev: goal.wDev / sum,
  };
}

async function computeCategory(userId: string, category: CategoryKey) {
  // total topics in category
  const totalTopics = await prisma.topic.count({
    where: { category },
  });

  // all topicStats in category
  const stats = await prisma.topicStat.findMany({
    where: { userId, topic: { category } },
    select: {
      attemptsTotal: true,
      correctTotal: true,
      avgTimeSec: true,
      lastPracticedAt: true,
      nextRevisionDate: true,
    },
  });

  const attemptsTotal = stats.reduce((acc, s) => acc + (s.attemptsTotal ?? 0), 0);
  const correctTotal = stats.reduce((acc, s) => acc + (s.correctTotal ?? 0), 0);

  // Weighted avg time by attemptsTotal (if 0 fallback to 0)
  const totalTimeWeighted = stats.reduce((acc, s) => acc + (s.avgTimeSec ?? 0) * (s.attemptsTotal ?? 0), 0);
  const avgTimeSec = attemptsTotal > 0 ? Math.round(totalTimeWeighted / attemptsTotal) : 0;

  const practicedTopics = stats.filter((s) => (s.attemptsTotal ?? 0) > 0 || s.lastPracticedAt != null).length;

  const accuracy = computeAccuracy(correctTotal, attemptsTotal);
  const speed = attemptsTotal > 0 ? computeSpeedScore(avgTimeSec, BASELINE_TIME_SEC[category]) : 0;
  const coverage = computeCoverage(totalTopics, practicedTopics);
  const revisionDiscipline = computeRevisionDiscipline(
    stats.map((s) => ({ lastPracticedAt: s.lastPracticedAt, nextRevisionDate: s.nextRevisionDate }))
  );

  const readiness = computeReadinessScore({ accuracy, speed, coverage, revisionDiscipline });

  return {
    readiness,
    metrics: { accuracy, speed, coverage, revisionDiscipline, attemptsTotal, correctTotal, avgTimeSec, practicedTopics, totalTopics },
  };
}

export async function computeReadinessForUser(userId: string): Promise<ReadinessBreakdown> {
  const weights = await getGoalWeights(userId);

  const [dsa, apti, cs, dev] = await Promise.all([
    computeCategory(userId, "DSA"),
    computeCategory(userId, "APTI"),
    computeCategory(userId, "CS"),
    computeCategory(userId, "DEV"),
  ]);

  const overall =
    weights.wDsa * (dsa.readiness / 100) +
    weights.wApti * (apti.readiness / 100) +
    weights.wCs * (cs.readiness / 100) +
    weights.wDev * (dev.readiness / 100);

  return {
    overall: clamp(overall * 100),
    dsa: clamp(dsa.readiness),
    apti: clamp(apti.readiness),
    cs: clamp(cs.readiness),
    dev: clamp(dev.readiness),
  };
}
