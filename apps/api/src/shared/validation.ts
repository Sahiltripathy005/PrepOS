import { z } from "zod";
import { REGEX, LIMITS } from "@placementos/types";

export const EmailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format")
  .regex(REGEX.EMAIL, "Invalid email format")
  .toLowerCase()
  .trim();

export const UuidSchema = z
  .string()
  .uuid("Invalid unique identifier (UUID)")
  .regex(REGEX.UUID, "Invalid UUID structure");

export const PasswordSchema = z
  .string()
  .min(LIMITS.PASSWORD_MIN_LENGTH, `Password must be at least ${LIMITS.PASSWORD_MIN_LENGTH} characters`)
  .max(LIMITS.PASSWORD_MAX_LENGTH, `Password must be at most ${LIMITS.PASSWORD_MAX_LENGTH} characters`)
  .regex(
    REGEX.PASSWORD,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  );

export const PaginationSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive("Limit must be a positive integer")
    .max(LIMITS.MAX_PAGE_SIZE, `Limit cannot exceed ${LIMITS.MAX_PAGE_SIZE}`)
    .default(LIMITS.DEFAULT_PAGE_SIZE),
  offset: z.coerce
    .number()
    .int()
    .nonnegative("Offset cannot be negative")
    .default(0)
});

export const SortingSchema = z.object({
  sortBy: z.string().min(1, "Sort field cannot be empty").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc")
});

export const SearchingSchema = z.object({
  q: z.string().trim().optional()
});

export const DateRangeSchema = z
  .object({
    startDate: z.string().datetime("Invalid ISO date format for startDate").optional(),
    endDate: z.string().datetime("Invalid ISO date format for endDate").optional()
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "startDate must be before or equal to endDate",
      path: ["startDate"]
    }
  );

export const FileValidationSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  mimetype: z.string().min(1, "Mime type is required"),
  size: z.number().positive("File size must be positive")
});
