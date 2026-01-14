// src/lib/apiErrors.ts
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "UNKNOWN_ERROR";
}
