import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FinanceReportClient } from "@/features/finance/components/FinanceReportClient";

export const metadata: Metadata = {
  title: "Laporan Keuangan",
  description: "Laporan, grafik cashflow harian, dan breakdown pengeluaran.",
};

export default function FinanceReportPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Back button & header */}
      <div className="flex items-center justify-between">
        <Link
          href="/finance"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke Pencatatan</span>
        </Link>
      </div>

      <FinanceReportClient />
    </div>
  );
}
