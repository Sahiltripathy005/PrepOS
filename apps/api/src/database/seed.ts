import { PrismaClient } from "@prisma/client";
import { logger } from "../shared/logger.js";
import { config } from "../config/index.js";

export abstract class BaseSeeder {
  public abstract readonly name: string;
  public abstract run(prisma: PrismaClient): Promise<void>;

  protected shouldRunInCurrentEnvironment(): boolean {
    // Prevent non-safe seeders in production unless overridden
    if (config.NODE_ENV === "production") {
      logger.warn(`Skipping seeder '${this.name}' - unsafe for production environment.`);
      return false;
    }
    return true;
  }
}

export class SeederRegistry {
  private readonly seeders: BaseSeeder[] = [];

  public register(seeder: BaseSeeder): void {
    this.seeders.push(seeder);
  }

  public async runAll(prisma: PrismaClient): Promise<void> {
    logger.info(`Starting execution of ${this.seeders.length} registered seeders...`);
    const startTime = Date.now();

    for (const seeder of this.seeders) {
      logger.info(`Executing seeder: ${seeder.name}`);
      const stepStart = Date.now();
      try {
        await seeder.run(prisma);
        logger.performance(`Seeder '${seeder.name}' finished`, Date.now() - stepStart);
      } catch (error) {
        logger.error(`Seeder '${seeder.name}' encountered an error`, error as Error);
        throw error;
      }
    }

    logger.info(`All database seeders completed successfully in ${Date.now() - startTime}ms`);
  }
}
