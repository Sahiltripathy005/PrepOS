import { PaginationParams, PaginationMetadata } from "@placementos/types";

export interface PaginatedResult<T> {
  data: T[];
  metadata: PaginationMetadata;
}

export class PaginationFramework {
  public static buildOffsetMetadata(total: number, params?: PaginationParams): PaginationMetadata {
    const limit = params?.limit ?? 20;
    const offset = params?.offset ?? 0;
    return {
      type: "offset" as const,
      limit,
      offset,
      total,
      hasNext: offset + limit < total
    };
  }

  public static buildCursorMetadata(
    nextCursor: string | null,
    limit: number,
    total?: number
  ): PaginationMetadata {
    return {
      type: "cursor" as const,
      limit,
      offset: 0,
      total: total ?? 0,
      nextCursor: nextCursor ?? undefined,
      hasNext: nextCursor !== null
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } as any;
  }
}
