import { Request, Response, NextFunction } from "express";
import { generateUuid } from "../shared/utils.js";
import { HEADERS } from "@placementos/types";

declare global {
  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = (req.headers[HEADERS.CORRELATION_ID] as string) || generateUuid();
  req.correlationId = correlationId;
  res.setHeader(HEADERS.CORRELATION_ID, correlationId);
  next();
}
