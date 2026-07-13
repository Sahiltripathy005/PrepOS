import { describe, it, expect } from "vitest";
import { ApplicationError, ErrorFactory } from "./errors.js";

describe("Error System", () => {
  it("should create base ApplicationError correctly", () => {
    const error = new ApplicationError("TEST_CODE", 418, "Tea time");
    expect(error.code).toBe("TEST_CODE");
    expect(error.statusCode).toBe(418);
    expect(error.message).toBe("Tea time");
  });

  it("should create ValidationError via ErrorFactory correctly", () => {
    const error = ErrorFactory.badRequest("Invalid input", { field: "email" });
    expect(error.code).toBe("VALIDATION_FAILED");
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ field: "email" });
  });

  it("should format as JSON representation", () => {
    const error = new ApplicationError("SOME_ERROR", 400, "Error msg", { detail: true });
    expect(error.toJSON()).toEqual({
      success: false,
      error: {
        code: "SOME_ERROR",
        message: "Error msg",
        details: { detail: true }
      }
    });
  });
});
