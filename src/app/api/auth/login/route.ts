import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { signAccessToken, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, passwordHash: true, createdAt: true },
    });

    if (!user) {
      // Avoid user enumeration signal
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        accessToken,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("LOGIN_ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
