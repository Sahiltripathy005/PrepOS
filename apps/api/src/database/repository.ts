import { PrismaClient } from "@prisma/client";
import { PaginationParams, SortParams } from "@placementos/types";
import { AuditContext, enrichAuditCreate, enrichAuditUpdate } from "./audit.js";
import { enrichSoftDelete, enrichRestore } from "./softDelete.js";

export interface IRepository<T, CreateDTO, UpdateDTO> {
  findById(id: string): Promise<T | null>;
  findMany(params?: {
    pagination?: PaginationParams;
    sort?: SortParams;
    filter?: Record<string, unknown>;
    includeDeleted?: boolean;
  }): Promise<T[]>;
  create(data: CreateDTO, context?: AuditContext): Promise<T>;
  update(id: string, data: UpdateDTO, context?: AuditContext): Promise<T>;
  delete(id: string, context?: AuditContext): Promise<T>;
  restore(id: string, context?: AuditContext): Promise<T>;
  count(filter?: Record<string, unknown>, includeDeleted?: boolean): Promise<number>;
  createMany(data: CreateDTO[], context?: AuditContext): Promise<number>;
}

export class BaseRepository<
  T extends { id: string },
  CreateDTO extends object,
  UpdateDTO extends object
> implements IRepository<T, CreateDTO, UpdateDTO>
{
  constructor(
    protected readonly prismaClient: PrismaClient,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected readonly modelDelegate: any,
    protected readonly options: { softDelete: boolean } = { softDelete: false }
  ) {}

  public async findById(id: string): Promise<T | null> {
    const item = await this.modelDelegate.findUnique({
      where: { id }
    });

    if (!item) return null;
    if (this.options.softDelete && item.deletedAt !== null) {
      return null;
    }
    return item;
  }

  public async findMany(params?: {
    pagination?: PaginationParams;
    sort?: SortParams;
    filter?: Record<string, unknown>;
    includeDeleted?: boolean;
  }): Promise<T[]> {
    const queryFilter: Record<string, unknown> = { ...(params?.filter || {}) };

    if (this.options.softDelete && !params?.includeDeleted) {
      queryFilter.deletedAt = null;
    }

    const findOptions: Record<string, unknown> = {
      where: queryFilter
    };

    if (params?.pagination) {
      if (params.pagination.limit !== undefined) {
        findOptions.take = params.pagination.limit;
      }
      if (params.pagination.offset !== undefined) {
        findOptions.skip = params.pagination.offset;
      }
    }

    if (params?.sort) {
      findOptions.orderBy = {
        [params.sort.field]: params.sort.order
      };
    }

    return this.modelDelegate.findMany(findOptions);
  }

  public async create(data: CreateDTO, context?: AuditContext): Promise<T> {
    const enriched = enrichAuditCreate(data, context);
    return this.modelDelegate.create({
      data: enriched
    });
  }

  public async update(id: string, data: UpdateDTO, context?: AuditContext): Promise<T> {
    const enriched = enrichAuditUpdate(data, context);
    return this.modelDelegate.update({
      where: { id },
      data: enriched
    });
  }

  public async delete(id: string, context?: AuditContext): Promise<T> {
    if (this.options.softDelete) {
      const enrichedSoftDelete = enrichSoftDelete(context);
      return this.modelDelegate.update({
        where: { id },
        data: enrichedSoftDelete
      });
    }

    return this.modelDelegate.delete({
      where: { id }
    });
  }

  public async restore(id: string, context?: AuditContext): Promise<T> {
    if (!this.options.softDelete) {
      throw new Error("Repository does not support soft deletes");
    }

    const restoredFields = {
      ...enrichRestore(),
      ...enrichAuditUpdate({}, context)
    };

    return this.modelDelegate.update({
      where: { id },
      data: restoredFields
    });
  }

  public async count(
    filter?: Record<string, unknown>,
    includeDeleted = false
  ): Promise<number> {
    const queryFilter: Record<string, unknown> = { ...(filter || {}) };

    if (this.options.softDelete && !includeDeleted) {
      queryFilter.deletedAt = null;
    }

    return this.modelDelegate.count({
      where: queryFilter
    });
  }

  public async createMany(data: CreateDTO[], context?: AuditContext): Promise<number> {
    const enrichedList = data.map((item) => enrichAuditCreate(item, context));
    const result = await this.modelDelegate.createMany({
      data: enrichedList
    });
    return result.count;
  }
}
