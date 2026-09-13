import { z } from "zod";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const optionalUuid = z
  .string()
  .nullish()
  .transform((val) => {
    if (!val || typeof val !== "string") return null;
    const trimmed = val.trim();
    return UUID_REGEX.test(trimmed) ? trimmed : null;
  });

export const transactionTypeSchema = z.enum(["expense", "income"]);

export const createTransactionSchema = z.object({
  title: z.string().trim().min(1, "Label transaksi wajib diisi.").max(200),
  type: transactionTypeSchema,
  amount: z.coerce.number().positive("Nominal harus lebih besar dari 0."),
  date: z.string().date(),
  categoryId: optionalUuid,
  categoryName: z.string().trim().max(80).optional().default("Lainnya"),
  paymentMethod: z.string().trim().max(50).optional().default("Cash"),
  note: optionalText,
});

export const updateTransactionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, "Label transaksi wajib diisi.").max(200),
  type: transactionTypeSchema,
  amount: z.coerce.number().positive("Nominal harus lebih besar dari 0."),
  date: z.string().date(),
  categoryId: optionalUuid,
  categoryName: z.string().trim().max(80).optional().default("Lainnya"),
  paymentMethod: z.string().trim().max(50).optional().default("Cash"),
  note: optionalText,
});

export const transactionIdSchema = z.object({
  id: z.string().uuid(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Nama kategori wajib diisi.").max(80),
  type: z.enum(["expense", "income", "both"]),
  icon: z.string().trim().max(50).default("Tag"),
  color: z.string().trim().max(30).default("#3b82f6"),
});

export const categoryIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
