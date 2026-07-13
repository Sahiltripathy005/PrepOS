import { Request, Response, NextFunction } from "express";
import { ApplicationError, InternalServerError } from "../shared/errors.js";
import { logger } from "../shared/logger.js";
import { config } from "../config/index.js";

/* eslint-disable @typescript-eslint/no-unused-vars */
export function errorHandlerMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const correlationId = req.correlationId;
  let appError: ApplicationError;

  if (error instanceof ApplicationError) {
    appError = error;
  } else {
    logger.error(`Unhandled system error: ${error.message}`, error, { correlationId });
    appError = new InternalServerError("An unexpected server error occurred");
  }

  const statusCode = appError.statusCode;
  const payload = appError.toJSON();

  if (config.NODE_ENV !== "production") {
    const existingDetails =
      appError.details && typeof appError.details === "object"
        ? appError.details
        : { originalDetails: appError.details };

    payload.error.details = {
      ...existingDetails,
      stack: error.stack
    } as Record<string, unknown>;
  }

  res.status(statusCode).json(payload);
}
/* eslint-enable @typescript-eslint/no-unused-vars */
