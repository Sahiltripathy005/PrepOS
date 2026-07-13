import { describe, it, expect, vi } from "vitest";
import { Response } from "express";
import { ResponseHelper } from "./responses.js";

describe("Response System Helper", () => {
  it("should format success responses correctly", () => {
    const resMock = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;

    ResponseHelper.success(resMock, { id: 1 });
    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 1 }
    });
  });

  it("should format paginated responses correctly", () => {
    const resMock = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;

    const paginationMeta = {
      type: "offset" as const,
      limit: 10,
      offset: 0,
      total: 50,
      hasNext: true
    };

    ResponseHelper.paginated(resMock, [{ id: 1 }], paginationMeta);
    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({
      success: true,
      data: [{ id: 1 }],
      pagination: paginationMeta
    });
  });
});
