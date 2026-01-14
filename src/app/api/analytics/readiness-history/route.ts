// src/app/api/analytics/readiness-history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { computeReadinessForUser } from "@/lib/scheduler/readiness";

export const runtime = "nodejs"; // ✅ required (jwt/bcrypt + protected routes)

const QuerySchema = z.object({
  days: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 30))
    .refine((n) => Number.isFinite(n) && n >= 1 && n <= 365, "days must be between 1 and 365"),
});

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: NextRequest) {
  try {
    // ✅ auth
    const user = await requireUser(req);
    const userId = user.id;

    // ✅ parse query
    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query params", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const days = parsed.data.days;

    // ✅ boundaries
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // ✅ on-demand daily compute: if today's readiness missing, compute + insert
    const existingToday = await prisma.readinessHistory.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: { id: true },
    });

    if (!existingToday) {
      const readiness = await computeReadinessForUser(userId);

      await prisma.readinessHistory.create({
        data: {
          userId,
          date: today,
          overall: readiness.overall,
          dsa: readiness.dsa,
          apti: readiness.apti,
          cs: readiness.cs,
          dev: readiness.dev,
        },
      });
    }

    // ✅ fetch last N days of history
    const fromDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

    const history = await prisma.readinessHistory.findMany({
      where: {
        userId,
        date: { gte: fromDate, lte: today },
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        date: true,
        overall: true,
        dsa: true,
        apti: true,
        cs: true,
        dev: true,
      },
    });

    return NextResponse.json(
      {
        days,
        from: fromDate.toISOString(),
        to: today.toISOString(),
        history,
      },
      { status: 200 }
    );
  } catch (err) {
    // ✅ handle auth
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("GET /api/analytics/readiness-history error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}