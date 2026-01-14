// src/lib/scheduler/spacedRepetition.ts

export type Difficulty = "easy" | "med" | "hard";

export type AttemptInput = {
  correct: boolean;
  timeTakenSec: number;
  difficulty: Difficulty;
};

export type TopicStatSnapshot = {
  attemptsTotal: number;
  correctTotal: number;
  avgTimeSec: number;
};

export type TopicStatComputed = {
  attemptsTotal: number;
  correctTotal: number;
  avgTimeSec: number;
  masteryScore: number; // 0-100
  nextRevisionDate: Date;
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function computeDifficultyFactor(difficulty: Difficulty, correct: boolean): number {
  const base = difficulty === "easy" ? 0.6 : difficulty === "med" ? 0.8 : 1.0;
  return correct ? base : base * 0.5;
}

/**
 * speedFactor derived from avgTimeSec:
 * <= 60 sec => 1.0
 * 60-180 => 1.0 down to 0.6
 * 180-600 => 0.6 down to 0.25
 * > 600 => 0.1
 */
function computeSpeedFactor(avgTimeSec: number): number {
  const t = Math.max(1, avgTimeSec);

  if (t <= 60) return 1.0;

  if (t <= 180) {
    const ratio = (t - 60) / 120;
    return 1.0 - ratio * (1.0 - 0.6);
  }

  if (t <= 600) {
    const ratio = (t - 180) / 420;
    return 0.6 - ratio * (0.6 - 0.25);
  }

  return 0.1;
}

export function computeMasteryScore(input: {
  attemptsTotal: number;
  correctTotal: number;
  avgTimeSec: number;
  lastAttempt: AttemptInput;
}): number {
  const accuracy =
    input.attemptsTotal > 0 ? input.correctTotal / input.attemptsTotal : 0;

  const speedFactor = computeSpeedFactor(input.avgTimeSec);
  const difficultyFactor = computeDifficultyFactor(
    input.lastAttempt.difficulty,
    input.lastAttempt.correct
  );

  const mastery =
    100 *
    (0.55 * accuracy +
      0.25 * speedFactor +
      0.20 * difficultyFactor);

  // store as float but stable to 2 decimals
  return clamp(Math.round(mastery * 100) / 100, 0, 100);
}

export function computeNextRevisionDate(params: {
  masteryScore: number;
  correct: boolean;
  now?: Date;
}): Date {
  const now = params.now ?? new Date();

  // if attempt incorrect => force revise tomorrow
  if (!params.correct) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return d;
  }

  const mastery = params.masteryScore;
  let days = 14;

  if (mastery < 40) days = 1;
  else if (mastery < 60) days = 3;
  else if (mastery < 80) days = 7;
  else days = 14;

  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Given previous TopicStat snapshot + new attempt => compute updated TopicStat fields
 */
export function updateTopicStatAfterAttempt(params: {
  prev: TopicStatSnapshot | null;
  attempt: AttemptInput;
  now?: Date;
}): TopicStatComputed {
  const now = params.now ?? new Date();

  const prevAttempts = params.prev?.attemptsTotal ?? 0;
  const prevCorrect = params.prev?.correctTotal ?? 0;
  const prevAvg = params.prev?.avgTimeSec ?? 0;

  const attemptsTotal = prevAttempts + 1;
  const correctTotal = prevCorrect + (params.attempt.correct ? 1 : 0);

  const avgTimeSec =
    attemptsTotal === 1
      ? params.attempt.timeTakenSec
      : Math.round(
          (prevAvg * prevAttempts + params.attempt.timeTakenSec) / attemptsTotal
        );

  const masteryScore = computeMasteryScore({
    attemptsTotal,
    correctTotal,
    avgTimeSec,
    lastAttempt: params.attempt,
  });

  const nextRevisionDate = computeNextRevisionDate({
    masteryScore,
    correct: params.attempt.correct,
    now,
  });

  return {
    attemptsTotal,
    correctTotal,
    avgTimeSec,
    masteryScore,
    nextRevisionDate,
  };
}
