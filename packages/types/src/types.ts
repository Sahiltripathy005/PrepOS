export type Brand<K, T> = K & { readonly __brand: T };

export type UserId = Brand<string, "UserId">;
export type ProblemId = Brand<string, "ProblemId">;
export type AttemptId = Brand<string, "AttemptId">;
export type ApplicationId = Brand<string, "ApplicationId">;

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface SortParams {
  field: string;
  order: "asc" | "desc";
}

export interface FilterParams {
  [key: string]: unknown;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ValidationErrorDetail {
  field: string;
  issue: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details: ValidationErrorDetail[] | null;
  };
}

export interface PaginationMetadata {
  type: "offset" | "cursor";
  limit: number;
  offset: number;
  total: number;
  hasNext: boolean;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMetadata;
}

export interface UserProfileDTO {
  id: UserId;
  email: string;
  username: string;
  role: "USER" | "FACULTY" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface UserSettingsDTO {
  themeMode: "light" | "dark";
  densityMode: "comfortable" | "condensed";
  accentColor: string;
  borderRadiusPx: number;
}
