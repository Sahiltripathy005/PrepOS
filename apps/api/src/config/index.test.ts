import { describe, it, expect } from "vitest";
import { ConfigurationService } from "./index.js";

describe("Configuration Service", () => {
  it("should retrieve configuration values", () => {
    expect(ConfigurationService.get("NODE_ENV")).toBeDefined();
    expect(ConfigurationService.get("PORT")).toBeTypeOf("number");
  });

  it("should evaluate environments correctly", () => {
    const isDev = ConfigurationService.isDevelopment();
    const isProd = ConfigurationService.isProduction();
    const isTest = ConfigurationService.isTest();

    expect(typeof isDev).toBe("boolean");
    expect(typeof isProd).toBe("boolean");
    expect(typeof isTest).toBe("boolean");
  });
});
