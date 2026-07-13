import { prisma } from "./client.js";
import { logger } from "../shared/logger.js";
import { InternalServerError } from "../shared/errors.js";

export class ConnectionManager {
  private static isShuttingDown = false;

  public static async connect(retries = 5, delayMs = 1000): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await prisma.$connect();
        logger.info("Successfully connected to the database.");
        return;
      } catch (error) {
        logger.warn(`Failed database connection attempt ${attempt}/${retries}`, {
          error: (error as Error).message
        });
        if (attempt === retries) {
          logger.error("All database connection attempts failed.", error as Error);
          throw new InternalServerError("Database connection failure");
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  public static async disconnect(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    logger.info("Disconnecting from database...");
    try {
      await prisma.$disconnect();
      logger.info("Database connection disconnected gracefully.");
    } catch (error) {
      logger.error("Error during database disconnection", error as Error);
    }
  }

  public static async checkHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs?: number }> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: "UP",
        latencyMs: Date.now() - start
      };
    } catch (error) {
      logger.error("Database health check failed", error as Error);
      return { status: "DOWN" };
    }
  }

  public static async runDiagnostics(): Promise<Record<string, unknown>> {
    const health = await this.checkHealth();
    return {
      database: health.status,
      latencyMs: health.latencyMs,
      timestamp: new Date().toISOString(),
      poolSize: process.env.DATABASE_URL?.includes("connection_limit")
        ? parseInt(process.env.DATABASE_URL.split("connection_limit=")[1].split("&")[0], 10)
        : "default"
    };
  }
}
