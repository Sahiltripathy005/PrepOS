import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
/**
 * GET /api/analytics/dashboard
 * Returns:
 * - readiness (overall + per category)
 * - weak topics (top 5)
 * - attempts trend (last 14 days: count + accuracy)
 * - revision queue size
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const now = new Date();

    // ---------- Readiness: latest snapshot ----------
    const latestReadiness = await prisma.readinessHistory.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      select: {
        date: true,
        overall: true,
        dsa: true,
        apti: true,
        cs: true,
        dev: true,
      },
    });

    const readiness = latestReadiness ?? {
      date: null,
      overall: 0,
      dsa: 0,
      apti: 0,
      cs: 0,
      dev: 0,
    };

    // ---------- Revision queue size ----------
    // "due" revision topics: nextRevisionDate <= now
    const revisionQueueSize = await prisma.topicStat.count({
      where: {
        userId,
        nextRevisionDate: { lte: now },
      },
    });

    // ---------- Weak topics top 5 ----------
    // priority = importanceScore * (1 - mastery/100) * log(1 + attemptsTotal)
    const weakCandidates = await prisma.topicStat.findMany({
      where: { userId },
      select: {
        topicId: true,
        masteryScore: true,
        attemptsTotal: true,
        lastPracticedAt: true,
        nextRevisionDate: true,
        topic: {
          select: {
            id: true,
            name: true,
            category: true,
            importanceScore: true,
          },
        },
      },
      take: 4000, // safety cap
    });

    const weakTopics = weakCandidates
      .map((s) => {
        const mastery = clampNumber(s.masteryScore ?? 0, 0, 100);
        const attempts = Math.max(0, s.attemptsTotal ?? 0);
        const imp = Math.max(0, s.topic?.importanceScore ?? 0);

        const priority = imp * (1 - mastery / 100) * Math.log(1 + attempts);

        return {
          topicId: s.topicId,
          name: s.topic?.name ?? "Unknown",
          category: s.topic?.category ?? "DSA",
          importanceScore: imp,
          masteryScore: mastery,
          attemptsTotal: attempts,
          priority: round2(priority),
          lastPracticedAt: s.lastPracticedAt,
          nextRevisionDate: s.nextRevisionDate,
        };
      })
      .filter((t) => t.masteryScore < 80)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);

    // ---------- Last 14 days attempts count + accuracy trend ----------
    const days = 14;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - (days - 1));
    fromDate.setHours(0, 0, 0, 0);

    const trendRows = await prisma.$queryRaw<
      Array<{
        day: string; // 'YYYY-MM-DD'
        attempts: number;
        correct: number;
      }>
    >`
      SELECT
        to_char(date_trunc('day', "createdAt")::date, 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS attempts,
        SUM(CASE WHEN "correct" = true THEN 1 ELSE 0 END)::int AS correct
      FROM "AttemptLog"
      WHERE "userId" = ${userId}
        AND "createdAt" >= ${fromDate}
      GROUP BY 1
      ORDER BY 1 ASC;
    `;

    // Fill missing days with zeros
    const trendMap = new Map<string, { attempts: number; correct: number }>();
    for (const r of trendRows) {
      trendMap.set(r.day, { attempts: r.attempts, correct: r.correct });
    }

    const attemptsTrend: Array<{
      date: string;
      attempts: number;
      accuracy: number; // 0..100
    }> = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(fromDate);
      d.setDate(fromDate.getDate() + i);

      const key = toISODateKey(d);
      const entry = trendMap.get(key) ?? { attempts: 0, correct: 0 };

      const accuracy =
        entry.attempts === 0 ? 0 : (entry.correct / entry.attempts) * 100;

      attemptsTrend.push({
        date: key,
        attempts: entry.attempts,
        accuracy: round2(accuracy),
      });
    }

    const totalAttempts14d = attemptsTrend.reduce((a, b) => a + b.attempts, 0);
    const weightedAccuracy14d = (() => {
      const correctSum = trendRows.reduce((a, b) => a + (b.correct ?? 0), 0);
      const attemptsSum = trendRows.reduce((a, b) => a + (b.attempts ?? 0), 0);
      return attemptsSum === 0 ? 0 : (correctSum / attemptsSum) * 100;
    })();

    return NextResponse.json(
      {
        readiness,
        weakTopics,
        attemptsTrend,
        revisionQueueSize,
        summary: {
          totalAttempts14d,
          avgAccuracy14d: round2(weightedAccuracy14d),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/analytics/dashboard error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/** ---------- helpers ---------- */

function toISODateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function clampNumber(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
