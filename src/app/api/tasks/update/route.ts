// src/app/api/tasks/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/**
 * PATCH /api/tasks/update
 * body: { taskId: string, status: "pending" | "done" | "skipped" }
 */

const patchTaskUpdateSchema = z.object({
  taskId: z.string().min(1, "taskId is required"),
  status: z.enum(["pending", "done", "skipped"]),
});

export async function PATCH(req: NextRequest) {
  try {
    // ✅ JWT protected
    const user = await requireUser(req);

    // ✅ parse + validate body with Zod
    const body = await req.json().catch(() => null);
    const parsed = patchTaskUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { taskId, status } = parsed.data;

    // ✅ ensure task exists and belongs to this user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: user.id,
      },
      select: { id: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // ✅ update status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        topic: true,
      },
    });

    return NextResponse.json({ task: updatedTask }, { status: 200 });
  } catch (err: unknown) {
    // ✅ strict-safe error handling
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("PATCH /api/tasks/update error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
