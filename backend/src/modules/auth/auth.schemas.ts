import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8),
});

export const sessionSchema = z.object({
  token: z.string().min(1),
});
