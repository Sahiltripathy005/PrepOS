import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import http from "node:http";
import crypto from "node:crypto";
import { config } from "../config/index.js";
import { logger } from "../shared/logger.js";
import { contextStorage } from "./context.js";
import { ObservabilityRegistry } from "./observability.js";
import { RouterRegistry } from "./routing.js";
import { ApplicationError, NotFoundError } from "../shared/errors.js";
import { ConnectionManager } from "../database/connection.js";

export class ExpressAppFactory {
  public static create(): Express {
    const app = express();

    app.use(helmet());
    app.use(compression());
    app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
    app.use(express.json());

    // Context binding middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      const correlationId = (req.headers["x-correlation-id"] ||
        req.headers["x-request-id"] ||
        crypto.randomUUID()) as string;
      const traceId = crypto.randomUUID();
      const startTime = Date.now();

      res.setHeader("x-correlation-id", correlationId);

      contextStorage.run(
        {
          correlationId,
          traceId,
          userId: undefined,
          locale: (req.headers["accept-language"] || "en").split(",")[0],
          timezone: (req.headers["x-timezone"] || "UTC") as string,
          startTime
        },
        () => {
          next();
        }
      );
    });

    // Observability recording middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      res.on("finish", () => {
        const durationMs = Date.now() - startTime;
        ObservabilityRegistry.recordMetric({
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          durationMs
        });
      });
      next();
    });

    // Health, Liveness, and Readiness endpoints
    app.get("/health", async (_req: Request, res: Response) => {
      const health = await ConnectionManager.checkHealth();
      res.status(health.status === "UP" ? 200 : 503).json({
        status: health.status,
        timestamp: new Date().toISOString(),
        database: health.status
      });
    });

    app.get("/liveness", (_req: Request, res: Response) => {
      res.status(200).send("OK");
    });

    app.get("/readiness", async (_req: Request, res: Response) => {
      const health = await ConnectionManager.checkHealth();
      res.status(health.status === "UP" ? 200 : 503).send(health.status === "UP" ? "OK" : "DOWN");
    });

    // Mount v1 router
    app.use("/api/v1", RouterRegistry.getV1Router());

    // Method not allowed / 404 handler for unmatched routes
    app.use((req: Request, res: Response, next: NextFunction) => {
      next(new NotFoundError(`Route '${req.method} ${req.path}' not found.`));
    });

    // Global Error Handler
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
      const statusCode = err instanceof ApplicationError ? err.statusCode : 500;
      const payload = err instanceof ApplicationError ? err.toJSON() : {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "An unexpected error occurred."
        }
      };

      if (statusCode >= 500) {
        logger.error(`Unhandled API error: ${err instanceof Error ? err.message : String(err)}`, err as Error);
      } else {
        logger.warn(`Client validation/flow warning: ${err instanceof Error ? err.message : String(err)}`);
      }

      res.status(statusCode).json(payload);
    });

    return app;
  }
}

export function setupGracefulShutdown(server: http.Server): void {
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Commencing graceful shutdown of HTTP server...`);
    server.close(async () => {
      logger.info("HTTP server closed.");
      await ConnectionManager.disconnect();
      logger.info("Graceful shutdown completed successfully.");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Shutdown grace period exceeded, forcing exit.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
