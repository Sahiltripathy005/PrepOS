import { describe, it, expect } from "vitest";
import { contextStorage, ApiContext } from "./context.js";

describe("API Context Store", () => {
  it("should retrieve values inside contextStorage run bounds", () => {
    const store = {
      correlationId: "corr-111",
      traceId: "trace-222",
      startTime: Date.now(),
      locale: "fr",
      timezone: "EST"
    };

    contextStorage.run(store, () => {
      expect(ApiContext.getCorrelationId()).toBe("corr-111");
      expect(ApiContext.getLocale()).toBe("fr");
      expect(ApiContext.getTimezone()).toBe("EST");
    });
  });

  it("should return fallback values outside store context", () => {
    expect(ApiContext.getCorrelationId()).toBe("unknown");
    expect(ApiContext.getLocale()).toBe("en");
    expect(ApiContext.getTimezone()).toBe("UTC");
  });
});
