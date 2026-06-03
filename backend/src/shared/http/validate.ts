import { z, type ZodTypeAny } from "zod";
import { badRequest } from "./errors";

export function parseBody<T extends ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);

  if (!result.success) {
    throw badRequest(result.error.issues.map((issue) => issue.message).join(", "));
  }

  return result.data;
}

export function parseParams<T extends ZodTypeAny>(schema: T, params: unknown): z.infer<T> {
  const result = schema.safeParse(params);

  if (!result.success) {
    throw badRequest(result.error.issues.map((issue) => issue.message).join(", "));
  }

  return result.data;
}
