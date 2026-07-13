import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { ExpressAppFactory } from "./bootstrap.js";
import { ConnectionManager } from "../database/connection.js";

describe("Express App Factory", () => {
  it("should configure liveness check endpoint to return 200 OK", async () => {
    const app = ExpressAppFactory.create();
    const res = await request(app).get("/liveness");
    expect(res.status).toBe(200);
    expect(res.text).toBe("OK");
  });

  it("should return health status status based on db state", async () => {
    const checkHealthSpy = vi
      .spyOn(ConnectionManager, "checkHealth")
      .mockResolvedValue({ status: "UP", latencyMs: 10 });

    const app = ExpressAppFactory.create();
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("UP");
    expect(checkHealthSpy).toHaveBeenCalled();
  });
});
