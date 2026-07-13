import { describe, it, expect } from "vitest";
import { MemoryRateLimiter } from "./rateLimiter.js";

describe("Rate Limiting Foundation", () => {
  it("should block requests when rate limit threshold is exceeded", async () => {
    const limiter = new MemoryRateLimiter();

    const res1 = await limiter.isRateLimited("user-key", 2, 5000);
    const res2 = await limiter.isRateLimited("user-key", 2, 5000);
    const res3 = await limiter.isRateLimited("user-key", 2, 5000);

    expect(res1.limited).toBe(false);
    expect(res1.remaining).toBe(1);
    expect(res2.limited).toBe(false);
    expect(res2.remaining).toBe(0);
    expect(res3.limited).toBe(true);
  });
});
