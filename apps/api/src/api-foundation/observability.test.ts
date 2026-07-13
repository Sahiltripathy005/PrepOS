import { describe, it, expect } from "vitest";
import { ObservabilityRegistry } from "./observability.js";

describe("Observability Foundation", () => {
  it("should record metrics and calculate average latency and error rates", () => {
    ObservabilityRegistry.recordMetric({
      path: "/test-perf",
      method: "GET",
      statusCode: 200,
      durationMs: 150
    });

    ObservabilityRegistry.recordMetric({
      path: "/test-perf",
      method: "GET",
      statusCode: 500,
      durationMs: 250
    });

    const avg = ObservabilityRegistry.getAverageLatency("/test-perf");
    const errRate = ObservabilityRegistry.getErrorRate("/test-perf");

    expect(avg).toBe(200);
    expect(errRate).toBe(0.5);
  });
});
