import type { Express } from "express";
import type http from "node:http";

let app: Express;
let server: http.Server;

try {
  const { ExpressAppFactory, setupGracefulShutdown } = await import("./api-foundation/bootstrap.js");
  const { ConnectionManager } = await import("./database/connection.js");
  const { config } = await import("./config/index.js");
  const { logger } = await import("./shared/logger.js");
  const { ApiDx } = await import("./api-foundation/dx.js");

  app = ExpressAppFactory.create();

  // Connect to the database during initialization
  await ConnectionManager.connect();

  server = app.listen(config.PORT, () => {
    ApiDx.printDiagnostics(config.PORT);
    logger.info(`Server successfully started on port ${config.PORT}`);
  });

  setupGracefulShutdown(server);
} catch (error) {
  if (error instanceof Error && error.name === "ConfigurationError") {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}

export { app, server };
