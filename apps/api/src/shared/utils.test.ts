import { describe, it, expect } from "vitest";
import { clamp, chunk, pick, omit, generateUuid, retry } from "./utils.js";

describe("Utility Helpers", () => {
  it("should clamp values correctly", () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(0, 1, 10)).toBe(1);
    expect(clamp(15, 1, 10)).toBe(10);
  });

  it("should chunk arrays correctly", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("should pick properties from objects", () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(pick(obj, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });

  it("should omit properties from objects", () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(omit(obj, ["b"])).toEqual({ a: 1, c: 3 });
  });

  it("should generate valid UUIDs", () => {
    const uuid = generateUuid();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("should retry failed async function and eventually succeed", async () => {
    let calls = 0;
    const fn = async () => {
      calls++;
      if (calls < 3) throw new Error("Fail");
      return "Success";
    };

    const res = await retry(fn, 3, 10, 1.5);
    expect(res).toBe("Success");
    expect(calls).toBe(3);
  });

  it("should fail retry if max retries exceeded", async () => {
    const fn = async () => {
      throw new Error("Always Fail");
    };

    await expect(retry(fn, 2, 5, 1.2)).rejects.toThrow("Always Fail");
  });
});
