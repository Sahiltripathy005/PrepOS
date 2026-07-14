import { Prisma } from "@prisma/client";
import { prisma } from "./client.js";
import { logger } from "../shared/logger.js";

export async function clearDatabase(): Promise<void> {
  try {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables 
      WHERE schemaname='public' AND tablename != '_prisma_migrations';
    `;

    for (const { tablename } of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
    }
    logger.debug("Database cleared successfully.");
  } catch (error) {
    logger.error("Failed to clear database during test cleanup", error as Error);
    throw error;
  }
}

export async function withRollback(fn: (tx: Prisma.TransactionClient) => Promise<void>): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await fn(tx);
      throw new Error("ROLLBACK_TRIGGER");
    });
  } catch (error) {
    if ((error as Error).message !== "ROLLBACK_TRIGGER") {
      throw error;
    }
  }
}

export class FactoryBuilder<CreateDTO> {
  constructor(private readonly generatorFn: (index: number) => CreateDTO) { }

  public build(overrides?: Partial<CreateDTO>, index = 0): CreateDTO {
    return {
      ...this.generatorFn(index),
      ...overrides
    };
  }

  public buildMany(count: number, overrides?: Partial<CreateDTO>): CreateDTO[] {
    return Array.from({ length: count }).map((_, i) => this.build(overrides, i));
  }
}
