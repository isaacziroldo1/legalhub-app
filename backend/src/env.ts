import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1).default("file:./prisma/dev.db"),
  JWT_SECRET: z.string().optional(),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(8),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
});

const parsedEnv = envSchema.parse(process.env);

const devJwtSecret = "legalhub-dev-secret-please-change-in-production";

if (process.env.NODE_ENV === "production" && (!parsedEnv.JWT_SECRET || parsedEnv.JWT_SECRET.length < 32)) {
  throw new Error("JWT_SECRET deve conter pelo menos 32 caracteres em producao");
}

export const env = {
  ...parsedEnv,
  JWT_SECRET: parsedEnv.JWT_SECRET && parsedEnv.JWT_SECRET.length >= 32 ? parsedEnv.JWT_SECRET : devJwtSecret,
};
