import { STATUS_CODES } from "@placementos/types";

export class ApplicationError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string,
    public readonly details: unknown = null
  ) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details
      }
    };
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details: unknown = null) {
    super("VALIDATION_FAILED", STATUS_CODES.BAD_REQUEST, message, details);
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string = "Authentication credentials missing or invalid.") {
    super("UNAUTHENTICATED", STATUS_CODES.UNAUTHORIZED, message, null);
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string = "Access denied. Insufficient permissions.") {
    super("UNAUTHORIZED", STATUS_CODES.FORBIDDEN, message, null);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string = "The requested resource could not be found.") {
    super("RESOURCE_NOT_FOUND", STATUS_CODES.NOT_FOUND, message, null);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super("CONFLICT", STATUS_CODES.CONFLICT, message, null);
  }
}

export class RateLimitError extends ApplicationError {
  constructor(message: string = "Rate limit exceeded. Please try again later.") {
    super("RATE_LIMIT_EXCEEDED", STATUS_CODES.TOO_MANY_REQUESTS, message, null);
  }
}

export class InternalServerError extends ApplicationError {
  constructor(message: string = "An unexpected error occurred on our servers.") {
    super("INTERNAL_SERVER_ERROR", STATUS_CODES.INTERNAL_SERVER_ERROR, message, null);
  }
}

export class ErrorFactory {
  public static badRequest(message: string, details: unknown = null): ValidationError {
    return new ValidationError(message, details);
  }

  public static unauthorized(message?: string): AuthenticationError {
    return new AuthenticationError(message);
  }

  public static forbidden(message?: string): AuthorizationError {
    return new AuthorizationError(message);
  }

  public static notFound(message?: string): NotFoundError {
    return new NotFoundError(message);
  }

  public static conflict(message: string): ConflictError {
    return new ConflictError(message);
  }

  public static rateLimit(message?: string): RateLimitError {
    return new RateLimitError(message);
  }

  public static internal(message?: string): InternalServerError {
    return new InternalServerError(message);
  }
}
