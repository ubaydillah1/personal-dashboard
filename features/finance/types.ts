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

export type HealthStatus = "healthy" | "moderate" | "warning" | "deficit" | "no_income";

export interface PreviousPeriodSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  expenseDiffPercent: number; // e.g. +15.5 or -10.2
  incomeDiffPercent: number;
}

export interface TopExpenseItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  categoryName: string;
}

export interface PeakExpenseDay {
  date: string;
  displayDate: string;
  dayLabel: string;
  amount: number;
  topTransactionTitle?: string;
}

export interface ExpenseProjection {
  projectedExpense: number;
  daysElapsed: number;
  totalDays: number;
  isProjectedDeficit: boolean;
  projectedNet: number;
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

export interface CategoryMoMItem extends CategorySummaryItem {
  previousAmount: number;
  diffAmount: number;
  diffPercent: number;
  isNew: boolean;
}

export interface FinanceSummary {
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  dailyAverageExpense: number;
  categoryBreakdown: CategoryMoMItem[];
  dailyTrend: DailyTrendItem[];
  transactionCount: number;
  // Advanced Analytics
  healthStatus: HealthStatus;
  expenseRatio: number; // Total expense / total income * 100
  previousMonth: PreviousPeriodSummary;
  topExpenses: TopExpenseItem[];
  peakExpenseDay: PeakExpenseDay | null;
  projection: ExpenseProjection | null;
  insights: string[];
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: TransactionType | "all";
  categoryId?: string;
  search?: string;
}
