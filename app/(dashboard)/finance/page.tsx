import type { Metadata } from "next";
import { FinanceView } from "@/features/finance/components/FinanceView";

export const metadata: Metadata = {
  title: "Pencatatan Keuangan",
  description: "Catat pemasukan, pengeluaran, dan kelola cashflow harian.",
};

export default function FinancePage() {
  return <FinanceView />;
}
