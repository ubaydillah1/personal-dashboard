import type {
  CategorySummaryItem,
  DailyTrendItem,
  FinanceCategory,
  FinanceSummary,
  FinanceTransaction,
  LabelSuggestion,
  TransactionFilters,
} from "@/features/finance/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CreateTransactionInput, UpdateTransactionInput } from "@/validators/finance.schema";

type CategoryRow = {
  id: string;
  name: string;
  type: "expense" | "income" | "both";
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
};

type TransactionRow = {
  id: string;
  title: string;
  type: "expense" | "income";
  amount: number | string;
  date: string;
  category_id: string | null;
  category_name: string | null;
  payment_method: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

const DEFAULT_CATEGORIES: Array<Omit<FinanceCategory, "id" | "createdAt">> = [
  { name: "Makanan & Minuman", type: "expense", icon: "UtensilsCrossed", color: "#f97316", isDefault: true },
  { name: "Transportasi", type: "expense", icon: "Car", color: "#3b82f6", isDefault: true },
  { name: "Belanja", type: "expense", icon: "ShoppingBag", color: "#ec4899", isDefault: true },
  { name: "Tagihan & Utilitas", type: "expense", icon: "Receipt", color: "#eab308", isDefault: true },
  { name: "Hiburan & Rekreasi", type: "expense", icon: "Film", color: "#a855f7", isDefault: true },
  { name: "Kesehatan", type: "expense", icon: "HeartPulse", color: "#ef4444", isDefault: true },
  { name: "Pendidikan & Kerja", type: "expense", icon: "GraduationCap", color: "#06b6d4", isDefault: true },
  { name: "Pengeluaran Lainnya", type: "expense", icon: "HelpCircle", color: "#71717a", isDefault: true },
  { name: "Gaji Pokok", type: "income", icon: "Banknote", color: "#10b981", isDefault: true },
  { name: "Freelance & Side Job", type: "income", icon: "Laptop", color: "#14b8a6", isDefault: true },
  { name: "Investasi & Dividen", type: "income", icon: "TrendingUp", color: "#8b5cf6", isDefault: true },
  { name: "Bonus & Hadiah", type: "income", icon: "Gift", color: "#f59e0b", isDefault: true },
  { name: "Pemasukan Lainnya", type: "income", icon: "Coins", color: "#10b981", isDefault: true },
];

const STARTER_LABEL_SUGGESTIONS: LabelSuggestion[] = [
  { title: "Makan Siang", categoryId: null, categoryName: "Makanan & Minuman", type: "expense", count: 10 },
  { title: "Makan Malam", categoryId: null, categoryName: "Makanan & Minuman", type: "expense", count: 9 },
  { title: "Kopi / Minuman", categoryId: null, categoryName: "Makanan & Minuman", type: "expense", count: 8 },
  { title: "Bensin Motor / Mobil", categoryId: null, categoryName: "Transportasi", type: "expense", count: 7 },
  { title: "Gojek / Grab / Maxim", categoryId: null, categoryName: "Transportasi", type: "expense", count: 6 },
  { title: "Belanja Bulanan / Supermarket", categoryId: null, categoryName: "Belanja", type: "expense", count: 5 },
  { title: "Tagihan Listrik / Token", categoryId: null, categoryName: "Tagihan & Utilitas", type: "expense", count: 4 },
  { title: "Tagihan WiFi / Pulsa", categoryId: null, categoryName: "Tagihan & Utilitas", type: "expense", count: 4 },
  { title: "Langganan Netflix / Spotify", categoryId: null, categoryName: "Hiburan & Rekreasi", type: "expense", count: 3 },
  { title: "Gaji Bulanan", categoryId: null, categoryName: "Gaji Pokok", type: "income", count: 10 },
  { title: "Project Freelance", categoryId: null, categoryName: "Freelance & Side Job", type: "income", count: 5 },
];

function mapCategory(row: CategoryRow): FinanceCategory {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon || "Tag",
    color: row.color || "#3b82f6",
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

function mapTransaction(row: TransactionRow): FinanceTransaction {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    amount: Number(row.amount),
    date: row.date,
    categoryId: row.category_id,
    categoryName: row.category_name || "Lainnya",
    paymentMethod: row.payment_method || "Cash",
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const financeRepository = {
  async findCategories(): Promise<FinanceCategory[]> {
    const supabase = getSupabaseServerClient();
    try {
      const { data, error } = await supabase
        .from("finance_categories")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        if (error.code !== "PGRST205") {
          console.error("Error fetching finance categories:", error.message || error);
        }
        return DEFAULT_CATEGORIES.map((cat, index) => ({
          ...cat,
          id: `default-${index}`,
          createdAt: new Date().toISOString(),
        }));
      }

      if (!data || data.length === 0) {
        return DEFAULT_CATEGORIES.map((cat, index) => ({
          ...cat,
          id: `default-${index}`,
          createdAt: new Date().toISOString(),
        }));
      }

      return (data as CategoryRow[]).map(mapCategory);
    } catch (e) {
      console.error("Failed to query categories:", e);
      return DEFAULT_CATEGORIES.map((cat, index) => ({
        ...cat,
        id: `default-${index}`,
        createdAt: new Date().toISOString(),
      }));
    }
  },

  async findTransactions(filters?: TransactionFilters): Promise<FinanceTransaction[]> {
    const supabase = getSupabaseServerClient();
    let query = supabase.from("finance_transactions").select("*");

    if (filters?.startDate) {
      query = query.gte("date", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("date", filters.endDate);
    }
    if (filters?.type && filters.type !== "all") {
      query = query.eq("type", filters.type);
    }
    if (filters?.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }
    if (filters?.search && filters.search.trim()) {
      query = query.ilike("title", `%${filters.search.trim()}%`);
    }

    query = query.order("date", { ascending: false }).order("created_at", { ascending: false });

    try {
      const { data, error } = await query;
      if (error) {
        if (error.code !== "PGRST205") {
          console.error("Error fetching finance transactions:", error.message || error);
        }
        return [];
      }
      return ((data ?? []) as TransactionRow[]).map(mapTransaction);
    } catch (e) {
      console.error("Failed to query finance transactions:", e);
      return [];
    }
  },

  async findRecentLabelSuggestions(limit = 25): Promise<LabelSuggestion[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("finance_transactions")
      .select("title, category_id, category_name, type")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !data) {
      return STARTER_LABEL_SUGGESTIONS;
    }

    const titleFrequency = new Map<
      string,
      { categoryId: string | null; categoryName: string; type: "expense" | "income"; count: number }
    >();

    for (const item of data as TransactionRow[]) {
      const key = item.title.trim().toLowerCase();
      const existing = titleFrequency.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        titleFrequency.set(key, {
          categoryId: item.category_id,
          categoryName: item.category_name || "Lainnya",
          type: item.type,
          count: 1,
        });
      }
    }

    // Convert to list
    const fromHistory: LabelSuggestion[] = Array.from(titleFrequency.entries()).map(([key, value]) => {
      // Find original capitalization from first occurrence
      const original = (data as TransactionRow[]).find((t) => t.title.trim().toLowerCase() === key);
      return {
        title: original ? original.title.trim() : key,
        categoryId: value.categoryId,
        categoryName: value.categoryName,
        type: value.type,
        count: value.count,
      };
    });

    // Merge with starter suggestions for items not yet in history
    const historyKeys = new Set(fromHistory.map((h) => h.title.toLowerCase()));
    const extraStarters = STARTER_LABEL_SUGGESTIONS.filter((s) => !historyKeys.has(s.title.toLowerCase()));

    const combined = [...fromHistory, ...extraStarters];
    return combined.slice(0, limit);
  },

  async createTransaction(input: CreateTransactionInput): Promise<FinanceTransaction> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("finance_transactions")
      .insert({
        title: input.title,
        type: input.type,
        amount: input.amount,
        date: input.date,
        category_id: input.categoryId || null,
        category_name: input.categoryName || "Lainnya",
        payment_method: input.paymentMethod || "Cash",
        note: input.note || null,
      })
      .select("*")
      .single();

    if (error) throw new Error(`Failed to create transaction: ${error.message}`);
    return mapTransaction(data as TransactionRow);
  },

  async updateTransaction(input: UpdateTransactionInput): Promise<FinanceTransaction> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("finance_transactions")
      .update({
        title: input.title,
        type: input.type,
        amount: input.amount,
        date: input.date,
        category_id: input.categoryId || null,
        category_name: input.categoryName || "Lainnya",
        payment_method: input.paymentMethod || "Cash",
        note: input.note || null,
      })
      .eq("id", input.id)
      .select("*")
      .single();

    if (error) throw new Error(`Failed to update transaction: ${error.message}`);
    return mapTransaction(data as TransactionRow);
  },

  async deleteTransaction(id: string): Promise<void> {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("finance_transactions").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete transaction: ${error.message}`);
  },

  async getFinancialSummary(startDate: string, endDate: string): Promise<FinanceSummary> {
    const supabase = getSupabaseServerClient();
    const [transactionsResult, categoriesResult] = await Promise.all([
      supabase
        .from("finance_transactions")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true }),
      this.findCategories(),
    ]);

    const transactions = transactionsResult.error
      ? []
      : ((transactionsResult.data ?? []) as TransactionRow[]).map(mapTransaction);
    const categoryMap = new Map<string, FinanceCategory>();
    for (const cat of categoriesResult) {
      categoryMap.set(cat.name.toLowerCase(), cat);
    }

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = new Map<
      string,
      { amount: number; count: number; color: string; icon: string }
    >();
    const dailyMap = new Map<string, { income: number; expense: number }>();

    for (const t of transactions) {
      if (t.type === "income") {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;

        // Group expense categories
        const catName = t.categoryName || "Lainnya";
        const catMeta = categoryMap.get(catName.toLowerCase());
        const existing = categoryTotals.get(catName) || {
          amount: 0,
          count: 0,
          color: catMeta?.color || "#71717a",
          icon: catMeta?.icon || "Tag",
        };
        existing.amount += t.amount;
        existing.count += 1;
        categoryTotals.set(catName, existing);
      }

      // Group by daily
      const dayData = dailyMap.get(t.date) || { income: 0, expense: 0 };
      if (t.type === "income") {
        dayData.income += t.amount;
      } else {
        dayData.expense += t.amount;
      }
      dailyMap.set(t.date, dayData);
    }

    const netBalance = totalIncome - totalExpense;

    // Calculate days between start and end date
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayDiff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const dailyAverageExpense = totalExpense > 0 ? Math.round(totalExpense / dayDiff) : 0;

    // Category breakdown sorted by amount descending
    const categoryBreakdown: CategorySummaryItem[] = Array.from(categoryTotals.entries())
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
        color: data.color,
        icon: data.icon,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Build timeline daily trend
    const dailyTrend: DailyTrendItem[] = [];
    const curr = new Date(start);
    while (curr <= end) {
      const dateStr = curr.toISOString().split("T")[0];
      const dayData = dailyMap.get(dateStr) || { income: 0, expense: 0 };
      dailyTrend.push({
        date: dateStr,
        displayDate: curr.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        dayLabel: curr.toLocaleDateString("id-ID", { weekday: "short" }),
        income: dayData.income,
        expense: dayData.expense,
      });
      curr.setDate(curr.getDate() + 1);
    }

    return {
      startDate,
      endDate,
      totalIncome,
      totalExpense,
      netBalance,
      dailyAverageExpense,
      categoryBreakdown,
      dailyTrend,
      transactionCount: transactions.length,
    };
  },
};
