import { RouterRegistry } from "./routing.js";

export function generateOpenApiSpec(): Record<string, unknown> {
  const routes = RouterRegistry.getRoutesMetadata();
  const paths: Record<string, Record<string, unknown>> = {};

  for (const route of routes) {
    if (!paths[route.path]) {
      paths[route.path] = {};
    }

    paths[route.path][route.method] = {
      summary: route.summary || `${route.method.toUpperCase()} ${route.path}`,
      description: route.description || "",
      tags: route.tags || ["Default"],
      responses: {
        "200": {
          description: "Successful response"
        }
      }
    };
  }

  return {
    openapi: "3.0.0",
    info: {
      title: "PlacementOS API",
      version: "1.0.0",
      description: "PlacementOS Shared API Foundation Layer"
    },
    paths
  };
}
