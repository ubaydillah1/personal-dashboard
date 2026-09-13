"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, Calendar, ChevronDown, Loader2 } from "lucide-react";
import { getExportDataAction } from "../actions";
import { generateAndDownloadFinanceExcel } from "../utils/excelExport";

interface FinanceExportDropdownProps {
  selectedMonth: string; // Format YYYY-MM
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function getMonthDetails(monthStr: string) {
  const [yearStr, mStr] = (monthStr || "").split("-");
  const year = Number(yearStr) || new Date().getFullYear();
  const monthIndex = (Number(mStr) || 1) - 1;
  const monthName = MONTH_NAMES[monthIndex] || "";
  
  const startDate = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const endDate = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return {
    year,
    monthName,
    periodLabel: `${monthName} ${year}`,
    startDate,
    endDate,
    monthlyFilename: `Laporan_Keuangan_${year}_${String(monthIndex + 1).padStart(2, "0")}.xlsx`,
    yearlyFilename: `Laporan_Keuangan_Tahun_${year}.xlsx`,
  };
}

export function FinanceExportDropdown({ selectedMonth }: FinanceExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingType, setExportingType] = useState<"month" | "year" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const details = getMonthDetails(selectedMonth);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleExport(type: "month" | "year") {
    setExportingType(type);
    setIsOpen(false);

    try {
      let startDate: string;
      let endDate: string;
      let periodLabel: string;
      let filename: string;

      if (type === "month") {
        startDate = details.startDate;
        endDate = details.endDate;
        periodLabel = `Bulan ${details.periodLabel}`;
        filename = details.monthlyFilename;
      } else {
        startDate = `${details.year}-01-01`;
        endDate = `${details.year}-12-31`;
        periodLabel = `Tahun ${details.year} (Januari - Desember)`;
        filename = details.yearlyFilename;
      }

      // Fetch export data via authenticated server action
      const data = await getExportDataAction(startDate, endDate);

      // Generate & trigger Excel download
      await generateAndDownloadFinanceExcel({
        periodLabel,
        filename,
        transactions: data.transactions,
        summary: data.summary,
      });
    } catch (error) {
      console.error("Gagal export excel:", error);
      alert("Terjadi kesalahan saat mengeksport data Excel. Silakan coba lagi.");
    } finally {
      setExportingType(null);
    }
  }

  const isExporting = exportingType !== null;

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        type="button"
        disabled={isExporting}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/60 px-3 text-xs font-semibold text-emerald-400 shadow-sm transition hover:border-emerald-500/60 hover:bg-emerald-900/50 hover:text-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isExporting ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="size-3.5" />
        )}
        <span>{isExporting ? "Menyiapkan Excel..." : "Export Excel"}</span>
        <ChevronDown className="size-3 text-emerald-500/70" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-zinc-700 bg-zinc-950 p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Format Laporan Excel (.xlsx)
          </div>

          {/* Export Bulan Ini */}
          <button
            type="button"
            onClick={() => handleExport("month")}
            className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-zinc-800/80 text-zinc-200 hover:text-zinc-50 cursor-pointer group"
          >
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/25 group-hover:border-emerald-500/50">
              <Calendar className="size-3.5" />
            </div>
            <div>
              <p className="font-semibold leading-tight text-zinc-100">
                Export Bulan Ini
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-400">
                {details.periodLabel}
              </p>
            </div>
          </button>

          {/* Export Tahunan */}
          <button
            type="button"
            onClick={() => handleExport("year")}
            className="mt-1 flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-zinc-800/80 text-zinc-200 hover:text-zinc-50 cursor-pointer group"
          >
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-sky-500/30 bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/25 group-hover:border-sky-500/50">
              <Download className="size-3.5" />
            </div>
            <div>
              <p className="font-semibold leading-tight text-zinc-100">
                Export 1 Tahun Penuh
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-400">
                Tahun {details.year} (Jan - Des)
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
