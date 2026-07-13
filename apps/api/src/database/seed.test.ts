import { describe, it, expect, vi } from "vitest";
import { BaseSeeder, SeederRegistry } from "./seed.js";
import { PrismaClient } from "@prisma/client";

class MockSeeder extends BaseSeeder {
  public readonly name = "MockSeeder";
  public run = vi.fn().mockResolvedValue(undefined);
}

describe("Seeder Framework Registry", () => {
  it("should register and execute all seeders", async () => {
    const registry = new SeederRegistry();
    const seeder = new MockSeeder();
    registry.register(seeder);

    const prismaMock = {} as unknown as PrismaClient;
    await registry.runAll(prismaMock);

    expect(seeder.run).toHaveBeenCalledWith(prismaMock);
  });
});
