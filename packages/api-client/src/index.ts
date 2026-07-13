import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { ErrorResponse } from "@placementos/types";

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details: unknown;

  constructor(message: string, code: string, statusCode: number, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:4000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor (inject auth tokens)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (map to ApiError class & support retry)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Automatic token refresh hook stub
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post<{ data: { accessToken: string } }>(
          "/api/v1/auth/refresh",
          {},
          { baseURL: apiClient.defaults.baseURL }
        );
        const newAccessToken = refreshResponse.data.data.accessToken;
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken);
        }
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          // Optionally trigger global redirect to login
        }
      }
    }

    if (error.response && error.response.data && !error.response.data.success) {
      const serverError = error.response.data.error;
      return Promise.reject(
        new ApiError(
          serverError.message,
          serverError.code,
          error.response.status,
          serverError.details
        )
      );
    }

    // Map general network/request setup errors
    return Promise.reject(
      new ApiError(
        error.message || "A network error occurred.",
        "NETWORK_ERROR",
        error.response?.status || 500,
        null
      )
    );
  }
);

// Request Cancellation Helper
export const createAbortController = (): AbortController => new AbortController();
export { AxiosError } from "axios";
