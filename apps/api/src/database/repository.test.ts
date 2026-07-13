/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { BaseRepository } from "./repository.js";

describe("BaseRepository", () => {
  it("should call findUnique with correct id on findById", async () => {
    const mockDelegate = {
      findUnique: vi.fn().mockResolvedValue({ id: "1", name: "test" })
    };
    const repo = new BaseRepository<any, any, any>({} as any, mockDelegate);

    const res = await repo.findById("1");
    expect(res).toEqual({ id: "1", name: "test" });
    expect(mockDelegate.findUnique).toHaveBeenCalledWith({
      where: { id: "1" }
    });
  });

  it("should filter out soft deleted items by default if softDelete is enabled on findById", async () => {
    const mockDelegate = {
      findUnique: vi.fn().mockResolvedValue({ id: "1", name: "test", deletedAt: new Date() })
    };
    const repo = new BaseRepository<any, any, any>({} as any, mockDelegate, { softDelete: true });

    const res = await repo.findById("1");
    expect(res).toBeNull();
  });

  it("should append take/skip on findMany pagination options", async () => {
    const mockDelegate = {
      findMany: vi.fn().mockResolvedValue([{ id: "1" }])
    };
    const repo = new BaseRepository<any, any, any>({} as any, mockDelegate);

    await repo.findMany({
      pagination: { limit: 10, offset: 5 }
    });

    expect(mockDelegate.findMany).toHaveBeenCalledWith({
      where: {},
      take: 10,
      skip: 5
    });
  });

  it("should create entity with audit fields", async () => {
    const mockDelegate = {
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "1", ...data }))
    };
    const repo = new BaseRepository<any, any, any>({} as any, mockDelegate);

    const res = await repo.create({ title: "Task" }, { userId: "user-999" });
    expect(res.title).toBe("Task");
    expect(res.createdBy).toBe("user-999");
    expect(res.createdAt).toBeInstanceOf(Date);
  });
});
