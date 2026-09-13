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

      // Deduplicate categories by lowercase name and type
      const seen = new Set<string>();
      const uniqueCategories: FinanceCategory[] = [];
      for (const row of data as CategoryRow[]) {
        const key = `${row.name.trim().toLowerCase()}__${row.type}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueCategories.push(mapCategory(row));
        }
      }

      return uniqueCategories;
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

    // Determine previous month dates (MoM)
    const [startYear, startMonth] = startDate.split("-").map(Number);
    const prevDateObj = new Date(startYear, startMonth - 2, 1);
    const prevYear = prevDateObj.getFullYear();
    const prevMonthStr = String(prevDateObj.getMonth() + 1).padStart(2, "0");
    const prevStartDate = `${prevYear}-${prevMonthStr}-01`;
    const prevLastDay = new Date(prevYear, prevDateObj.getMonth() + 1, 0).getDate();
    const prevEndDate = `${prevYear}-${prevMonthStr}-${String(prevLastDay).padStart(2, "0")}`;

    const [currTransactionsResult, prevTransactionsResult, categoriesResult] = await Promise.all([
      supabase
        .from("finance_transactions")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true }),
      supabase
        .from("finance_transactions")
        .select("*")
        .gte("date", prevStartDate)
        .lte("date", prevEndDate),
      this.findCategories(),
    ]);

    const transactions = currTransactionsResult.error
      ? []
      : ((currTransactionsResult.data ?? []) as TransactionRow[]).map(mapTransaction);

    const prevTransactions = prevTransactionsResult.error
      ? []
      : ((prevTransactionsResult.data ?? []) as TransactionRow[]).map(mapTransaction);

    const categoryMap = new Map<string, FinanceCategory>();
    for (const cat of categoriesResult) {
      categoryMap.set(cat.name.toLowerCase(), cat);
    }

    // Process Previous Month
    let prevTotalIncome = 0;
    let prevTotalExpense = 0;
    const prevCategoryTotals = new Map<string, number>();

    for (const pt of prevTransactions) {
      if (pt.type === "income") {
        prevTotalIncome += pt.amount;
      } else {
        prevTotalExpense += pt.amount;
        const catName = pt.categoryName || "Lainnya";
        prevCategoryTotals.set(catName, (prevCategoryTotals.get(catName) || 0) + pt.amount);
      }
    }

    const prevNetBalance = prevTotalIncome - prevTotalExpense;
    const expenseDiffPercent =
      prevTotalExpense > 0
        ? Math.round(((transactions.filter((t) => t.type === "expense").reduce((acc, c) => acc + c.amount, 0) - prevTotalExpense) / prevTotalExpense) * 100)
        : 0;
    const incomeDiffPercent =
      prevTotalIncome > 0
        ? Math.round(((transactions.filter((t) => t.type === "income").reduce((acc, c) => acc + c.amount, 0) - prevTotalIncome) / prevTotalIncome) * 100)
        : 0;

    // Process Current Month
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = new Map<
      string,
      { amount: number; count: number; color: string; icon: string }
    >();
    const dailyMap = new Map<string, { income: number; expense: number; maxExpenseTitle?: string; maxExpenseAmount: number }>();

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
      const dayData = dailyMap.get(t.date) || { income: 0, expense: 0, maxExpenseAmount: 0 };
      if (t.type === "income") {
        dayData.income += t.amount;
      } else {
        dayData.expense += t.amount;
        if (t.amount > dayData.maxExpenseAmount) {
          dayData.maxExpenseAmount = t.amount;
          dayData.maxExpenseTitle = t.title;
        }
      }
      dailyMap.set(t.date, dayData);
    }

    const netBalance = totalIncome - totalExpense;

    // Calculate days between start and end date
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayDiff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const dailyAverageExpense = totalExpense > 0 ? Math.round(totalExpense / dayDiff) : 0;

    // Top 5 Jumbo Expenses
    const topExpenses = transactions
      .filter((t) => t.type === "expense")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        title: t.title,
        amount: t.amount,
        date: t.date,
        categoryName: t.categoryName,
      }));

    // Category breakdown with MoM comparison
    const categoryBreakdown = Array.from(categoryTotals.entries())
      .map(([name, data]) => {
        const previousAmount = prevCategoryTotals.get(name) || 0;
        const diffAmount = data.amount - previousAmount;
        const diffPercent =
          previousAmount > 0
            ? Math.round((diffAmount / previousAmount) * 100)
            : 0;
        return {
          name,
          amount: data.amount,
          percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
          color: data.color,
          icon: data.icon,
          count: data.count,
          previousAmount,
          diffAmount,
          diffPercent,
          isNew: previousAmount === 0 && data.amount > 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // Build timeline daily trend & find peak expense day
    let peakDay: { date: string; displayDate: string; dayLabel: string; amount: number; topTransactionTitle?: string } | null = null;
    const dailyTrend: DailyTrendItem[] = [];
    const curr = new Date(start);

    while (curr <= end) {
      const dateStr = curr.toISOString().split("T")[0];
      const dayData = dailyMap.get(dateStr) || { income: 0, expense: 0, maxExpenseAmount: 0 };
      const displayDate = curr.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      const dayLabel = curr.toLocaleDateString("id-ID", { weekday: "short" });

      dailyTrend.push({
        date: dateStr,
        displayDate,
        dayLabel,
        income: dayData.income,
        expense: dayData.expense,
      });

      if (dayData.expense > 0 && (!peakDay || dayData.expense > peakDay.amount)) {
        peakDay = {
          date: dateStr,
          displayDate,
          dayLabel,
          amount: dayData.expense,
          topTransactionTitle: dayData.maxExpenseTitle,
        };
      }

      curr.setDate(curr.getDate() + 1);
    }

    // Health calculation
    const expenseRatio = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : (totalExpense > 0 ? 100 : 0);
    let healthStatus: "healthy" | "moderate" | "warning" | "deficit" | "no_income" = "healthy";

    if (totalIncome === 0 && totalExpense > 0) {
      healthStatus = "no_income";
    } else if (totalIncome > 0) {
      if (expenseRatio <= 65) {
        healthStatus = "healthy";
      } else if (expenseRatio <= 85) {
        healthStatus = "moderate";
      } else if (expenseRatio <= 100) {
        healthStatus = "warning";
      } else {
        healthStatus = "deficit";
      }
    }

    // Projection calculation (if current month or within active period)
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === startYear && today.getMonth() + 1 === startMonth;

    let projection = null;
    if (isCurrentMonth) {
      const daysElapsed = Math.min(dayDiff, Math.max(1, today.getDate()));
      const projectedExpense = Math.round((totalExpense / daysElapsed) * dayDiff);
      const projectedNet = totalIncome - projectedExpense;
      projection = {
        projectedExpense,
        daysElapsed,
        totalDays: dayDiff,
        isProjectedDeficit: totalIncome > 0 && projectedExpense > totalIncome,
        projectedNet,
      };
    }

    // Smart Auto-Insights Generation
    const insights: string[] = [];

    // 1. Health / Cashflow Status
    if (healthStatus === "deficit") {
      insights.push(
        `🚨 Terjadi over-spending: Pengeluaran melampaui pemasukan sebesar ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Math.abs(netBalance))} (Rasio belanja ${expenseRatio}%).`
      );
    } else if (healthStatus === "warning") {
      insights.push(
        `⚠️ Arus kas dalam mode waspada: Pengeluaran menyerap ${expenseRatio}% dari total pemasukan bulan ini.`
      );
    } else if (healthStatus === "healthy" && totalIncome > 0) {
      insights.push(
        `✅ Kondisi finansial sangat sehat: Rasio belanja ${expenseRatio}%, berhasil mengamankan surplus ${100 - expenseRatio}%.`
      );
    } else if (healthStatus === "no_income") {
      insights.push(
        `ℹ️ Tercatat pengeluaran ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalExpense)} tanpa ada pemasukan yang dicatat pada periode ini.`
      );
    }

    // 2. MoM Comparison
    if (prevTotalExpense > 0) {
      if (expenseDiffPercent > 15) {
        insights.push(
          `📈 Pengeluaran membengkak +${expenseDiffPercent}% lebih tinggi dibandingkan bulan sebelumnya.`
        );
      } else if (expenseDiffPercent < -10) {
        insights.push(
          `👏 Pola hemat berhasil: Pengeluaran turun ${Math.abs(expenseDiffPercent)}% lebih hemat dari bulan lalu.`
        );
      } else {
        insights.push(
          `📊 Pengeluaran stabil dengan selisih ${expenseDiffPercent >= 0 ? `+${expenseDiffPercent}` : expenseDiffPercent}% vs bulan lalu.`
        );
      }
    }

    // 3. Dominant Category & Spikes
    if (categoryBreakdown.length > 0) {
      const topCat = categoryBreakdown[0];
      insights.push(
        `🏷️ Pos '${topCat.name}' menjadi beban pengeluaran terbesar (${topCat.percentage}% dari total belanja).`
      );

      const spikedCat = categoryBreakdown.find((c) => !c.isNew && c.diffPercent >= 50 && c.amount >= 100000);
      if (spikedCat) {
        insights.push(
          `⚡ Lonjakan terdeteksi: Biaya '${spikedCat.name}' naik tajam +${spikedCat.diffPercent}% dibanding bulan lalu.`
        );
      }
    }

    // 4. Peak Day
    if (peakDay && peakDay.amount > dailyAverageExpense * 1.5 && peakDay.amount >= 100000) {
      insights.push(
        `🔥 Hari terboros terjadi pada ${peakDay.displayDate} (${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(peakDay.amount)})${
          peakDay.topTransactionTitle ? ` dipicu '${peakDay.topTransactionTitle}'` : ""
        }.`
      );
    }

    // 5. Projection Warning
    if (projection && projection.isProjectedDeficit) {
      insights.push(
        `⚠️ Proyeksi akhir bulan: Jika laju belanja bertahan (${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(dailyAverageExpense)}/hari), pengeluaran diprediksi tembus ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(projection.projectedExpense)} (Defisit).`
      );
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
      healthStatus,
      expenseRatio,
      previousMonth: {
        totalIncome: prevTotalIncome,
        totalExpense: prevTotalExpense,
        netBalance: prevNetBalance,
        expenseDiffPercent,
        incomeDiffPercent,
      },
      topExpenses,
      peakExpenseDay: peakDay,
      projection,
      insights,
    };
  },
};
