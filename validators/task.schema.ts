import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task wajib diisi.").max(200),
  date: z.string().date(),
  note: optionalText,
  keyword: optionalText,
});

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, "Task wajib diisi.").max(200),
  note: optionalText,
  keyword: optionalText,
});

export const taskIdSchema = z.object({
  id: z.string().uuid(),
});

export const toggleTaskSchema = z.object({
  id: z.string().uuid(),
  isDone: z.coerce.boolean(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
