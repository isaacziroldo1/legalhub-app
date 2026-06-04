import { z } from "zod";

const clientStatusSchema = z.enum(["Ativo", "Em Prospecção", "Inativo"]);

const cnpjSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => value.length === 11 || value.length === 14, "CPF/CNPJ inválido");

export const createClientSchema = z.object({
  name: z.string().trim().min(3),
  cnpj: cnpjSchema,
  status: clientStatusSchema,
  responsible: z.string().trim().min(3),
  email: z.string().trim().email().toLowerCase(),
  phone: z.string().trim().min(8),
  address: z.string().trim().min(5),
  city: z.string().trim().min(2),
  observations: z.string().trim().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const clientIdSchema = z.object({
  id: z.string().min(1),
});
