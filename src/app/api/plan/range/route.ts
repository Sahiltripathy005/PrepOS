import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getErrorMessage } from "@/lib/apiErrors";

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function parseISODateUTC(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);

    const parsed = querySchema.safeParse(
      Object.fromEntries(new URL(req.url).searchParams)
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query params", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { from, to } = parsed.data;

    const fromDate = parseISODateUTC(from);
    const toDate = parseISODateUTC(to);

    if (toDate < fromDate) {
      return NextResponse.json({ error: "'to' must be >= 'from'" }, { status: 400 });
    }

    // include tasks on `to` date
    const toExclusive = new Date(toDate);
    toExclusive.setUTCDate(toExclusive.getUTCDate() + 1);

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        date: {
          gte: fromDate,
          lt: toExclusive,
        },
      },
      orderBy: [{ date: "asc" }, { title: "asc" }],
      include: { topic: true },
    });

    return NextResponse.json({ ok: true, tasks });
  } catch (err: unknown) {
  const msg = getErrorMessage(err);

  if (msg === "UNAUTHORIZED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.error("GET /api/plan/range error:", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

}
