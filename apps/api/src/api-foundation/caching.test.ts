import { describe, it, expect } from "vitest";
import { MemoryCacheService, generateCacheKey } from "./caching.js";

describe("Caching Foundation", () => {
  it("should cache and retrieve items", async () => {
    const service = new MemoryCacheService();
    await service.set("test-key", "value", 2);

    const val = await service.get<string>("test-key");
    expect(val).toBe("value");
  });

  it("should return null for expired key", async () => {
    const service = new MemoryCacheService();
    await service.set("exp-key", "value", -1);

    const val = await service.get<string>("exp-key");
    expect(val).toBeNull();
  });

  it("should generate deterministic cache key", () => {
    const key1 = generateCacheKey("list", { page: 1, limit: 10 });
    const key2 = generateCacheKey("list", { limit: 10, page: 1 });

    expect(key1).toBe(key2);
  });
});
