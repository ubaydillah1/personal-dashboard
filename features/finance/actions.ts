"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/jwt";
import {
  createTransactionSchema,
  transactionIdSchema,
  updateTransactionSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@/validators/finance.schema";
import { financeService } from "./service";

export async function createTransactionAction(input: CreateTransactionInput) {
  await requireAuth();
  const parsed = createTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Payload tidak valid." };
  }

  try {
    const transaction = await financeService.createTransaction(parsed.data);
    revalidatePath("/finance");
    revalidatePath("/finance/report");
    return { success: true, data: transaction };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan transaksi.",
    };
  }
}

export async function updateTransactionAction(input: UpdateTransactionInput) {
  await requireAuth();
  const parsed = updateTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Payload tidak valid." };
  }

  try {
    const transaction = await financeService.updateTransaction(parsed.data);
    revalidatePath("/finance");
    revalidatePath("/finance/report");
    return { success: true, data: transaction };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengupdate transaksi.",
    };
  }
}

export async function deleteTransactionAction(id: string) {
  await requireAuth();
  const parsed = transactionIdSchema.safeParse({ id });
  if (!parsed.success) {
    return { success: false, error: "ID transaksi tidak valid." };
  }

  try {
    await financeService.deleteTransaction(parsed.data.id);
    revalidatePath("/finance");
    revalidatePath("/finance/report");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus transaksi.",
    };
  }
}

export async function getCategoriesAction() {
  await requireAuth();
  return financeService.getCategories();
}

export async function getLabelSuggestionsAction() {
  await requireAuth();
  return financeService.getLabelSuggestions();
}

export async function getTransactionsAction() {
  await requireAuth();
  return financeService.getTransactions();
}

export async function getFinanceSummaryAction(startDate: string, endDate: string) {
  await requireAuth();
  return financeService.getSummary(startDate, endDate);
}
