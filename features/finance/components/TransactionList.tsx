"use client";

import { useId, useMemo, useState, useTransition } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Receipt,
  Search,
  Trash2,
} from "lucide-react";
import { useDeleteTransaction } from "../hooks";
import type { FinanceCategory, FinanceTransaction, TransactionType } from "../types";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const targetDate = new Date(d);
  targetDate.setHours(0, 0, 0, 0);

  const timeDiff = targetDate.getTime() - today.getTime();
  const dayDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));

  const formattedDate = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (dayDiff === 0) return `Hari Ini · ${formattedDate}`;
  if (dayDiff === -1) return `Kemarin · ${formattedDate}`;

  const dayName = d.toLocaleDateString("id-ID", { weekday: "long" });
  return `${dayName} · ${formattedDate}`;
}

export function TransactionList({ transactions, categories }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const searchInputId = useId();
  const categoryFilterId = useId();
  const deleteMutation = useDeleteTransaction();

  // Filter transactions
  const filtered = useMemo(() => {
    return (transactions || []).filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (categoryFilter !== "all" && t.categoryId !== categoryFilter && t.categoryName !== categoryFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesNote = t.note?.toLowerCase().includes(query);
        const matchesCategory = t.categoryName?.toLowerCase().includes(query);
        const matchesWallet = t.paymentMethod?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesNote && !matchesCategory && !matchesWallet) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, { transactions: FinanceTransaction[]; totalIncome: number; totalExpense: number }>();

    for (const t of filtered) {
      const existing = map.get(t.date) || { transactions: [], totalIncome: 0, totalExpense: 0 };
      existing.transactions.push(t);
      if (t.type === "income") {
        existing.totalIncome += t.amount;
      } else {
        existing.totalExpense += t.amount;
      }
      map.set(t.date, existing);
    }

    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  // Filtered totals
  const totalIncome = useMemo(
    () => filtered.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0),
    [filtered]
  );
  const totalExpense = useMemo(
    () => filtered.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0),
    [filtered]
  );
  const netBalance = totalIncome - totalExpense;

  function handleDelete(id: string) {
    if (!window.confirm("Hapus transaksi ini?")) return;
    setDeletingId(id);
    deleteMutation.mutate(id, {
      onSettled: () => setDeletingId(null),
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters & Search Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-xl backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <label htmlFor={searchInputId} className="sr-only">
            Cari transaksi
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input
            id={searchInputId}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari transaksi, catatan, kategori..."
            className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-sky-500/80 focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-sky-500/20"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter Buttons */}
          <div className="flex rounded-lg border border-zinc-800 bg-zinc-950/80 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition",
                typeFilter === "all" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("expense")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition",
                typeFilter === "expense" ? "bg-red-500/20 text-red-400" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("income")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition",
                typeFilter === "income" ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Pemasukan
            </button>
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <label htmlFor={categoryFilterId} className="sr-only">
              Filter kategori
            </label>
            <select
              id={categoryFilterId}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 text-xs text-zinc-300 focus:border-sky-500/80 focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mini Summary Banner for Current Filter */}
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 text-center">
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Pemasukan</p>
          <p className="text-xs font-semibold text-emerald-400 sm:text-sm">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="space-y-0.5 border-x border-zinc-800">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Pengeluaran</p>
          <p className="text-xs font-semibold text-red-400 sm:text-sm">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Selisih</p>
          <p
            className={cn(
              "text-xs font-semibold sm:text-sm",
              netBalance >= 0 ? "text-sky-400" : "text-amber-400"
            )}
          >
            {formatCurrency(netBalance)}
          </p>
        </div>
      </div>

      {/* Transaction List Grouped by Date */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/40 py-12 text-center text-zinc-500">
          <Receipt className="mb-3 size-10 text-zinc-600" />
          <p className="text-sm font-medium text-zinc-400">Belum ada catatan transaksi</p>
          <p className="mt-1 text-xs text-zinc-600">
            {searchTerm || typeFilter !== "all" || categoryFilter !== "all"
              ? "Tidak ada transaksi yang cocok dengan filter yang dipilih."
              : "Gunakan form di atas untuk mencatat pemasukan atau pengeluaran pertamamu."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([dateKey, group]) => (
            <div key={dateKey} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-sm">
              {/* Date Header Strip */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 py-2 text-xs">
                <span className="font-semibold text-zinc-300">{formatDateHeader(dateKey)}</span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  {group.totalIncome > 0 && (
                    <span className="text-emerald-400">+{formatCurrency(group.totalIncome)}</span>
                  )}
                  {group.totalExpense > 0 && (
                    <span className="text-red-400">-{formatCurrency(group.totalExpense)}</span>
                  )}
                </div>
              </div>

              {/* Transactions in Date Group */}
              <div className="divide-y divide-zinc-800/60">
                {group.transactions.map((transaction) => {
                  const isExpense = transaction.type === "expense";
                  const isDeleting = deletingId === transaction.id;

                  return (
                    <div
                      key={transaction.id}
                      className={cn(
                        "group flex items-center justify-between px-4 py-3 transition hover:bg-zinc-800/30",
                        isDeleting && "opacity-50 pointer-events-none"
                      )}
                    >
                      {/* Left: Icon + Details */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                            isExpense
                              ? "border-red-500/20 bg-red-500/10 text-red-400"
                              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          )}
                        >
                          {isExpense ? (
                            <ArrowDownLeft className="size-4" />
                          ) : (
                            <ArrowUpRight className="size-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-zinc-100">{transaction.title}</p>
                            <span className="inline-flex items-center rounded-md border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 shrink-0">
                              {transaction.categoryName}
                            </span>
                          </div>

                          {transaction.note ? (
                            <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                              {transaction.note}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* Right: Amount & Delete button */}
                      <div className="flex items-center gap-3 shrink-0 pl-3">
                        <span
                          className={cn(
                            "font-mono text-sm font-bold tracking-tight",
                            isExpense ? "text-red-400" : "text-emerald-400"
                          )}
                        >
                          {isExpense ? "-" : "+"} {formatCurrency(transaction.amount)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDelete(transaction.id)}
                          title="Hapus transaksi"
                          disabled={isDeleting}
                          className="flex size-7 items-center justify-center rounded-lg text-zinc-500 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                        >
                          {isDeleting ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
