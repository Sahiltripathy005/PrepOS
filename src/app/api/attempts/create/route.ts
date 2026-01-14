import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { attemptCreateSchema } from "@/lib/validators";
import { requireUser } from "@/lib/auth";
import { updateTopicStatAfterAttempt } from "@/lib/scheduler/spacedRepetition";

function getErrorMessage(err: unknown): string | null {
  if (typeof err === "object" && err !== null && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    return typeof msg === "string" ? msg : null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // 1) JWT Protected
    const user = await requireUser(req);

    // 2) Validate body
    const body = await req.json();
    const parsed = attemptCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { topicId, difficulty, correct, timeTakenSec, confidence, mistakeTag, taskId } =
      parsed.data;

    // 3) Ensure topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { id: true },
    });

    if (!topic) {
      return NextResponse.json({ error: "Invalid topicId" }, { status: 404 });
    }

    // 4) If taskId provided, ensure it belongs to this user
    if (taskId) {
      const task = await prisma.task.findFirst({
        where: { id: taskId, userId: user.id },
        select: { id: true },
      });

      if (!task) {
        return NextResponse.json(
          { error: "Invalid taskId (not found for this user)" },
          { status: 404 }
        );
      }
    }

    const now = new Date();

    // ✅ 5) Atomic write (attempt + topic stat)
    const result = await prisma.$transaction(async (tx) => {
      // Save attempt
      const attempt = await tx.attemptLog.create({
        data: {
          userId: user.id,
          taskId: taskId ?? null,
          topicId,
          difficulty, // stored as string in schema
          correct,
          timeTakenSec,
          confidence,
          mistakeTag,
        },
      });

      // Fetch previous TopicStat snapshot
      const prevStat = await tx.topicStat.findUnique({
        where: {
          userId_topicId: {
            userId: user.id,
            topicId,
          },
        },
        select: {
          attemptsTotal: true,
          correctTotal: true,
          avgTimeSec: true,
        },
      });

      // Compute new stats
      const computed = updateTopicStatAfterAttempt({
        prev: prevStat,
        attempt: {
          correct,
          timeTakenSec,
          difficulty,
        },
        now,
      });

      // Upsert TopicStat
      const topicStat = await tx.topicStat.upsert({
        where: {
          userId_topicId: {
            userId: user.id,
            topicId,
          },
        },
        create: {
          userId: user.id,
          topicId,
          attemptsTotal: computed.attemptsTotal,
          correctTotal: computed.correctTotal,
          avgTimeSec: computed.avgTimeSec,
          masteryScore: computed.masteryScore,
          lastPracticedAt: now,
          nextRevisionDate: computed.nextRevisionDate,
        },
        update: {
          attemptsTotal: computed.attemptsTotal,
          correctTotal: computed.correctTotal,
          avgTimeSec: computed.avgTimeSec,
          masteryScore: computed.masteryScore,
          lastPracticedAt: now,
          nextRevisionDate: computed.nextRevisionDate,
        },
      });

      return { attempt, topicStat };
    });

    return NextResponse.json(
      { attempt: result.attempt, topicStat: result.topicStat },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = getErrorMessage(err);

    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("POST /api/attempts/create error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
