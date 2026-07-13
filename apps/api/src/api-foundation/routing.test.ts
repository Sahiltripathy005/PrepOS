import { describe, it, expect, vi } from "vitest";
import { RouterRegistry } from "./routing.js";
import { generateOpenApiSpec } from "./openapi.js";

describe("Routing & OpenAPI Foundation", () => {
  it("should record registered routes", () => {
    const mockHandler = vi.fn();
    RouterRegistry.register(
      {
        method: "get",
        path: "/test-endpoint",
        summary: "Test Summary",
        description: "Test Desc",
        tags: ["TestTag"]
      },
      mockHandler
    );

    const routes = RouterRegistry.getRoutesMetadata();
    const testRoute = routes.find((r) => r.path === "/test-endpoint");

    expect(testRoute).toBeDefined();
    expect(testRoute?.method).toBe("get");
    expect(testRoute?.summary).toBe("Test Summary");
  });

  it("should generate valid OpenAPI V3 spec representation", () => {
    const spec = generateOpenApiSpec();
    expect(spec.openapi).toBe("3.0.0");
    expect(spec.info).toBeDefined();
    expect(spec.paths).toBeDefined();
  });
});
