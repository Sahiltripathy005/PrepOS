// src/app/api/plan/generate/route.ts
import { getErrorMessage } from "@/lib/apiErrors";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generatePlanTasks } from "@/lib/scheduler/planGenerator";

const querySchema = z.object({
  days: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 30))
    .refine((n) => Number.isFinite(n) && n >= 1 && n <= 365, "days must be 1..365"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const parsedQuery = querySchema.safeParse(
      Object.fromEntries(new URL(req.url).searchParams)
    );
    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query params", details: parsedQuery.error.flatten() },
        { status: 400 }
      );
    }

    const { days } = parsedQuery.data;

    const goal = await prisma.goal.findFirst({
      where: { userId: user.id },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not set" }, { status: 400 });
    }

    // Use goal.startDate as base, but generate from "today or startDate" whichever is later
    const todayUTC = new Date(Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    ));

    const base = goal.startDate > todayUTC ? goal.startDate : todayUTC;

    const { tasks } = await generatePlanTasks({
      userId: user.id,
      days,
      startDate: base,
    });

    // Prevent duplicates: delete tasks within generated range createdBy=system
    const from = base;
    const to = new Date(from);
    to.setUTCDate(to.getUTCDate() + days);

    await prisma.task.deleteMany({
      where: {
        userId: user.id,
        createdBy: "system",
        date: {
          gte: from,
          lt: to,
        },
      },
    });

    const created = await prisma.task.createMany({
      data: tasks.map((t) => ({
        userId: t.userId,
        date: t.date,
        type: t.type,
        topicId: t.topicId,
        title: t.title,
        durationMin: t.durationMin,
        difficulty: t.difficulty,
        status: t.status,
        createdBy: t.createdBy,
      })),
    });

    return NextResponse.json({
      ok: true,
      days,
      startDate: base.toISOString().slice(0, 10),
      createdCount: created.count,
    });
  } catch (err: unknown) {
  const msg = getErrorMessage(err);

  if (msg === "UNAUTHORIZED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (msg === "NO_GOAL") {
    return NextResponse.json({ error: "Goal not set" }, { status: 400 });
  }

  console.error("POST /api/plan/generate error:", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

}
