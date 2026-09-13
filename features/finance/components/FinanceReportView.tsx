"use client";

import { useId, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Calendar,
  PieChart,
  TrendingDown,
  Wallet,
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

export function FinanceReportView({ summary, selectedMonth, onMonthChange }: FinanceReportViewProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const monthInputId = useId();

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
            Laporan Keuangan & Analitik
          </h2>
          <p className="text-xs text-zinc-500">
            Ringkasan cashflow, tren harian, dan breakdown pengeluaran
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
          <p className="mt-1 text-[11px] text-zinc-500">Total uang masuk periode ini</p>
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
          <p className="mt-1 text-[11px] text-zinc-500">Total uang keluar periode ini</p>
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
              summary.netBalance >= 0 ? "text-sky-400" : "text-amber-400"
            )}
          >
            {formatCurrency(summary.netBalance)}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
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
          <p className="mt-1 text-[11px] text-zinc-500">Estimasi spending harian</p>
        </div>
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
                    isHovered ? "bg-zinc-800/40" : "hover:bg-zinc-800/20"
                  )}
                  onMouseEnter={() => setHoveredDay(day.date)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Tooltip on hover (Ditaruh di top-1 dengan headroom luas, anti terpotong) */}
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
                      className="w-1/2 max-w-[12px] bg-red-500/80 hover:bg-red-400 rounded-t-sm transition-all"
                      style={{ height: `${Math.max(expenseHeight, day.expense > 0 ? 4 : 0)}%` }}
                    />
                  </div>

                  {/* Date Label */}
                  <span
                    className={cn(
                      "text-[9px] mt-1.5 truncate transition-colors",
                      isHovered ? "font-bold text-sky-400" : "text-zinc-500 group-hover:text-zinc-300"
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

      {/* Category Breakdown Section */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <PieChart className="size-4 text-sky-400" />
              Breakdown Pengeluaran per Kategori
            </h3>
            <p className="text-xs text-zinc-500">Persentase dan total pengeluaran untuk setiap pos biaya</p>
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
          <div className="space-y-3">
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
                  <div className="flex items-center gap-2">
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
