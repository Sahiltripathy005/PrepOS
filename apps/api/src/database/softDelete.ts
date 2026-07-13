import { AuditContext } from "./audit.js";

export interface SoftDeletable {
  deletedAt: Date | null;
  deletedBy: string | null;
}

export function enrichSoftDelete(context?: AuditContext): {
  deletedAt: Date;
  deletedBy: string | null;
} {
  return {
    deletedAt: new Date(),
    deletedBy: context?.userId ?? null
  };
}

export function enrichRestore(): {
  deletedAt: null;
  deletedBy: null;
} {
  return {
    deletedAt: null,
    deletedBy: null
  };
}
