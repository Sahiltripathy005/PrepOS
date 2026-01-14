import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Goal Setup Schema
 * POST /api/goal
 */
export const goalSchema = z
  .object({
    targetRole: z.string().min(2, "targetRole must be at least 2 characters").max(120),

    // stored in Prisma as Json
    targetCompanies: z.array(z.string().min(1).max(80)).default([]),

    timelineDays: z.number().int().min(7, "timelineDays must be >= 7").max(365),
    hoursPerDay: z.number().int().min(1, "hoursPerDay must be >= 1").max(16),

    // ISO datetime string
    startDate: z.string().datetime("startDate must be a valid ISO datetime"),

    wDsa: z.number().min(0).max(1),
    wApti: z.number().min(0).max(1),
    wCs: z.number().min(0).max(1),
    wDev: z.number().min(0).max(1),

    difficultyCurve: z.enum(["linear", "easeIn", "easeOut", "easeInOut"]),
  })
  .superRefine((val, ctx) => {
    const sum = val.wDsa + val.wApti + val.wCs + val.wDev;

    // Allow tiny float errors
    if (Math.abs(sum - 1) > 0.01) {
      ctx.addIssue({
        code: "custom",
        path: ["wDsa"],
        message: `Weights must sum to 1. Current sum=${sum.toFixed(4)}`,
      });
    }
  });

export type GoalInput = z.infer<typeof goalSchema>;

/**
 * Attempt Logging Schema
 * POST /api/attempts/create
 */
export const attemptCreateSchema = z.object({
  topicId: z.number().int().positive("topicId must be a positive integer"),
  difficulty: z.enum(["easy", "med", "hard"]),
  correct: z.boolean(),
  timeTakenSec: z.number().int().min(1).max(60 * 60), // 1 sec to 1 hour
  confidence: z.number().int().min(1).max(5),
  mistakeTag: z.string().min(1).max(120),
  taskId: z.string().uuid().optional(),
});

export type AttemptCreateInput = z.infer<typeof attemptCreateSchema>;
