import { z } from "zod";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading env files from workspace root first, then project root, then current directory
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info")
});

export class ConfigurationError extends Error {
  constructor(public zodError: z.ZodError) {
    super(`Invalid environment configuration:\n${zodError.errors.map(e => ` - ${e.path.join(".")}: ${e.message}`).join("\n")}`);
    this.name = "ConfigurationError";
  }
}

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  throw new ConfigurationError(parsed.error);
}

export const config = parsed.data;

export type Config = typeof config;

export class ConfigurationService {
  public static get<K extends keyof Config>(key: K): Config[K] {
    return config[key];
  }

  public static isDevelopment(): boolean {
    return config.NODE_ENV === "development";
  }

  public static isProduction(): boolean {
    return config.NODE_ENV === "production";
  }

  public static isTest(): boolean {
    return config.NODE_ENV === "test";
  }
}
