export interface AuditContext {
  userId?: string;
}

export interface AuditableEntity {
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
}

export function enrichAuditCreate<T extends object>(data: T, context?: AuditContext): T & {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
} {
  const now = new Date();
  return {
    ...data,
    createdAt: now,
    updatedAt: now,
    createdBy: context?.userId ?? null,
    updatedBy: context?.userId ?? null
  };
}

export function enrichAuditUpdate<T extends object>(data: T, context?: AuditContext): T & {
  updatedAt: Date;
  updatedBy: string | null;
} {
  const now = new Date();
  return {
    ...data,
    updatedAt: now,
    updatedBy: context?.userId ?? null
  };
}
