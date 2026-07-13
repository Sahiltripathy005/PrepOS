import { describe, it, expect } from "vitest";
import { safeJsonStringify, safeJsonParse } from "./serialization.js";

describe("Serialization Layer", () => {
  it("should stringify BigInt values as strings", () => {
    const data = {
      id: 12345678901234567890n,
      title: "Task"
    };

    const str = safeJsonStringify(data);
    expect(str).toContain('"id":"12345678901234567890"');
  });

  it("should parse ISO date strings back into Date instances", () => {
    const originalDate = new Date("2026-07-13T12:00:00.000Z");
    const jsonString = JSON.stringify({ createdAt: originalDate });

    const parsed = safeJsonParse<{ createdAt: Date }>(jsonString);
    expect(parsed.createdAt).toBeInstanceOf(Date);
    expect(parsed.createdAt.getTime()).toBe(originalDate.getTime());
  });
});
