// src/lib/scheduler/planGenerator.ts
import { prisma } from "@/lib/prisma";

export type PlanGenerateInput = {
  userId: string;
  days: number;
  startDate: Date;
};

type GoalLike = {
  id: string;
  userId: string;
  timelineDays: number;
  hoursPerDay: number;
  startDate: Date;
  wDsa: number;
  wApti: number;
  wCs: number;
  wDev: number;
};

type Category = "DSA" | "APTI" | "CS" | "DEV";
type TaskType = "solve" | "revise" | "mock" | "notes" | "project";
type Difficulty = "easy" | "med" | "hard";

const CATEGORY_TASK_TYPE: Record<Category, TaskType> = {
  DSA: "solve",
  APTI: "solve",
  CS: "notes",
  DEV: "project",
};

const CATEGORY_TITLE_PREFIX: Record<Category, string> = {
  DSA: "DSA",
  APTI: "Aptitude",
  CS: "CS",
  DEV: "Dev",
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDaysUTC(date: Date, days: number) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toISODateUTC(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeWeights(goal: GoalLike) {
  const weights = {
    DSA: goal.wDsa,
    APTI: goal.wApti,
    CS: goal.wCs,
    DEV: goal.wDev,
  };

  const sum = Object.values(weights).reduce((a, b) => a + b, 0);

  // prevent division by zero
  if (sum <= 0) {
    return { DSA: 0.25, APTI: 0.25, CS: 0.25, DEV: 0.25 };
  }

  return {
    DSA: weights.DSA / sum,
    APTI: weights.APTI / sum,
    CS: weights.CS / sum,
    DEV: weights.DEV / sum,
  };
}

function computeDailyMinutes(hoursPerDay: number) {
  // keep it sane; 1..12 hours
  const h = clamp(hoursPerDay, 1, 12);
  return h * 60;
}

/**
 * Choose difficulty based on "difficulty curve".
 * v1 simple curve: start easy, mid med, end hard
 */
function difficultyForDay(dayIndex: number, totalDays: number): Difficulty {
  if (totalDays <= 0) return "easy";
  const t = dayIndex / totalDays;
  if (t < 0.33) return "easy";
  if (t < 0.75) return "med";
  return "hard";
}

function isMockDay(dayIndex: number) {
  // every 7th day = mock day
  return (dayIndex + 1) % 7 === 0;
}

function isRevisionDay(dayIndex: number) {
  // mid-week revision cadence
  return (dayIndex + 1) % 4 === 0;
}

/**
 * Topics selection logic:
 * v1: importanceScore desc
 * + placeholder weak topics hook (later will use TopicStat)
 */
async function getTopicsByCategory(userId: string, category: Category, limit: number) {
  // For v1: just pick top by importanceScore
  const topics = await prisma.topic.findMany({
    where: { category },
    orderBy: [{ importanceScore: "desc" }, { id: "asc" }],
    take: limit,
    select: { id: true, name: true, importanceScore: true },
  });

  // weak topics placeholder (future):
  // - you will later fetch TopicStat for userId and re-rank
  // - for now simply return top important topics
  return topics;
}

function allocateMinutesByWeights(totalMinutes: number, weights: Record<Category, number>) {
  const entries = Object.entries(weights) as Array<[Category, number]>;

  const raw = entries.map(([cat, w]) => ({
    cat,
    minutes: totalMinutes * w,
  }));

  // floor then distribute remainder
  const floored = raw.map((x) => ({ ...x, minutes: Math.floor(x.minutes) }));
  const used = floored.reduce((a, b) => a + b.minutes, 0);
  let remaining = totalMinutes - used;

  // distribute leftover minutes to highest weight first
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const result: Record<Category, number> = {
    DSA: 0,
    APTI: 0,
    CS: 0,
    DEV: 0,
  };

  for (const f of floored) result[f.cat] = f.minutes;

  let i = 0;
  while (remaining > 0) {
    const cat = sorted[i % sorted.length][0];
    result[cat] += 1;
    remaining--;
    i++;
  }

  return result;
}

function splitIntoBlocks(categoryMinutes: number) {
  /**
   * Convert minutes into blocks.
   * We try for 45-90 min blocks, max 3 blocks/category/day.
   */
  const blocks: number[] = [];
  let remaining = categoryMinutes;

  while (remaining > 0 && blocks.length < 3) {
    const size =
      remaining >= 90 ? 90 :
      remaining >= 60 ? 60 :
      remaining >= 45 ? 45 :
      remaining;

    blocks.push(size);
    remaining -= size;
  }

  if (remaining > 0 && blocks.length > 0) {
    // push remainder into last block
    blocks[blocks.length - 1] += remaining;
  }

  return blocks.filter((x) => x > 0);
}

export type GeneratedTaskInput = {
  userId: string;
  date: Date;
  type: TaskType;
  topicId: number | null;
  title: string;
  durationMin: number;
  difficulty: Difficulty;
  status: "pending";
  createdBy: "system";
};

export async function generatePlanTasks(input: PlanGenerateInput) {
  const { userId, days, startDate } = input;

  const goal = await prisma.goal.findFirst({
    where: { userId },
  });

  if (!goal) {
    throw new Error("NO_GOAL");
  }

  const normalizedWeights = normalizeWeights(goal as unknown as GoalLike);
  const totalDays = clamp(days, 1, 365);

  // Preload topics per category (v1: top important)
  const topicPool = {
    DSA: await getTopicsByCategory(userId, "DSA", 30),
    APTI: await getTopicsByCategory(userId, "APTI", 30),
    CS: await getTopicsByCategory(userId, "CS", 30),
    DEV: await getTopicsByCategory(userId, "DEV", 30),
  };

  const dailyMinutes = computeDailyMinutes(goal.hoursPerDay);

  const tasks: GeneratedTaskInput[] = [];

  const topicCursor: Record<Category, number> = { DSA: 0, APTI: 0, CS: 0, DEV: 0 };

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
    const date = addDaysUTC(startOfDayUTC(startDate), dayIndex);

    // Mock day
    if (isMockDay(dayIndex)) {
      tasks.push({
        userId,
        date,
        type: "mock",
        topicId: null,
        title: `Mock Test + Analysis (${toISODateUTC(date)})`,
        durationMin: Math.min(180, dailyMinutes),
        difficulty: "med",
        status: "pending",
        createdBy: "system",
      });

      const remaining = dailyMinutes - Math.min(180, dailyMinutes);
      if (remaining > 0) {
        tasks.push({
          userId,
          date,
          type: "revise",
          topicId: null,
          title: `Revision backlog cleanup`,
          durationMin: remaining,
          difficulty: "easy",
          status: "pending",
          createdBy: "system",
        });
      }
      continue;
    }

    // Regular day allocation
    const minutesByCat = allocateMinutesByWeights(dailyMinutes, normalizedWeights);

    for (const category of ["DSA", "APTI", "CS", "DEV"] as Category[]) {
      const catMinutes = minutesByCat[category];
      if (catMinutes <= 0) continue;

      const blocks = splitIntoBlocks(catMinutes);
      const pool = topicPool[category];

      for (const blockMin of blocks) {
        const cursor = topicCursor[category] % Math.max(pool.length, 1);
        const chosen = pool.length > 0 ? pool[cursor] : null;

        topicCursor[category]++;

        const diff = difficultyForDay(dayIndex, totalDays);

        // Add periodic revision block
        const doRevision = isRevisionDay(dayIndex) && blockMin >= 45 && category !== "DEV";

        const type: TaskType = doRevision ? "revise" : CATEGORY_TASK_TYPE[category];

        const title = chosen
          ? `${CATEGORY_TITLE_PREFIX[category]}: ${chosen.name} (${type})`
          : `${CATEGORY_TITLE_PREFIX[category]}: Practice (${type})`;

        tasks.push({
          userId,
          date,
          type,
          topicId: chosen?.id ?? null,
          title,
          durationMin: blockMin,
          difficulty: diff,
          status: "pending",
          createdBy: "system",
        });
      }
    }
  }

  return {
    goal,
    tasks,
  };
}
