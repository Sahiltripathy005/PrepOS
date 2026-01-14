// scripts/dedupeTasks.ts
import { prisma } from "../src/lib/prisma";

async function main() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ date: "asc" }, { id: "asc" }],
    select: {
      id: true,
      userId: true,
      date: true,
      title: true,
    },
  });

  const seen = new Set<string>();
  const dupIds: string[] = [];

  for (const t of tasks) {
    // Unique key (same as constraint)
    const key = `${t.userId}::${t.date.toISOString()}::${t.title}`;

    if (seen.has(key)) {
      dupIds.push(t.id);
    } else {
      seen.add(key);
    }
  }

  if (dupIds.length === 0) {
    console.log("✅ No duplicate tasks found.");
    return;
  }

  console.log(`⚠️ Found duplicates: ${dupIds.length}`);
  await prisma.task.deleteMany({
    where: { id: { in: dupIds } },
  });

  console.log("✅ Deleted duplicate tasks successfully.");
}

main()
  .catch((e) => {
    console.error("❌ dedupe failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
