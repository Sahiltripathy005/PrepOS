import { ExpressAppFactory, setupGracefulShutdown } from "./api-foundation/bootstrap.js";
import { ConnectionManager } from "./database/connection.js";
import { config } from "./config/index.js";
import { logger } from "./shared/logger.js";
import { ApiDx } from "./api-foundation/dx.js";

const app = ExpressAppFactory.create();

// Connect to the database during initialization
await ConnectionManager.connect();

const server = app.listen(config.PORT, () => {
  ApiDx.printDiagnostics(config.PORT);
  logger.info(`Server successfully started on port ${config.PORT}`);
});

setupGracefulShutdown(server);

export { app, server };
