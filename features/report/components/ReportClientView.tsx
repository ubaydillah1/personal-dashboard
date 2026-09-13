"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useReport } from "../hooks";
import { ReportLoading } from "./ReportLoading";
import { ReportView } from "./ReportView";

const filters = [
  { mode: "overall", label: "Overall" },
  { mode: "week", label: "This Week" },
  { mode: "month", label: "This Month" },
];

export function ReportClientView() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") || "week";
  const initialStart = searchParams.get("start") || "";
  const initialEnd = searchParams.get("end") || "";

  const [mode, setMode] = useState<string>(initialMode);
  const [customStart, setCustomStart] = useState<string>(initialStart);
  const [customEnd, setCustomEnd] = useState<string>(initialEnd);

  const queryParams = useMemo(() => {
    if (mode === "custom") {
      return { mode: "custom", start: customStart, end: customEnd };
    }
    return { mode };
  }, [mode, customStart, customEnd]);

  const { data: report, isLoading, isFetching } = useReport(queryParams);

  // Pola isInitialLoading: Skeleton hanya muncul saat cache benar-benar kosong di awal
  const isInitialLoading = isLoading && !report;

  if (isInitialLoading) {
    return <ReportLoading />;
  }

  function handleFilterClick(newMode: string) {
    setMode(newMode);
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMode("custom");
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight text-zinc-50">Report</h1>
          <p className="mt-1 text-sm leading-6 text-zinc-400">
            See which tasks are skipped most often and when the gaps happen.
          </p>
        </div>
        {isFetching && !isLoading ? (
          <span className="text-xs text-zinc-500 animate-pulse">Updating...</span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = mode === filter.mode;
          return (
            <button
              key={filter.mode}
              type="button"
              onClick={() => handleFilterClick(filter.mode)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-800 text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleCustomSubmit} className="flex flex-wrap gap-2">
        <input
          type="date"
          value={customStart}
          onChange={(e) => setCustomStart(e.target.value)}
          className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm text-zinc-100 outline-none focus:border-emerald-400"
        />
        <input
          type="date"
          value={customEnd}
          onChange={(e) => setCustomEnd(e.target.value)}
          className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm text-zinc-100 outline-none focus:border-emerald-400"
        />
        <Button
          type="submit"
          variant={mode === "custom" ? "default" : "outline"}
          className="h-9 text-sm"
        >
          Custom
        </Button>
      </form>

      {report ? (
        <ReportView
          totalTasks={report.totalTasks}
          completedTasks={report.completedTasks}
          summaries={report.summaries}
        />
      ) : null}
    </div>
  );
}
