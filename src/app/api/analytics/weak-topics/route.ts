// src/app/api/analytics/weak-topics/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getTopWeakTopics } from "@/lib/scheduler/weakness";

const QuerySchema = z.object({
  category: z.enum(["DSA", "APTI", "CS", "DEV"]).optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 10;
      const n = Number(val);
      return Number.isFinite(n) ? n : 10;
    })
    .refine((n) => n >= 1 && n <= 50, "limit must be between 1 and 50"),
});

function isErrorWithMessage(err: unknown): err is { message: string } {
  if (typeof err !== "object" || err === null) return false;

  const maybe = err as Record<string, unknown>;
  return typeof maybe.message === "string";
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const url = new URL(req.url);
    const queryParse = QuerySchema.safeParse({
      category: url.searchParams.get("category") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    if (!queryParse.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query params",
          issues: queryParse.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { category, limit } = queryParse.data;

    // 1) fetch all topics (optionally by category)
    const topics = await prisma.topic.findMany({
      where: category ? { category } : undefined,
      select: {
        id: true,
        name: true,
        category: true,
        importanceScore: true,
      },
    });

    // 2) fetch stats for user (optionally filtered by topic category)
    const stats = await prisma.topicStat.findMany({
      where: {
        userId: user.id,
        ...(category
          ? {
              topic: {
                category,
              },
            }
          : {}),
      },
      select: {
        topicId: true,
        masteryScore: true,
        attemptsTotal: true,
      },
    });

    // 3) index stats by topicId
    const statsByTopicId = new Map<
      number,
      { masteryScore: number; attemptsTotal: number }
    >();

    for (const s of stats) {
      statsByTopicId.set(s.topicId, {
        masteryScore: s.masteryScore ?? 0,
        attemptsTotal: s.attemptsTotal ?? 0,
      });
    }

    // 4) merge topics + stats (default mastery=0 attempts=0)
    const weakInput = topics.map((t) => {
      const s = statsByTopicId.get(t.id);
      return {
        topicId: t.id,
        name: t.name,
        category: t.category,
        importanceScore: t.importanceScore ?? 0,
        masteryScore: s?.masteryScore ?? 0,
        attemptsTotal: s?.attemptsTotal ?? 0,
      };
    });

    const results = getTopWeakTopics(weakInput, limit);

    return NextResponse.json({
      success: true,
      category: category ?? null,
      limit,
      count: results.length,
      items: results,
    });
  } catch (err: unknown) {
    console.error("GET /api/analytics/weak-topics error:", err);

    if (isErrorWithMessage(err) && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
