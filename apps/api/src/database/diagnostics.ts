import { ConnectionManager } from "./connection.js";
import { MigrationManager } from "./migrations.js";
import { logger } from "../shared/logger.js";

export class DatabaseDiagnostics {
  public static async run(): Promise<Record<string, unknown>> {
    logger.info("Running database diagnostic suite...");
    const connectionDiagnostics = await ConnectionManager.runDiagnostics();

    let migrations = "";
    try {
      migrations = MigrationManager.getStatus();
    } catch (error) {
      migrations = `Failed to retrieve migration status: ${(error as Error).message}`;
    }

    return {
      connection: connectionDiagnostics,
      migrations,
      timestamp: new Date().toISOString()
    };
  }
}
