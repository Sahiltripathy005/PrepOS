// src/lib/scheduler/weakness.ts

export type WeakTopicInput = {
  topicId: number;
  name: string;
  category: string;
  importanceScore: number;
  masteryScore: number; // 0..100
  attemptsTotal: number; // >= 0
};

export type WeakTopicOutput = WeakTopicInput & {
  priority: number;
};

export function computeWeaknessPriority(params: {
  importanceScore: number;
  masteryScore: number;
  attemptsTotal: number;
}): number {
  const { importanceScore, masteryScore, attemptsTotal } = params;

  const safeImportance = Number.isFinite(importanceScore) ? importanceScore : 0;
  const safeMastery = Number.isFinite(masteryScore) ? masteryScore : 0;
  const safeAttempts = Number.isFinite(attemptsTotal) ? attemptsTotal : 0;

  const masteryClamped = Math.max(0, Math.min(100, safeMastery));
  const attemptsClamped = Math.max(0, safeAttempts);

  // IMPORTANT:
  // log(1 + attemptsTotal) becomes 0 when attemptsTotal=0 => priority always 0
  // to allow weak topic discovery for "never attempted" topics, we use at least 1 attempt
  const effectiveAttempts = Math.max(1, attemptsClamped);

  // priority = importanceScore * (1 - mastery/100) * log(1 + attemptsTotal)
  const priority =
    safeImportance *
    (1 - masteryClamped / 100) *
    Math.log(1 + effectiveAttempts);

  if (!Number.isFinite(priority) || priority < 0) return 0;

  return Math.round(priority * 1000) / 1000;
}

export function getTopWeakTopics(
  topics: WeakTopicInput[],
  limit = 10
): WeakTopicOutput[] {
  const computed: WeakTopicOutput[] = topics.map((t) => ({
    ...t,
    priority: computeWeaknessPriority({
      importanceScore: t.importanceScore,
      masteryScore: t.masteryScore,
      attemptsTotal: t.attemptsTotal,
    }),
  }));

  return computed
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}
