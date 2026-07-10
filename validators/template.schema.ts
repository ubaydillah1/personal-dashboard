import { z } from "zod";

export const createTemplateSchema = z.object({
  title: z.string().trim().min(1, "Template wajib diisi.").max(200),
  keyword: z.string().trim().min(1).max(80).optional(),
  activeDays: z.array(z.coerce.number().int().min(0).max(6)).default([]),
});

export const updateTemplateSchema = createTemplateSchema.extend({
  id: z.string().uuid(),
  isActive: z.coerce.boolean(),
});

export const templateIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
