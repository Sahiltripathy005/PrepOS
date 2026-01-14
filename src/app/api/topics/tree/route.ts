// src/app/api/topics/tree/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TopicNode = {
  id: number;
  name: string;
  category: string;
  children: TopicNode[];
};

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        parentId: true,
      },
      orderBy: [{ category: "asc" }, { parentId: "asc" }, { id: "asc" }],
    });

    const map = new Map<number, TopicNode>();
    const roots: TopicNode[] = [];

    // Create nodes
    for (const t of topics) {
      map.set(t.id, { id: t.id, name: t.name, category: t.category, children: [] });
    }

    // Link parent-child
    for (const t of topics) {
      const node = map.get(t.id)!;

      if (t.parentId == null) {
        roots.push(node);
      } else {
        const parent = map.get(t.parentId);
        if (parent) parent.children.push(node);
        else roots.push(node);
      }
    }

    return NextResponse.json({ tree: roots }, { status: 200 });
  } catch (err) {
    console.error("GET /api/topics/tree error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
