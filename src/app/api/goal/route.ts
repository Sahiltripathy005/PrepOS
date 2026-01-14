import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/validators";
import { getBearerToken, verifyAccessToken } from "@/lib/auth";

function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}

export async function GET(req: NextRequest) {
  try {
    const token = getBearerToken(req);
    if (!token) return unauthorized("Missing Bearer token");

    const payload = verifyAccessToken(token);
    const userId = payload.sub;

    const goal = await prisma.goal.findFirst({
      where: { userId },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ goal: goal ?? null }, { status: 200 });
  } catch (err: unknown) {
    return unauthorized(getErrorMessage(err));
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getBearerToken(req);
    if (!token) return unauthorized("Missing Bearer token");

    const payload = verifyAccessToken(token);
    const userId = payload.sub;

    const body = await req.json();
    const parsed = goalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existingGoal = await prisma.goal.findFirst({
      where: { userId },
      select: { id: true },
    });

    const dbPayload = {
      userId,
      targetRole: data.targetRole,
      targetCompanies: data.targetCompanies,
      timelineDays: data.timelineDays,
      hoursPerDay: data.hoursPerDay,
      startDate: new Date(data.startDate),
      wDsa: data.wDsa,
      wApti: data.wApti,
      wCs: data.wCs,
      wDev: data.wDev,
      difficultyCurve: data.difficultyCurve,
    };

    const goal = existingGoal
      ? await prisma.goal.update({
          where: { id: existingGoal.id },
          data: dbPayload,
        })
      : await prisma.goal.create({
          data: dbPayload,
        });

    return NextResponse.json({ goal }, { status: 200 });
  } catch (err: unknown) {
    const message = getErrorMessage(err);

    if (
      message.toLowerCase().includes("token") ||
      message.toLowerCase().includes("jwt") ||
      message.toLowerCase().includes("unauth")
    ) {
      return unauthorized(message);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
