import { PrismaClient } from "@prisma/client";
import { logger } from "../shared/logger.js";
import { config } from "../config/index.js";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const prismaLogOptions =
  config.NODE_ENV === "development"
    ? [
        { emit: "event" as const, level: "query" as const },
        { emit: "stdout" as const, level: "error" as const },
        { emit: "stdout" as const, level: "info" as const },
        { emit: "stdout" as const, level: "warn" as const }
      ]
    : [{ emit: "stdout" as const, level: "error" as const }];

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: prismaLogOptions
  });

if (config.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

// Register query logging listener in development environment
if (config.NODE_ENV === "development") {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  (prisma as any).$on("query", (e: { query: string; params: string; duration: number }) => {
    logger.debug(`Prisma Query`, {
      query: e.query,
      params: e.params,
      durationMs: e.duration
    });
  });
}
