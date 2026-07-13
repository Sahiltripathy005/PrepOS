import { PrismaClient } from "@prisma/client";
import { BaseSeeder, SeederRegistry } from "../src/database/seed.js";
import { logger } from "../src/shared/logger.js";

class UserSeeder extends BaseSeeder {
  public readonly name = "UserSeeder";

  public async run(prisma: PrismaClient): Promise<void> {
    if (!this.shouldRunInCurrentEnvironment()) return;

    const count = await prisma.user.count();
    if (count > 0) {
      logger.info("Users already exist in database, skipping UserSeeder execution.");
      return;
    }

    await prisma.user.create({
      data: {
        email: "admin@placementos.com",
        username: "system_admin"
      }
    });

    logger.info("Default administrator account successfully seeded.");
  }
}

const prisma = new PrismaClient();

async function main() {
  const registry = new SeederRegistry();
  registry.register(new UserSeeder());
  await registry.runAll(prisma);
}

main()
  .catch((error) => {
    logger.error("Database seeding registry runner failed", error as Error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
