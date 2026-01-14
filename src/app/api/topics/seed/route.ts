// src/app/api/topics/seed/route.ts

import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { TOPICS_SEED, TopicSeedNode } from "@/lib/constants/topicsSeed";

function getBearerToken(req: NextRequest): string | null {
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) return null;

  const [type, token] = auth.split(" ");
  if (type !== "Bearer" || !token) return null;

  return token;
}

type AccessTokenPayload = JwtPayload & {
  userId?: string;
  id?: string;
  sub?: string;
};

function extractUserId(payload: AccessTokenPayload): string | null {
  if (typeof payload.userId === "string" && payload.userId.length > 0) {
    return payload.userId;
  }
  if (typeof payload.id === "string" && payload.id.length > 0) {
    return payload.id;
  }
  if (typeof payload.sub === "string" && payload.sub.length > 0) {
    return payload.sub;
  }
  return null;
}

function requireJwt(req: NextRequest): { userId: string } | null {
  const token = getBearerToken(req);
  if (!token) return null;

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is missing in env");

  try {
    const verified = jwt.verify(token, secret);

    // jwt.verify can return string OR JwtPayload
    if (typeof verified === "string") return null;

    const userId = extractUserId(verified as AccessTokenPayload);
    if (!userId) return null;

    return { userId };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireJwt(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingCount = await prisma.topic.count();

    // ✅ idempotent: do nothing if already seeded
    if (existingCount > 0) {
      return NextResponse.json(
        { seeded: false, message: "Topics already exist", count: existingCount },
        { status: 200 }
      );
    }

    const createdCount = await prisma.$transaction(async (tx) => {
      let created = 0;

      const insertSubtree = async (
        category: string,
        node: TopicSeedNode,
        parentId: number | null
      ) => {
        const topic = await tx.topic.create({
          data: {
            category,
            name: node.name,
            importanceScore: node.importanceScore,
            parentId,
          },
          select: { id: true },
        });

        created++;

        if (node.children?.length) {
          for (const child of node.children) {
            await insertSubtree(category, child, topic.id);
          }
        }
      };

      for (const categoryTree of TOPICS_SEED) {
        for (const root of categoryTree.roots) {
          await insertSubtree(categoryTree.category, root, null);
        }
      }

      return created;
    });

    return NextResponse.json({ seeded: true, createdCount }, { status: 201 });
  } catch (err) {
    console.error("POST /api/topics/seed error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
