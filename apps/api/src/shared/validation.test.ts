import { describe, it, expect } from "vitest";
import { EmailSchema, PasswordSchema, DateRangeSchema } from "./validation.js";

describe("Validation Schemas", () => {
  describe("EmailSchema", () => {
    it("should accept valid emails", () => {
      const res = EmailSchema.safeParse("test@example.com");
      expect(res.success).toBe(true);
      expect(res.data).toBe("test@example.com");
    });

    it("should reject invalid emails", () => {
      const res = EmailSchema.safeParse("invalidemail");
      expect(res.success).toBe(false);
    });
  });

  describe("PasswordSchema", () => {
    it("should accept strong passwords", () => {
      const res = PasswordSchema.safeParse("StrongPass123!");
      expect(res.success).toBe(true);
    });

    it("should reject weak passwords", () => {
      const res = PasswordSchema.safeParse("weak");
      expect(res.success).toBe(false);
    });
  });

  describe("DateRangeSchema", () => {
    it("should accept valid chronological date ranges", () => {
      const res = DateRangeSchema.safeParse({
        startDate: "2026-07-01T00:00:00Z",
        endDate: "2026-07-10T00:00:00Z"
      });
      expect(res.success).toBe(true);
    });

    it("should reject non-chronological date ranges", () => {
      const res = DateRangeSchema.safeParse({
        startDate: "2026-07-10T00:00:00Z",
        endDate: "2026-07-01T00:00:00Z"
      });
      expect(res.success).toBe(false);
    });
  });
});
