import { execSync } from "node:child_process";
import { logger } from "../shared/logger.js";

export class MigrationManager {
  public static runDeploy(): string {
    logger.info("Executing database migration deploy (production)...");
    try {
      const output = execSync("npx prisma migrate deploy", { encoding: "utf8" });
      logger.info("Migration deploy completed successfully.");
      return output;
    } catch (error) {
      logger.error("Migration deploy failed", error as Error);
      throw error;
    }
  }

  public static runReset(): string {
    logger.info("Executing database migration reset...");
    try {
      const output = execSync("npx prisma migrate reset --force", { encoding: "utf8" });
      logger.info("Migration reset completed successfully.");
      return output;
    } catch (error) {
      logger.error("Migration reset failed", error as Error);
      throw error;
    }
  }

  public static getStatus(): string {
    logger.info("Retrieving database migration status...");
    try {
      const output = execSync("npx prisma migrate status", { encoding: "utf8" });
      return output;
    } catch (error) {
      logger.error("Failed to retrieve migration status", error as Error);
      throw error;
    }
  }
}
