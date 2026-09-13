import { financeRepository } from "@/repositories/finance.repository";
import type { CreateTransactionInput, UpdateTransactionInput } from "@/validators/finance.schema";
import type { FinanceCategory, FinanceSummary, FinanceTransaction, LabelSuggestion, TransactionFilters } from "./types";

export const financeService = {
  async getTransactions(filters?: TransactionFilters): Promise<FinanceTransaction[]> {
    return financeRepository.findTransactions(filters);
  },

  async getCategories(): Promise<FinanceCategory[]> {
    return financeRepository.findCategories();
  },

  async getLabelSuggestions(): Promise<LabelSuggestion[]> {
    return financeRepository.findRecentLabelSuggestions();
  },

  async getSummary(startDate: string, endDate: string): Promise<FinanceSummary> {
    return financeRepository.getFinancialSummary(startDate, endDate);
  },

  async createTransaction(input: CreateTransactionInput): Promise<FinanceTransaction> {
    return financeRepository.createTransaction(input);
  },

  async updateTransaction(input: UpdateTransactionInput): Promise<FinanceTransaction> {
    return financeRepository.updateTransaction(input);
  },

  async deleteTransaction(id: string): Promise<void> {
    return financeRepository.deleteTransaction(id);
  },
};
