import { Response } from "express";
import { SuccessResponse, PaginatedResponse, PaginationMetadata } from "@placementos/types";

export class ResponseHelper {
  public static success<T>(res: Response, data: T, statusCode: number = 200): Response {
    const payload: SuccessResponse<T> = {
      success: true,
      data
    };
    return res.status(statusCode).json(payload);
  }

  public static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMetadata,
    statusCode: number = 200
  ): Response {
    const payload: PaginatedResponse<T> = {
      success: true,
      data,
      pagination
    };
    return res.status(statusCode).json(payload);
  }
}
