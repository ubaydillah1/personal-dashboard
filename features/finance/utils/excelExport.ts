import ExcelJS from "exceljs";
import type { FinanceSummary, FinanceTransaction } from "../types";

export interface ExportExcelOptions {
  periodLabel: string;
  filename: string;
  transactions: FinanceTransaction[];
  summary: FinanceSummary;
}

const CURRENCY_FORMAT = '"Rp "#,##0;[Red]("-Rp "#,##0);"-"';
const PERCENT_FORMAT = '0.0"%';

export async function generateAndDownloadFinanceExcel({
  periodLabel,
  filename,
  transactions,
  summary,
}: ExportExcelOptions) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Tracker Dashboard";
  workbook.lastModifiedBy = "Tracker Dashboard";
  workbook.created = new Date();
  workbook.modified = new Date();

  // -------------------------------------------------------------
  // SHEET 1: RINGKASAN EKSEKUTIF
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet("Ringkasan Eksekutif", {
    views: [{ showGridLines: true }],
  });

  summarySheet.columns = [
    { width: 5 },  // A (padding)
    { width: 28 }, // B
    { width: 20 }, // C
    { width: 20 }, // D
    { width: 16 }, // E
    { width: 16 }, // F
  ];

  // Header Banner
  summarySheet.mergeCells("B2:F2");
  const titleCell = summarySheet.getCell("B2");
  titleCell.value = "LAPORAN KEUANGAN PRIBADI";
  titleCell.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" }, // Slate 900
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  summarySheet.getRow(2).height = 36;

  // Subtitle / Periode
  summarySheet.mergeCells("B3:F3");
  const subtitleCell = summarySheet.getCell("B3");
  subtitleCell.value = `Periode: ${periodLabel}  |  Diexport pada: ${new Date().toLocaleString("id-ID")}`;
  subtitleCell.font = { name: "Segoe UI", size: 10, italic: true, color: { argb: "FF64748B" } };
  subtitleCell.alignment = { vertical: "middle", horizontal: "center" };
  summarySheet.getRow(3).height = 22;

  // KPI Section Title
  summarySheet.getCell("B5").value = "RINGKASAN CASHFLOW & METRIK";
  summarySheet.getCell("B5").font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FF0F172A" } };

  // KPI Table Headers
  const kpiHeaders = ["Metrik", "Nominal / Nilai", "Keterangan"];
  summarySheet.getRow(6).values = ["", ...kpiHeaders];
  const kpiHeaderRow = summarySheet.getRow(6);
  kpiHeaderRow.height = 24;
  ["B", "C", "D"].forEach((col) => {
    const cell = summarySheet.getCell(`${col}6`);
    cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
    cell.alignment = { vertical: "middle", horizontal: col === "C" ? "right" : "left" };
  });

  const netCashflow = summary.totalIncome - summary.totalExpense;
  const savingsRate = summary.totalIncome > 0 ? (netCashflow / summary.totalIncome) : 0;

  const kpiRows = [
    { label: "Total Pemasukan", val: summary.totalIncome, format: CURRENCY_FORMAT, note: "Total uang masuk", color: "FF059669" },
    { label: "Total Pengeluaran", val: summary.totalExpense, format: CURRENCY_FORMAT, note: "Total uang keluar", color: "FFDC2626" },
    { label: "Net Cashflow (Selisih)", val: netCashflow, format: CURRENCY_FORMAT, note: netCashflow >= 0 ? "Surplus Keuangan" : "Defisit Keuangan", color: netCashflow >= 0 ? "FF0284C7" : "FFDC2626" },
    { label: "Tingkat Tabungan (Savings Rate)", val: savingsRate, format: PERCENT_FORMAT, note: "% pemasukan yang tersisa", color: "FF475569" },
    { label: "Total Transaksi Dicatat", val: transactions.length, format: '#,##0" Transaksi"', note: "Frekuensi transaksi", color: "FF475569" },
  ];

  let currentKpiRow = 7;
  kpiRows.forEach((item) => {
    const r = summarySheet.getRow(currentKpiRow);
    r.height = 22;
    r.values = ["", item.label, item.val, item.note];
    
    const labelCell = summarySheet.getCell(`B${currentKpiRow}`);
    const valCell = summarySheet.getCell(`C${currentKpiRow}`);
    const noteCell = summarySheet.getCell(`D${currentKpiRow}`);

    labelCell.font = { name: "Segoe UI", size: 10, bold: true };
    valCell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: item.color } };
    valCell.numFmt = item.format;
    valCell.alignment = { horizontal: "right" };
    noteCell.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF64748B" } };

    [labelCell, valCell, noteCell].forEach((c) => {
      c.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });

    currentKpiRow++;
  });

  // Breakdown Pengeluaran per Kategori Section
  let catStartRow = currentKpiRow + 2;
  summarySheet.getCell(`B${catStartRow}`).value = "BREAKDOWN PENGELUARAN PER KATEGORI";
  summarySheet.getCell(`B${catStartRow}`).font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FF0F172A" } };

  catStartRow++;
  summarySheet.getRow(catStartRow).values = ["", "Kategori Pengeluaran", "Nominal (Rp)", "Persentase (%)"];
  summarySheet.getRow(catStartRow).height = 24;
  ["B", "C", "D"].forEach((col) => {
    const cell = summarySheet.getCell(`${col}${catStartRow}`);
    cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE11D48" } }; // Rose 600
    cell.alignment = { vertical: "middle", horizontal: col === "B" ? "left" : "right" };
  });

  let expRow = catStartRow + 1;
  const expenseCategories = summary.categoryBreakdown || [];
  if (expenseCategories.length === 0) {
    const r = summarySheet.getRow(expRow);
    r.values = ["", "Tidak ada data pengeluaran", 0, 0];
    r.getCell(2).font = { italic: true, color: { argb: "FF94A3B8" } };
    expRow++;
  } else {
    expenseCategories.forEach((cat) => {
      const r = summarySheet.getRow(expRow);
      r.height = 20;
      const pct = summary.totalExpense > 0 ? (cat.amount / summary.totalExpense) : 0;
      r.values = ["", cat.name, cat.amount, pct];

      const cCell = summarySheet.getCell(`C${expRow}`);
      cCell.numFmt = CURRENCY_FORMAT;
      cCell.alignment = { horizontal: "right" };
      cCell.font = { name: "Segoe UI", size: 10 };

      const dCell = summarySheet.getCell(`D${expRow}`);
      dCell.numFmt = PERCENT_FORMAT;
      dCell.alignment = { horizontal: "right" };
      dCell.font = { name: "Segoe UI", size: 10 };

      ["B", "C", "D"].forEach((col) => {
        summarySheet.getCell(`${col}${expRow}`).border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });

      expRow++;
    });
  }

  // Breakdown Pemasukan per Kategori Section
  let incStartRow = expRow + 1;
  summarySheet.getCell(`B${incStartRow}`).value = "BREAKDOWN PEMASUKAN PER KATEGORI";
  summarySheet.getCell(`B${incStartRow}`).font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FF0F172A" } };

  incStartRow++;
  summarySheet.getRow(incStartRow).values = ["", "Kategori Pemasukan", "Nominal (Rp)", "Persentase (%)"];
  summarySheet.getRow(incStartRow).height = 24;
  ["B", "C", "D"].forEach((col) => {
    const cell = summarySheet.getCell(`${col}${incStartRow}`);
    cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF059669" } }; // Emerald 600
    cell.alignment = { vertical: "middle", horizontal: col === "B" ? "left" : "right" };
  });

  let incRow = incStartRow + 1;
  const incomeMap = new Map<string, number>();
  transactions.filter((t) => t.type === "income").forEach((t) => {
    const cat = t.categoryName || "Pemasukan Lainnya";
    incomeMap.set(cat, (incomeMap.get(cat) || 0) + t.amount);
  });
  const incomeCategories = Array.from(incomeMap.entries()).sort((a, b) => b[1] - a[1]);

  if (incomeCategories.length === 0) {
    const r = summarySheet.getRow(incRow);
    r.values = ["", "Tidak ada data pemasukan", 0, 0];
    r.getCell(2).font = { italic: true, color: { argb: "FF94A3B8" } };
    incRow++;
  } else {
    incomeCategories.forEach(([catName, total]) => {
      const r = summarySheet.getRow(incRow);
      r.height = 20;
      const pct = summary.totalIncome > 0 ? (total / summary.totalIncome) : 0;
      r.values = ["", catName, total, pct];

      const cCell = summarySheet.getCell(`C${incRow}`);
      cCell.numFmt = CURRENCY_FORMAT;
      cCell.alignment = { horizontal: "right" };
      cCell.font = { name: "Segoe UI", size: 10 };

      const dCell = summarySheet.getCell(`D${incRow}`);
      dCell.numFmt = PERCENT_FORMAT;
      dCell.alignment = { horizontal: "right" };
      dCell.font = { name: "Segoe UI", size: 10 };

      ["B", "C", "D"].forEach((col) => {
        summarySheet.getCell(`${col}${incRow}`).border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });

      incRow++;
    });
  }

  // -------------------------------------------------------------
  // SHEET 2: DATA TRANSAKSI LENGKAP
  // -------------------------------------------------------------
  const txSheet = workbook.addWorksheet("Data Transaksi", {
    views: [{ showGridLines: true, state: "frozen", ySplit: 4 }],
  });

  txSheet.columns = [
    { key: "no", width: 6 },
    { key: "date", width: 14 },
    { key: "title", width: 34 },
    { key: "type", width: 16 },
    { key: "category", width: 22 },
    { key: "paymentMethod", width: 20 },
    { key: "amount", width: 22 },
    { key: "note", width: 32 },
  ];

  // Header Title Row
  txSheet.mergeCells("A2:H2");
  const txTitleCell = txSheet.getCell("A2");
  txTitleCell.value = `DAFTAR TRANSAKSI KEUANGAN — ${periodLabel.toUpperCase()}`;
  txTitleCell.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FF0F172A" } };
  txTitleCell.alignment = { vertical: "middle", horizontal: "left" };
  txSheet.getRow(2).height = 28;

  // Table Columns Header Row
  const txHeaders = ["No", "Tanggal", "Deskripsi / Judul", "Tipe", "Kategori", "Metode Bayar", "Nominal (Rp)", "Catatan"];
  const txHeaderRow = txSheet.getRow(4);
  txHeaderRow.values = txHeaders;
  txHeaderRow.height = 26;

  for (let c = 1; c <= 8; c++) {
    const cell = txHeaderRow.getCell(c);
    cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } }; // Slate 900
    cell.alignment = {
      vertical: "middle",
      horizontal: c === 1 || c === 2 || c === 4 || c === 6 ? "center" : c === 7 ? "right" : "left",
    };
    cell.border = {
      top: { style: "medium", color: { argb: "FF0284C7" } }, // Sky 600 accent top
      bottom: { style: "medium", color: { argb: "FF0F172A" } },
    };
  }

  // Populate Transaction Rows
  let currentRowIndex = 5;
  transactions.forEach((tx, idx) => {
    const isIncome = tx.type === "income";
    const typeLabel = isIncome ? "Pemasukan" : "Pengeluaran";
    const row = txSheet.getRow(currentRowIndex);
    row.height = 22;

    row.values = [
      idx + 1,
      tx.date,
      tx.title,
      typeLabel,
      tx.categoryName || "Lainnya",
      tx.paymentMethod || "Cash",
      tx.amount,
      tx.note || "-",
    ];

    // Alignments & Formats
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(3).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(4).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(5).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(6).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(7).alignment = { horizontal: "right", vertical: "middle" };
    row.getCell(8).alignment = { horizontal: "left", vertical: "middle" };

    // Format & Styling
    row.getCell(7).numFmt = CURRENCY_FORMAT;
    row.getCell(7).font = {
      name: "Segoe UI",
      size: 10,
      bold: true,
      color: { argb: isIncome ? "FF059669" : "FFDC2626" },
    };

    // Type badge style
    const typeCell = row.getCell(4);
    typeCell.font = {
      name: "Segoe UI",
      size: 9,
      bold: true,
      color: { argb: isIncome ? "FF047857" : "FFB91C1C" },
    };
    typeCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: isIncome ? "FFECFDF5" : "FFFEF2F2" }, // Emerald-50 / Rose-50
    };

    // Row borders & default font
    for (let c = 1; c <= 8; c++) {
      const cell = row.getCell(c);
      if (!cell.font) {
        cell.font = { name: "Segoe UI", size: 10 };
      }
      cell.border = {
        top: { style: "thin", color: { argb: "FFF1F5F9" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFF1F5F9" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    }

    currentRowIndex++;
  });

  // Total Summary Row at bottom
  if (transactions.length > 0) {
    const totalRow = txSheet.getRow(currentRowIndex);
    totalRow.height = 26;
    totalRow.getCell(3).value = "TOTAL KESELURUHAN:";
    totalRow.getCell(3).font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF0F172A" } };
    totalRow.getCell(3).alignment = { horizontal: "right", vertical: "middle" };

    const totalAmountCell = totalRow.getCell(7);
    totalAmountCell.value = {
      formula: `SUM(G5:G${currentRowIndex - 1})`,
      result: transactions.reduce((acc, t) => acc + t.amount, 0),
    };
    totalAmountCell.numFmt = CURRENCY_FORMAT;
    totalAmountCell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FF0F172A" } };
    totalAmountCell.alignment = { horizontal: "right", vertical: "middle" };

    for (let c = 1; c <= 8; c++) {
      const cell = totalRow.getCell(c);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "double", color: { argb: "FF0F172A" } },
      };
    }
  }

  // Enable AutoFilter on Table Headers
  txSheet.autoFilter = {
    from: "A4",
    to: `H${Math.max(currentRowIndex - 1, 5)}`,
  };

  // -------------------------------------------------------------
  // TRIGGER BROWSER DOWNLOAD
  // -------------------------------------------------------------
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
