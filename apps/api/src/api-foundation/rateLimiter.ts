import { Request, Response, NextFunction } from "express";
import { RateLimitError } from "../shared/errors.js";

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}

export interface IRateLimiter {
  isRateLimited(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{
    limited: boolean;
    limit: number;
    remaining: number;
    resetTime: Date;
  }>;
}

export class MemoryRateLimiter implements IRateLimiter {
  private readonly hits = new Map<string, { count: number; resetTime: number }>();

  public async isRateLimited(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{
    limited: boolean;
    limit: number;
    remaining: number;
    resetTime: Date;
  }> {
    const now = Date.now();
    const record = this.hits.get(key);

    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs;
      this.hits.set(key, { count: 1, resetTime });
      return { limited: false, limit, remaining: limit - 1, resetTime: new Date(resetTime) };
    }

    record.count++;
    const remaining = Math.max(0, limit - record.count);
    const limited = record.count > limit;
    return { limited, limit, remaining, resetTime: new Date(record.resetTime) };
  }
}

export function createRateLimiterMiddleware(
  limiter: IRateLimiter,
  options: RateLimiterOptions,
  keyGenerator: (req: Request) => string
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = `${options.keyPrefix ?? "rl"}:${keyGenerator(req)}`;
      const result = await limiter.isRateLimited(key, options.max, options.windowMs);

      res.setHeader("X-RateLimit-Limit", result.limit.toString());
      res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
      res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetTime.getTime() / 1000).toString());

      if (result.limited) {
        throw new RateLimitError("Too many requests, please try again later.");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export const ipKeyGenerator = (req: Request): string => {
  return req.ip || (req.headers["x-forwarded-for"] as string) || "unknown-ip";
};

export const routeKeyGenerator = (req: Request): string => {
  return `${ipKeyGenerator(req)}:${req.method}:${req.path}`;
};
