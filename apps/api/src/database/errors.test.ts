import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";
import { mapDatabaseError } from "./errors.js";

describe("Database Error Mapper", () => {
  it("should map P2002 unique constraint violation to ConflictError", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Unique field violation", {
      code: "P2002",
      clientVersion: "5.0.0",
      meta: { target: ["email"] }
    });

    const mapped = mapDatabaseError(error);
    expect(mapped.name).toBe("ConflictError");
    expect(mapped.message).toContain("unique attribute 'email' already exists");
  });

  it("should map P2003 foreign key violation to ValidationError", () => {
    const error = new Prisma.PrismaClientKnownRequestError("FK violation", {
      code: "P2003",
      clientVersion: "5.0.0",
      meta: { field_name: "userId" }
    });

    const mapped = mapDatabaseError(error);
    expect(mapped.name).toBe("ValidationError");
    expect(mapped.message).toContain("Reference constraint failed on field 'userId'");
  });

  it("should map P2025 record not found to NotFoundError", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Not found", {
      code: "P2025",
      clientVersion: "5.0.0"
    });

    const mapped = mapDatabaseError(error);
    expect(mapped.name).toBe("NotFoundError");
  });

  it("should return generic error for unknown error objects", () => {
    const error = new Error("Unknown raw error");
    const mapped = mapDatabaseError(error);
    expect(mapped).toBe(error);
  });
});
