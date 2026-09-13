"use client";

import Link from "next/link";
import { BarChart3, PlusCircle, Sparkles, Wallet } from "lucide-react";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import { useFinanceCategories, useFinanceSuggestions, useFinanceTransactions } from "../hooks";
import { FinanceLoading } from "./FinanceLoading";

export function FinanceView() {
  const { data: categories = [], isLoading: isLoadingCat } = useFinanceCategories();
  const { data: suggestions = [] } = useFinanceSuggestions();
  const { data: transactions = [], isLoading: isLoadingTx } = useFinanceTransactions();

  // Hanya tampilkan skeleton jika benar-benar pertama kali (cache kosong)
  const isInitialLoading = (isLoadingCat || isLoadingTx) && categories.length === 0 && transactions.length === 0;

  if (isInitialLoading) {
    return <FinanceLoading />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400">
              <Wallet className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
                Catatan Keuangan
              </h1>
              <p className="text-xs text-zinc-400">
                Pencatatan pemasukan & pengeluaran dengan smart autocomplete label
              </p>
            </div>
          </div>
        </div>

        {/* Link to Financial Report */}
        <Link
          href="/finance/report"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 shadow-sm transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-50"
        >
          <BarChart3 className="size-4 text-sky-400" />
          <span>Lihat Laporan & Analitik</span>
        </Link>
      </div>

      {/* Main Content: Form + List */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        {/* Left: Input Form */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <PlusCircle className="size-3.5 text-sky-400" />
              Input Transaksi Baru
            </h2>
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Sparkles className="size-3 text-sky-400" />
              Auto Today
            </span>
          </div>

          <TransactionForm categories={categories} suggestions={suggestions} />
        </div>

        {/* Right: History List & Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Riwayat Transaksi
            </h2>
            <span className="text-[11px] text-zinc-500">
              Total {transactions.length} transaksi
            </span>
          </div>

          <TransactionList transactions={transactions} categories={categories} />
        </div>
      </div>
    </div>
  );
}
