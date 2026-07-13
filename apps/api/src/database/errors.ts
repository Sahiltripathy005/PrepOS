import { Prisma } from "@prisma/client";
import {
  ConflictError,
  ValidationError,
  NotFoundError,
  InternalServerError
} from "../shared/errors.js";

export function mapDatabaseError(error: unknown): Error {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const target = (error.meta?.target as string[])?.join(", ") || "field";
        return new ConflictError(`Resource with unique attribute '${target}' already exists.`);
      }
      case "P2003": {
        const field = (error.meta?.field_name as string) || "reference";
        return new ValidationError(`Reference constraint failed on field '${field}'.`);
      }
      case "P2025": {
        return new NotFoundError("Requested database record was not found.");
      }
      case "P2000": {
        return new ValidationError("Value is too long for the column definition.");
      }
      default: {
        return new InternalServerError(`Database error [${error.code}]: ${error.message}`);
      }
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new InternalServerError(`Failed to initialize database connection: ${error.message}`);
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new InternalServerError("A database engine panic occurred.");
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError(`Input violates schema validation: ${error.message}`);
  }

  if (error instanceof Error) {
    return error;
  }

  return new InternalServerError("An unknown database exception occurred.");
}
