export const ROLES = {
  USER: "USER",
  FACULTY: "FACULTY",
  ADMIN: "ADMIN"
} as const;

export type UserRole = keyof typeof ROLES;

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const;

export type StatusCode = typeof STATUS_CODES[keyof typeof STATUS_CODES];

export const HEADERS = {
  CORRELATION_ID: "x-correlation-id",
  REQUEST_ID: "x-request-id",
  IDEMPOTENCY_KEY: "idempotency-key"
} as const;

export const COOKIES = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken"
} as const;

export const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
} as const;

export const LIMITS = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 20,
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_WINDOW_MS: 900000 // 15 minutes in ms
} as const;

export const FEATURE_FLAGS = {
  ENABLE_REGISTRATION: true,
  ENABLE_RATE_LIMITER: true,
  ENABLE_MAINTENANCE_MODE: false
} as const;

export const ROUTES = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    REFRESH: "/api/v1/auth/refresh",
    LOGOUT: "/api/v1/auth/logout",
    SESSION: "/api/v1/auth/session"
  },
  USERS: {
    SETTINGS: "/api/v1/users/settings"
  },
  PRACTICE: {
    PROBLEMS: "/api/v1/practice/problems",
    ATTEMPTS: "/api/v1/practice/attempts"
  }
} as const;
