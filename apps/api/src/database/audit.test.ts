import { describe, it, expect } from "vitest";
import { enrichAuditCreate, enrichAuditUpdate } from "./audit.js";

describe("Audit Infrastructure", () => {
  it("should enrich data with creation audit fields", () => {
    const data = { username: "john" };
    const enriched = enrichAuditCreate(data, { userId: "user-123" });

    expect(enriched.username).toBe("john");
    expect(enriched.createdBy).toBe("user-123");
    expect(enriched.updatedBy).toBe("user-123");
    expect(enriched.createdAt).toBeInstanceOf(Date);
    expect(enriched.updatedAt).toBeInstanceOf(Date);
  });

  it("should enrich data with update audit fields", () => {
    const data = { username: "john" };
    const enriched = enrichAuditUpdate(data, { userId: "user-123" });

    expect(enriched.username).toBe("john");
    expect(enriched.updatedBy).toBe("user-123");
    expect(enriched.updatedAt).toBeInstanceOf(Date);
    expect((enriched as Record<string, unknown>).createdBy).toBeUndefined();
  });
});
