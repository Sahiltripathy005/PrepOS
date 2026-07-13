import { describe, it, expect } from "vitest";
import {
  getOffsetPagination,
  buildPaginationMetadata,
  buildSortOrder,
  isValidJson,
  getUtcStartOfDay,
  getUtcEndOfDay
} from "./utils.js";

describe("Database Utilities", () => {
  it("should calculate correct limit and offset for Prisma", () => {
    const res = getOffsetPagination({ limit: 15, offset: 30 });
    expect(res.take).toBe(15);
    expect(res.skip).toBe(30);
  });

  it("should create correct pagination metadata", () => {
    const meta = buildPaginationMetadata(50, 10, 20);
    expect(meta.limit).toBe(10);
    expect(meta.offset).toBe(20);
    expect(meta.total).toBe(50);
    expect(meta.hasNext).toBe(true);
  });

  it("should format sorting parameters for Prisma", () => {
    const orderBy = buildSortOrder({ field: "username", order: "desc" });
    expect(orderBy).toEqual({ username: "desc" });
  });

  it("should check if a string is valid JSON", () => {
    expect(isValidJson('{"test": true}')).toBe(true);
    expect(isValidJson("not json")).toBe(false);
  });

  it("should return UTC start and end of day", () => {
    const date = new Date("2026-07-13T12:00:00Z");
    const start = getUtcStartOfDay(date);
    const end = getUtcEndOfDay(date);

    expect(start.getUTCHours()).toBe(0);
    expect(start.getUTCMinutes()).toBe(0);
    expect(end.getUTCHours()).toBe(23);
    expect(end.getUTCMinutes()).toBe(59);
  });
});
