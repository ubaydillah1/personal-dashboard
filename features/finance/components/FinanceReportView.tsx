"use client";

import { useId, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Flame,
  Info,
  PieChart,
  Receipt,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import { FinanceExportDropdown } from "./FinanceExportDropdown";
import type { FinanceSummary } from "../types";
import { cn } from "@/lib/utils";

interface FinanceReportViewProps {
  summary: FinanceSummary;
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getHealthBadge(status: FinanceSummary["healthStatus"]) {
  switch (status) {
    case "healthy":
      return {
        label: "Keuangan Sehat & Aman",
        sublabel: "Pengeluaran terkendali dengan porsi tabungan optimal",
        badgeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        icon: CheckCircle2,
        barColor: "bg-emerald-500",
      };
    case "moderate":
      return {
        label: "Arus Kas Sedang",
        sublabel: "Rasio belanja masih dalam batas wajar",
        badgeColor: "border-sky-500/30 bg-sky-500/10 text-sky-400",
        icon: Info,
        barColor: "bg-sky-500",
      };
    case "warning":
      return {
        label: "Waspada Pengeluaran",
        sublabel: "Pengeluaran mendekati 100% dari total pemasukan",
        badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        icon: AlertTriangle,
        barColor: "bg-amber-500",
      };
    case "deficit":
      return {
        label: "Over-spending / Boncos",
        sublabel: "Pengeluaran melebihi uang masuk (Defisit)",
        badgeColor: "border-rose-500/30 bg-rose-500/10 text-rose-400",
        icon: AlertCircle,
        barColor: "bg-rose-500",
      };
    case "no_income":
    default:
      return {
        label: "Belum Ada Pemasukan",
        sublabel: "Hanya ada pengeluaran yang tercatat",
        badgeColor: "border-zinc-700 bg-zinc-800 text-zinc-300",
        icon: Info,
        barColor: "bg-zinc-600",
      };
  }
}

export function FinanceReportView({ summary, selectedMonth, onMonthChange }: FinanceReportViewProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const monthInputId = useId();

  const health = getHealthBadge(summary.healthStatus);

  const savingsRate =
    summary.totalIncome > 0
      ? Math.max(0, Math.round(((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100))
      : 0;

  // Max value for scaling daily chart
  const maxDailyValue = Math.max(
    ...summary.dailyTrend.map((d) => Math.max(d.income, d.expense)),
    100000
  );

  return (
    <div className="space-y-6">
      {/* Month Picker & Export Actions Header */}
      <div className="relative z-30 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-xl backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="size-5 text-sky-400" />
            Laporan Keuangan & Analitik Otomatis
          </h2>
          <p className="text-xs text-zinc-500">
            Deteksi over-spending, perbandingan tren bulanan, dan evaluasi arus kas
          </p>
        </div>

        {/* Right Controls: Month Selector + Export Excel */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor={monthInputId} className="text-xs font-medium text-zinc-400">
              Periode:
            </label>
            <div className="relative">
              <input
                id={monthInputId}
                type="month"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="h-9 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 text-xs font-semibold text-zinc-200 focus:border-sky-500/80 focus:outline-none [color-scheme:dark]"
              />
              <Calendar className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
            </div>
          </div>

          {/* Export Excel Dropdown Button */}
          <FinanceExportDropdown selectedMonth={selectedMonth} />
        </div>
      </div>

      {/* Smart Auto-Insights Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-950/40 via-zinc-900/80 to-zinc-900/90 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                <Sparkles className="size-4" />
              </span>
              <h3 className="text-sm font-bold text-zinc-100">Smart Financial Insights</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Evaluasi otomatis performa pengeluaran dan deteksi anomali bulan ini
            </p>
          </div>

          {/* Health Badge */}
          <div className={cn("inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 self-start", health.badgeColor)}>
            <health.icon className="size-4 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold leading-tight">{health.label}</div>
              <div className="text-[10px] opacity-80 leading-tight">{health.sublabel}</div>
            </div>
          </div>
        </div>

        {/* Bullet Insights */}
        {summary.insights && summary.insights.length > 0 ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {summary.insights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 text-xs text-zinc-300 leading-relaxed"
              >
                <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-sky-400" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-zinc-500">
            Belum ada cukup data transaksi pada periode ini untuk kalkulasi analitik.
          </p>
        )}
      </section>

      {/* KPI Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Income */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/30 to-zinc-900/80 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">Pemasukan</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
            {formatCurrency(summary.totalIncome)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">vs Bulan Lalu</span>
            {summary.previousMonth.totalIncome > 0 ? (
              <span
                className={cn(
                  "font-semibold inline-flex items-center gap-0.5",
                  summary.previousMonth.incomeDiffPercent >= 0 ? "text-emerald-400" : "text-amber-400"
                )}
              >
                {summary.previousMonth.incomeDiffPercent >= 0 ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {summary.previousMonth.incomeDiffPercent >= 0 ? "+" : ""}
                {summary.previousMonth.incomeDiffPercent}%
              </span>
            ) : (
              <span className="text-zinc-500">-</span>
            )}
          </div>
        </div>

        {/* Total Expense */}
        <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-950/30 to-zinc-900/80 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-red-400">Pengeluaran</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <ArrowDownLeft className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
            {formatCurrency(summary.totalExpense)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">vs Bulan Lalu</span>
            {summary.previousMonth.totalExpense > 0 ? (
              <span
                className={cn(
                  "font-semibold inline-flex items-center gap-0.5",
                  summary.previousMonth.expenseDiffPercent > 0
                    ? "text-rose-400"
                    : summary.previousMonth.expenseDiffPercent < 0
                    ? "text-emerald-400"
                    : "text-zinc-400"
                )}
              >
                {summary.previousMonth.expenseDiffPercent > 0 ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {summary.previousMonth.expenseDiffPercent > 0 ? "+" : ""}
                {summary.previousMonth.expenseDiffPercent}%
                <span className="text-[10px] font-normal text-zinc-500">
                  {summary.previousMonth.expenseDiffPercent > 0 ? "(Boros)" : "(Hemat)"}
                </span>
              </span>
            ) : (
              <span className="text-zinc-500">-</span>
            )}
          </div>
        </div>

        {/* Net Savings / Balance */}
        <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-b from-sky-950/30 to-zinc-900/80 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-sky-400">Cashflow Bersih</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <Wallet className="size-4" />
            </div>
          </div>
          <p
            className={cn(
              "mt-3 text-xl font-bold tracking-tight sm:text-2xl",
              summary.netBalance >= 0 ? "text-sky-400" : "text-rose-400"
            )}
          >
            {formatCurrency(summary.netBalance)}
          </p>
          <p className="mt-2 text-[11px] text-zinc-500">
            {summary.netBalance >= 0 ? `Surplus ${savingsRate}% dari pemasukan` : "Defisit (Pengeluaran > Pemasukan)"}
          </p>
        </div>

        {/* Daily Average Expense */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-950/30 to-zinc-900/80 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-violet-400">Rata-rata / Hari</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <TrendingDown className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
            {formatCurrency(summary.dailyAverageExpense)}
          </p>
          <p className="mt-2 text-[11px] text-zinc-500">
            {summary.projection
              ? `Proyeksi: ${formatCurrency(summary.projection.projectedExpense)} / bln`
              : "Laju pengeluaran harian"}
          </p>
        </div>
      </div>

      {/* Advanced Insights Row: Jumbo Expenses & Spending Gauge */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top 5 Jumbo Expenses */}
        <section className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                  <Receipt className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">Top 5 Pengeluaran Terbesar</h3>
                  <p className="text-[11px] text-zinc-500">Transaksi jumbo pemicu utama belanja</p>
                </div>
              </div>
            </div>

            {summary.topExpenses.length === 0 ? (
              <p className="py-8 text-center text-xs text-zinc-500">
                Belum ada data transaksi pengeluaran.
              </p>
            ) : (
              <div className="space-y-2 mt-2">
                {summary.topExpenses.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-3.5 py-2.5 transition hover:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200 line-clamp-1">{t.title}</div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                          <span>{t.date}</span>
                          <span>•</span>
                          <span className="text-zinc-400">{t.categoryName}</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-rose-400">
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Peak Spending Day Info Box */}
          {summary.peakExpenseDay && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-medium">
                <Flame className="size-4 text-amber-400" />
                <span>Hari Puncak: <strong>{summary.peakExpenseDay.displayDate} ({summary.peakExpenseDay.dayLabel})</strong></span>
              </div>
              <span className="font-bold text-amber-400">{formatCurrency(summary.peakExpenseDay.amount)}</span>
            </div>
          )}
        </section>

        {/* Spending Ratio & End of Month Projection Card */}
        <section className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                  <Zap className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">Rasio Belanja & Burn Rate</h3>
                  <p className="text-[11px] text-zinc-500">Persentase konsumsi pemasukan & estimasi</p>
                </div>
              </div>
            </div>

            {/* Expense to Income Ratio Bar */}
            <div className="space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-400">Rasio Pengeluaran / Pemasukan:</span>
                <span
                  className={cn(
                    "font-bold font-mono text-sm",
                    summary.expenseRatio > 100
                      ? "text-rose-400"
                      : summary.expenseRatio > 80
                      ? "text-amber-400"
                      : "text-emerald-400"
                  )}
                >
                  {summary.totalIncome > 0 ? `${summary.expenseRatio}%` : "N/A"}
                </span>
              </div>

              {/* Multi-tier progress bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-900 relative">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    summary.expenseRatio > 100
                      ? "bg-rose-500"
                      : summary.expenseRatio > 80
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min(100, summary.expenseRatio)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-zinc-500 pt-1">
                <span>0%</span>
                <span>65% (Batas Aman)</span>
                <span>85% (Waspada)</span>
                <span>100% (Defisit)</span>
              </div>
            </div>

            {/* Burn Rate / Projection Box */}
            {summary.projection ? (
              <div className="mt-4 space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Hari Berlalu:</span>
                  <span className="font-semibold text-zinc-200">
                    {summary.projection.daysElapsed} dari {summary.projection.totalDays} hari
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Proyeksi Pengeluaran Akhir Bulan:</span>
                  <span className="font-mono font-bold text-zinc-100">
                    {formatCurrency(summary.projection.projectedExpense)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                  <span className="text-zinc-400">Estimasi Cashflow Akhir Bulan:</span>
                  <span
                    className={cn(
                      "font-mono font-bold",
                      summary.projection.projectedNet >= 0 ? "text-sky-400" : "text-rose-400"
                    )}
                  >
                    {summary.projection.projectedNet >= 0 ? "+" : ""}
                    {formatCurrency(summary.projection.projectedNet)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 text-xs text-zinc-400">
                Laporan untuk periode lampau telah final. Rasio penghematan akhir periode:{" "}
                <strong className="text-zinc-200">{savingsRate}%</strong>.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Daily Cashflow Timeline Bar Chart */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Tren Cashflow Harian</h3>
            <p className="text-xs text-zinc-500">Perbandingan pemasukan vs pengeluaran tiap hari</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="size-2.5 rounded-sm bg-emerald-500 inline-block" />
              Pemasukan
            </span>
            <span className="flex items-center gap-1.5 text-red-400 font-medium">
              <span className="size-2.5 rounded-sm bg-red-500 inline-block" />
              Pengeluaran
            </span>
          </div>
        </div>

        {/* Chart Bars Scrollable */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[640px] h-56 flex items-end gap-1 pt-16 pb-1 border-b border-zinc-800 relative">
            {summary.dailyTrend.map((day, idx, arr) => {
              const incomeHeight = maxDailyValue > 0 ? (day.income / maxDailyValue) * 100 : 0;
              const expenseHeight = maxDailyValue > 0 ? (day.expense / maxDailyValue) * 100 : 0;
              const isHovered = hoveredDay === day.date;
              const isPeakDay = summary.peakExpenseDay?.date === day.date;

              // Smart positioning agar tooltip tidak terpotong di tepi kiri/kanan
              const alignClass =
                idx < 3
                  ? "left-0 translate-x-0"
                  : idx > arr.length - 4
                  ? "right-0 translate-x-0"
                  : "left-1/2 -translate-x-1/2";

              return (
                <div
                  key={day.date}
                  className={cn(
                    "flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer rounded-lg p-0.5 transition-colors",
                    isHovered ? "bg-zinc-800/40" : isPeakDay ? "bg-amber-500/5" : "hover:bg-zinc-800/20"
                  )}
                  onMouseEnter={() => setHoveredDay(day.date)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div
                      className={cn(
                        "pointer-events-none absolute top-1 z-30 flex flex-col items-center whitespace-nowrap rounded-xl border border-zinc-700/90 bg-zinc-950/95 px-3 py-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100",
                        alignClass
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-100">
                        <span>Tgl {day.displayDate}</span>
                        <span className="text-[10px] font-normal text-zinc-400">({day.dayLabel})</span>
                        {isPeakDay && <span className="text-[10px] text-amber-400 font-bold">🔥 Peak</span>}
                      </div>
                      <div className="mt-1 flex items-center gap-2.5 font-mono text-[10px]">
                        {day.income > 0 && (
                          <span className="text-emerald-400 font-semibold">
                            +{formatCurrency(day.income)}
                          </span>
                        )}
                        {day.expense > 0 && (
                          <span className="text-red-400 font-semibold">
                            -{formatCurrency(day.expense)}
                          </span>
                        )}
                        {day.income === 0 && day.expense === 0 && (
                          <span className="text-zinc-500 font-sans text-[10px]">
                            Tidak ada transaksi
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dual Bars */}
                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    {/* Income Bar */}
                    <div
                      className="w-1/2 max-w-[12px] bg-emerald-500/80 hover:bg-emerald-400 rounded-t-sm transition-all"
                      style={{ height: `${Math.max(incomeHeight, day.income > 0 ? 4 : 0)}%` }}
                    />
                    {/* Expense Bar */}
                    <div
                      className={cn(
                        "w-1/2 max-w-[12px] rounded-t-sm transition-all",
                        isPeakDay ? "bg-amber-500" : "bg-red-500/80 hover:bg-red-400"
                      )}
                      style={{ height: `${Math.max(expenseHeight, day.expense > 0 ? 4 : 0)}%` }}
                    />
                  </div>

                  {/* Date Label */}
                  <span
                    className={cn(
                      "text-[9px] mt-1.5 truncate transition-colors",
                      isHovered
                        ? "font-bold text-sky-400"
                        : isPeakDay
                        ? "font-bold text-amber-400"
                        : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  >
                    {day.displayDate.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category Breakdown Section with MoM */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <PieChart className="size-4 text-sky-400" />
              Breakdown Pengeluaran per Kategori & MoM
            </h3>
            <p className="text-xs text-zinc-500">Porsi pengeluaran dan komparasi perubahan vs bulan lalu</p>
          </div>
          <span className="text-xs font-semibold text-zinc-400">
            Total: {formatCurrency(summary.totalExpense)}
          </span>
        </div>

        {summary.categoryBreakdown.length === 0 ? (
          <p className="py-8 text-center text-xs text-zinc-500">
            Belum ada data pengeluaran pada periode ini.
          </p>
        ) : (
          <div className="space-y-4">
            {summary.categoryBreakdown.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex size-6 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800"
                      style={{ color: item.color }}
                    >
                      <CategoryIcon name={item.icon} className="size-3.5" />
                    </div>
                    <span className="font-semibold text-zinc-200">{item.name}</span>
                    <span className="text-[11px] text-zinc-500">({item.count} transaksi)</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* MoM Category Badge */}
                    {item.previousAmount > 0 ? (
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                          item.diffPercent > 0
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : item.diffPercent < 0
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-800 text-zinc-400"
                        )}
                      >
                        {item.diffPercent > 0 ? `▲ +${item.diffPercent}%` : item.diffPercent < 0 ? `▼ ${item.diffPercent}%` : "0%"} vs bln lalu
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded">
                        Baru
                      </span>
                    )}

                    <span className="font-semibold text-zinc-200">{formatCurrency(item.amount)}</span>
                    <span className="w-10 text-right font-mono text-xs font-bold text-sky-400">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-950">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color || "#3b82f6",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
