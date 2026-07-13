import { Request, Response, NextFunction } from "express";
import { logger } from "../shared/logger.js";

export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = process.hrtime();
  const { method, url, ip } = req;
  const correlationId = req.correlationId;

  logger.info(`HTTP Request: ${method} ${url}`, {
    correlationId,
    method,
    url,
    ip,
    userAgent: req.headers["user-agent"]
  });

  res.on("finish", () => {
    const diff = process.hrtime(startTime);
    const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;
    const { statusCode } = res;

    logger.performance(`HTTP Response: ${method} ${url}`, durationMs, {
      correlationId,
      method,
      url,
      statusCode
    });
  });

  next();
}
