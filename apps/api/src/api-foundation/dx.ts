import { logger } from "../shared/logger.js";
import { RouterRegistry } from "./routing.js";

export class ApiDx {
  public static printDiagnostics(port: number): void {
    logger.info("=========================================");
    logger.info("      PlacementOS Shared API Foundation");
    logger.info(`      Port: ${port}`);
    logger.info("      Status: ACTIVE");
    logger.info("=========================================");

    const routes = RouterRegistry.getRoutesMetadata();
    logger.info(`Discovered ${routes.length} versioned route endpoints:`);
    for (const route of routes) {
      logger.info(`  -> [${route.method.toUpperCase()}] ${route.path}`);
    }
    logger.info("=========================================");
  }
}
