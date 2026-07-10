import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task is required.").max(200),
  date: z.string().date(),
  note: optionalText,
  keyword: optionalText,
});

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, "Task is required.").max(200),
  note: optionalText,
  keyword: optionalText,
});

export const taskIdSchema = z.object({
  id: z.string().uuid(),
});

export const toggleTaskSchema = z.object({
  id: z.string().uuid(),
  isDone: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
