import { PaginationParams, SortParams, PaginationMetadata } from "@placementos/types";
import { prisma } from "./client.js";

export function getOffsetPagination(params?: PaginationParams): { take: number; skip: number } {
  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;
  return { take: limit, skip: offset };
}

export function buildPaginationMetadata(
  total: number,
  limit: number,
  offset: number
): PaginationMetadata {
  return {
    type: "offset" as const,
    limit,
    offset,
    total,
    hasNext: offset + limit < total
  };
}

export function buildSortOrder(params?: SortParams): Record<string, "asc" | "desc"> | undefined {
  if (!params?.field) return undefined;
  return {
    [params.field]: params.order
  };
}

export async function runInTransaction<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (tx: any) => Promise<T>,
  options?: { maxWait?: number; timeout?: number }
): Promise<T> {
  return prisma.$transaction(fn, options);
}

export function isValidJson(val: string): boolean {
  try {
    JSON.parse(val);
    return true;
  } catch {
    return false;
  }
}

export function getUtcStartOfDay(date = new Date()): Date {
  const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
  return new Date(utc);
}

export function getUtcEndOfDay(date = new Date()): Date {
  const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999);
  return new Date(utc);
}
