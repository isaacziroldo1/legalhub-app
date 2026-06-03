import { z } from "zod";

const stringListSchema = z.array(z.string().trim().min(1));

export const createDocumentSchema = z.object({
  name: z.string().trim().min(3),
  category: z.string().trim().min(3),
  tags: stringListSchema,
  variables: stringListSchema,
  autoMappedFields: z.record(z.string(), z.string()).optional(),
  clientId: z.string().min(1).optional(),
});

export const updateDocumentSchema = z.object({
  name: z.string().trim().min(3).optional(),
  category: z.string().trim().min(3).optional(),
  tags: stringListSchema.optional(),
  variables: stringListSchema.optional(),
  autoMappedFields: z.record(z.string(), z.string()).optional(),
  clientId: z.string().min(1).nullable().optional(),
});

export const documentIdSchema = z.object({
  id: z.string().min(1),
});
