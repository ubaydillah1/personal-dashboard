import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

export const createComboSchema = z.object({
  name: z.string().trim().min(1, "Combo name is required.").max(120),
  activeDays: z.array(z.coerce.number().int().min(0).max(6)).default([]),
  tasks: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Task title is required.").max(200),
        keyword: optionalText,
        note: optionalText,
      }),
    )
    .min(1, "Add at least one task."),
});

export const comboIdSchema = z.object({
  id: z.string().uuid(),
});

export const addComboToDateSchema = z.object({
  id: z.string().uuid(),
  date: z.string().date(),
});

export type CreateComboInput = z.infer<typeof createComboSchema>;
