import pino from "pino";
import { config } from "../config/index.js";

const baseLogger = pino({
  level: config.LOG_LEVEL || "info",
  timestamp: pino.stdTimeFunctions.isoTime
});

export const logger = {
  info(msg: string, context?: Record<string, unknown>): void {
    if (context) {
      baseLogger.info(context, msg);
    } else {
      baseLogger.info(msg);
    }
  },

  warn(msg: string, context?: Record<string, unknown>): void {
    if (context) {
      baseLogger.warn(context, msg);
    } else {
      baseLogger.warn(msg);
    }
  },

  error(msg: string, error?: Error, context?: Record<string, unknown>): void {
    const errorDetails = error
      ? {
          err: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        }
      : {};

    baseLogger.error({ ...errorDetails, ...context }, msg);
  },

  debug(msg: string, context?: Record<string, unknown>): void {
    if (context) {
      baseLogger.debug(context, msg);
    } else {
      baseLogger.debug(msg);
    }
  },

  context(bindings: Record<string, unknown>): pino.Logger {
    return baseLogger.child(bindings);
  },

  audit(action: string, actorId: string, metadata?: Record<string, unknown>): void {
    baseLogger.info(
      {
        logType: "AUDIT",
        action,
        actorId,
        timestamp: new Date().toISOString(),
        ...metadata
      },
      `AUDIT: ${action} by ${actorId}`
    );
  },

  performance(operation: string, durationMs: number, metadata?: Record<string, unknown>): void {
    baseLogger.info(
      {
        logType: "PERFORMANCE",
        operation,
        durationMs,
        ...metadata
      },
      `PERFORMANCE: ${operation} took ${durationMs}ms`
    );
  }
};
