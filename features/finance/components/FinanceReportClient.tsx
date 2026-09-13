"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FinanceReportView } from "@/features/finance/components/FinanceReportView";
import { useFinanceSummary } from "../hooks";
import type { FinanceSummary } from "@/features/finance/types";
import { FinanceReportLoading } from "./FinanceReportLoading";

interface FinanceReportClientProps {
  summary?: FinanceSummary;
  initialMonth?: string;
}

function getCurrentMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthDates(monthStr: string) {
  const [y, m] = (monthStr || getCurrentMonthString()).split("-").map(Number);
  const startDate = `${monthStr}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const endDate = `${monthStr}-${String(lastDay).padStart(2, "0")}`;
  return { startDate, endDate };
}

export function FinanceReportClient({ summary: initialSummary, initialMonth }: FinanceReportClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultMonth = initialMonth || getCurrentMonthString();
  const currentMonth = searchParams.get("month") || defaultMonth;

  const { startDate, endDate } = getMonthDates(currentMonth);
  const { data: summary, isLoading } = useFinanceSummary(
    startDate,
    endDate,
    currentMonth === initialMonth ? initialSummary : undefined
  );

  function handleMonthChange(newMonth: string) {
    router.push(`/finance/report?month=${newMonth}`);
  }

  if (isLoading && !summary) {
    return <FinanceReportLoading />;
  }

  if (!summary) {
    return <FinanceReportLoading />;
  }

  return (
    <FinanceReportView
      summary={summary}
      selectedMonth={currentMonth}
      onMonthChange={handleMonthChange}
    />
  );
}
