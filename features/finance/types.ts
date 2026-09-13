export type TransactionType = "expense" | "income";

export interface FinanceCategory {
  id: string;
  name: string;
  type: "expense" | "income" | "both";
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export interface FinanceTransaction {
  id: string;
  title: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string | null;
  categoryName: string;
  paymentMethod: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabelSuggestion {
  title: string;
  categoryId: string | null;
  categoryName: string;
  type: TransactionType;
  count: number;
}

export interface CategorySummaryItem {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  count: number;
}

export interface DailyTrendItem {
  date: string;
  displayDate: string;
  dayLabel: string;
  income: number;
  expense: number;
}

export interface FinanceSummary {
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  dailyAverageExpense: number;
  categoryBreakdown: CategorySummaryItem[];
  dailyTrend: DailyTrendItem[];
  transactionCount: number;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: TransactionType | "all";
  categoryId?: string;
  search?: string;
}
