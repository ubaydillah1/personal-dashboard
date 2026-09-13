"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransactionAction,
  deleteTransactionAction,
  getCategoriesAction,
  getFinanceSummaryAction,
  getLabelSuggestionsAction,
  getTransactionsAction,
  updateTransactionAction,
} from "./actions";
import type { FinanceCategory, FinanceSummary, FinanceTransaction, LabelSuggestion } from "./types";
import type { CreateTransactionInput, UpdateTransactionInput } from "@/validators/finance.schema";

export const FINANCE_QUERY_KEYS = {
  all: ["finance"] as const,
  categories: ["finance", "categories"] as const,
  suggestions: ["finance", "suggestions"] as const,
  transactions: ["finance", "transactions"] as const,
  summary: (startDate: string, endDate: string) => ["finance", "summary", startDate, endDate] as const,
};

export function useFinanceCategories(initialData?: FinanceCategory[]) {
  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.categories,
    queryFn: () => getCategoriesAction(),
    initialData,
  });
}

export function useFinanceSuggestions(initialData?: LabelSuggestion[]) {
  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.suggestions,
    queryFn: () => getLabelSuggestionsAction(),
    initialData,
  });
}

export function useFinanceTransactions(initialData?: FinanceTransaction[]) {
  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.transactions,
    queryFn: () => getTransactionsAction(),
    initialData,
  });
}

export function useFinanceSummary(startDate: string, endDate: string, initialData?: FinanceSummary) {
  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.summary(startDate, endDate),
    queryFn: () => getFinanceSummaryAction(startDate, endDate),
    initialData,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => createTransactionAction(input),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEYS.all });
      }
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTransactionInput) => updateTransactionAction(input),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEYS.all });
      }
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransactionAction(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEYS.all });
      }
    },
  });
}
