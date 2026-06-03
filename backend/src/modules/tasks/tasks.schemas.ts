import { z } from "zod";

const taskStatusSchema = z.enum(["todo", "drafting", "review", "done"]);
const taskPrioritySchema = z.enum(["critical", "high", "normal"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(3),
  clientId: z.string().min(1),
  clientName: z.string().trim().min(3),
  dueDate: z.coerce.date(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  responsible: z.string().trim().min(2),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(3).optional(),
  clientId: z.string().min(1).optional(),
  clientName: z.string().trim().min(3).optional(),
  dueDate: z.coerce.date().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  responsible: z.string().trim().min(2).optional(),
});

export const taskIdSchema = z.object({
  id: z.string().min(1),
});
