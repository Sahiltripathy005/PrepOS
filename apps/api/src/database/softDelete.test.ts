import { describe, it, expect } from "vitest";
import { enrichSoftDelete, enrichRestore } from "./softDelete.js";

describe("Soft Delete Infrastructure", () => {
  it("should enrich data with soft delete fields", () => {
    const enriched = enrichSoftDelete({ userId: "user-123" });
    expect(enriched.deletedAt).toBeInstanceOf(Date);
    expect(enriched.deletedBy).toBe("user-123");
  });

  it("should enrich data with restore fields", () => {
    const enriched = enrichRestore();
    expect(enriched.deletedAt).toBeNull();
    expect(enriched.deletedBy).toBeNull();
  });
});
