/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from "exceljs";
import type { FinanceSummary, FinanceTransaction } from "../types";

export interface ExportExcelOptions {
  periodLabel: string;
  filename: string;
  transactions: FinanceTransaction[];
  summary: FinanceSummary;
}

interface GroupedRow {
  date: string;
  desc: string;
  total: number;
  totalPerDay: number | null;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  return dateStr;
}

function groupTransactionsByDate(transactions: FinanceTransaction[], targetType: "income" | "expense"): GroupedRow[] {
  const filtered = transactions
    .filter((t) => t.type === targetType)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

  // Group by date
  const dateMap = new Map<string, FinanceTransaction[]>();
  filtered.forEach((t) => {
    const list = dateMap.get(t.date) || [];
    list.push(t);
    dateMap.set(t.date, list);
  });

  const rows: GroupedRow[] = [];
  const sortedDates = Array.from(dateMap.keys()).sort();

  sortedDates.forEach((dateKey) => {
    const dayItems = dateMap.get(dateKey) || [];
    const daySum = dayItems.reduce((acc, curr) => acc + curr.amount, 0);

    dayItems.forEach((item, index) => {
      const isFirst = index === 0;
      const isLast = index === dayItems.length - 1;

      rows.push({
        date: isFirst ? formatDisplayDate(dateKey) : "",
        desc: item.title,
        total: item.amount,
        totalPerDay: isLast ? daySum : null,
      });
    });
  });

  return rows;
}

export async function generateAndDownloadFinanceExcel({
  periodLabel,
  filename,
  transactions,
  summary,
}: ExportExcelOptions) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Personal Dashboard";
  workbook.lastModifiedBy = "Personal Dashboard";
  workbook.created = new Date();
  workbook.modified = new Date();

  // -------------------------------------------------------------
  // SHEET 1: CASHFLOW (Side-by-Side: INCOME vs EXPENSE)
  // -------------------------------------------------------------
  const sheet = workbook.addWorksheet("Cashflow", {
    views: [{ showGridLines: true }],
  });

  // Setup Column Widths
  sheet.columns = [
    { width: 3 },  // A (padding)
    { width: 14 }, // B: Income Date
    { width: 26 }, // C: Income Desc
    { width: 15 }, // D: Income Total
    { width: 16 }, // E: Income Total/day
    { width: 4 },  // F: Gap
    { width: 14 }, // G: Expense Date
    { width: 26 }, // H: Expense Desc
    { width: 15 }, // I: Expense Total
    { width: 16 }, // J: Expense Total/day
  ];

  // Title Banner
  sheet.mergeCells("B2:J2");
  const titleCell = sheet.getCell("B2");
  titleCell.value = `LAPORAN KEUANGAN PRIBADI — ${periodLabel.toUpperCase()}`;
  titleCell.font = { name: "Segoe UI", size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" }, // Slate 900
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(2).height = 32;

  // Subtitle / Export Info
  sheet.mergeCells("B3:J3");
  const subCell = sheet.getCell("B3");
  subCell.value = `Periode: ${periodLabel}   |   Net Cashflow: Rp ${new Intl.NumberFormat("id-ID").format(summary.netBalance)}   |   Diexport: ${new Date().toLocaleDateString("id-ID")}`;
  subCell.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF64748B" } };
  subCell.alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(3).height = 20;

  // Section Top Totals (Row 5)
  sheet.getRow(5).height = 24;

  // Income summary header (B5:C5)
  const incLabel = sheet.getCell("B5");
  incLabel.value = "INCOME";
  incLabel.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FF15803D" } };
  incLabel.alignment = { vertical: "middle", horizontal: "left" };

  const incVal = sheet.getCell("C5");
  incVal.value = summary.totalIncome;
  incVal.numFmt = "#,##0";
  incVal.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FF15803D" } };
  incVal.alignment = { vertical: "middle", horizontal: "left" };

  // Expense summary header (G5:H5)
  const expLabel = sheet.getCell("G5");
  expLabel.value = "EXPENSE";
  expLabel.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFDC2626" } };
  expLabel.alignment = { vertical: "middle", horizontal: "left" };

  const expVal = sheet.getCell("H5");
  expVal.value = summary.totalExpense;
  expVal.numFmt = "#,##0";
  expVal.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFDC2626" } };
  expVal.alignment = { vertical: "middle", horizontal: "left" };

  // Table Headers (Row 6)
  sheet.getRow(6).height = 24;

  // Income Headers (Green)
  const incHeaders = [
    { col: "B", title: "Date", align: "center" },
    { col: "C", title: "Desc", align: "left" },
    { col: "D", title: "Total", align: "right" },
    { col: "E", title: "Total/day", align: "right" },
  ];
  incHeaders.forEach((h) => {
    const cell = sheet.getCell(`${h.col}6`);
    cell.value = h.title;
    cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF15803D" } }; // Green 700
    cell.alignment = { vertical: "middle", horizontal: h.align as any };
  });

  // Expense Headers (Red)
  const expHeaders = [
    { col: "G", title: "Date", align: "center" },
    { col: "H", title: "Desc", align: "left" },
    { col: "I", title: "Total", align: "right" },
    { col: "J", title: "Total/day", align: "right" },
  ];
  expHeaders.forEach((h) => {
    const cell = sheet.getCell(`${h.col}6`);
    cell.value = h.title;
    cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDC2626" } }; // Red 600
    cell.alignment = { vertical: "middle", horizontal: h.align as any };
  });

  // Build Grouped Data Rows
  const incomeRows = groupTransactionsByDate(transactions, "income");
  const expenseRows = groupTransactionsByDate(transactions, "expense");
  const totalDataRows = Math.max(incomeRows.length, expenseRows.length, 1);

  const startRow = 7;
  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFE2E8F0" } },
    bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
    left: { style: "thin", color: { argb: "FFE2E8F0" } },
    right: { style: "thin", color: { argb: "FFE2E8F0" } },
  };

  for (let i = 0; i < totalDataRows; i++) {
    const rowNum = startRow + i;
    const row = sheet.getRow(rowNum);
    row.height = 20;

    const incItem = incomeRows[i];
    const expItem = expenseRows[i];

    // Left: Income Cells (B, C, D, E)
    if (incItem) {
      const bCell = sheet.getCell(`B${rowNum}`);
      bCell.value = incItem.date;
      bCell.font = { name: "Segoe UI", size: 9.5 };
      bCell.alignment = { horizontal: "center", vertical: "middle" };
      bCell.border = borderStyle;

      const cCell = sheet.getCell(`C${rowNum}`);
      cCell.value = incItem.desc;
      cCell.font = { name: "Segoe UI", size: 9.5 };
      cCell.alignment = { horizontal: "left", vertical: "middle" };
      cCell.border = borderStyle;

      const dCell = sheet.getCell(`D${rowNum}`);
      dCell.value = incItem.total;
      dCell.numFmt = "#,##0";
      dCell.font = { name: "Segoe UI", size: 9.5, color: { argb: "FF15803D" } };
      dCell.alignment = { horizontal: "right", vertical: "middle" };
      dCell.border = borderStyle;

      const eCell = sheet.getCell(`E${rowNum}`);
      if (incItem.totalPerDay !== null) {
        eCell.value = incItem.totalPerDay;
        eCell.numFmt = "#,##0";
        eCell.font = { name: "Segoe UI", size: 9.5, bold: true, color: { argb: "FF0F172A" } };
      } else {
        eCell.value = "";
      }
      eCell.alignment = { horizontal: "right", vertical: "middle" };
      eCell.border = borderStyle;
    } else if (incomeRows.length === 0 && i === 0) {
      const bCell = sheet.getCell(`B${rowNum}`);
      bCell.value = "-";
      bCell.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF94A3B8" } };
      bCell.alignment = { horizontal: "center", vertical: "middle" };
      bCell.border = borderStyle;

      const cCell = sheet.getCell(`C${rowNum}`);
      cCell.value = "Tidak ada transaksi pemasukan";
      cCell.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF94A3B8" } };
      cCell.alignment = { horizontal: "left", vertical: "middle" };
      cCell.border = borderStyle;

      const dCell = sheet.getCell(`D${rowNum}`);
      dCell.value = 0;
      dCell.numFmt = "#,##0";
      dCell.border = borderStyle;

      const eCell = sheet.getCell(`E${rowNum}`);
      eCell.value = 0;
      eCell.numFmt = "#,##0";
      eCell.border = borderStyle;
    }

    // Right: Expense Cells (G, H, I, J)
    if (expItem) {
      const gCell = sheet.getCell(`G${rowNum}`);
      gCell.value = expItem.date;
      gCell.font = { name: "Segoe UI", size: 9.5 };
      gCell.alignment = { horizontal: "center", vertical: "middle" };
      gCell.border = borderStyle;

      const hCell = sheet.getCell(`H${rowNum}`);
      hCell.value = expItem.desc;
      hCell.font = { name: "Segoe UI", size: 9.5 };
      hCell.alignment = { horizontal: "left", vertical: "middle" };
      hCell.border = borderStyle;

      const iCell = sheet.getCell(`I${rowNum}`);
      iCell.value = expItem.total;
      iCell.numFmt = "#,##0";
      iCell.font = { name: "Segoe UI", size: 9.5, color: { argb: "FFDC2626" } };
      iCell.alignment = { horizontal: "right", vertical: "middle" };
      iCell.border = borderStyle;

      const jCell = sheet.getCell(`J${rowNum}`);
      if (expItem.totalPerDay !== null) {
        jCell.value = expItem.totalPerDay;
        jCell.numFmt = "#,##0";
        jCell.font = { name: "Segoe UI", size: 9.5, bold: true, color: { argb: "FF0F172A" } };
      } else {
        jCell.value = "";
      }
      jCell.alignment = { horizontal: "right", vertical: "middle" };
      jCell.border = borderStyle;
    } else if (expenseRows.length === 0 && i === 0) {
      const gCell = sheet.getCell(`G${rowNum}`);
      gCell.value = "-";
      gCell.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF94A3B8" } };
      gCell.alignment = { horizontal: "center", vertical: "middle" };
      gCell.border = borderStyle;

      const hCell = sheet.getCell(`H${rowNum}`);
      hCell.value = "Tidak ada transaksi pengeluaran";
      hCell.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF94A3B8" } };
      hCell.alignment = { horizontal: "left", vertical: "middle" };
      hCell.border = borderStyle;

      const iCell = sheet.getCell(`I${rowNum}`);
      iCell.value = 0;
      iCell.numFmt = "#,##0";
      iCell.border = borderStyle;

      const jCell = sheet.getCell(`J${rowNum}`);
      jCell.value = 0;
      jCell.numFmt = "#,##0";
      jCell.border = borderStyle;
    }
  }

  // Bottom Total Row
  const footerRow = startRow + totalDataRows;
  sheet.getRow(footerRow).height = 24;

  // Income Footer (B to E)
  sheet.getCell(`B${footerRow}`).value = "TOTAL";
  sheet.getCell(`B${footerRow}`).font = { name: "Segoe UI", size: 10, bold: true };
  sheet.getCell(`B${footerRow}`).alignment = { horizontal: "center", vertical: "middle" };

  sheet.getCell(`D${footerRow}`).value = summary.totalIncome;
  sheet.getCell(`D${footerRow}`).numFmt = "#,##0";
  sheet.getCell(`D${footerRow}`).font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF15803D" } };
  sheet.getCell(`D${footerRow}`).alignment = { horizontal: "right", vertical: "middle" };

  sheet.getCell(`E${footerRow}`).value = summary.totalIncome;
  sheet.getCell(`E${footerRow}`).numFmt = "#,##0";
  sheet.getCell(`E${footerRow}`).font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF15803D" } };
  sheet.getCell(`E${footerRow}`).alignment = { horizontal: "right", vertical: "middle" };

  ["B", "C", "D", "E"].forEach((col) => {
    const cell = sheet.getCell(`${col}${footerRow}`);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0FDF4" } }; // Emerald 50
    cell.border = {
      top: { style: "thin", color: { argb: "FF86EFAC" } },
      bottom: { style: "double", color: { argb: "FF15803D" } },
    };
  });

  // Expense Footer (G to J)
  sheet.getCell(`G${footerRow}`).value = "TOTAL";
  sheet.getCell(`G${footerRow}`).font = { name: "Segoe UI", size: 10, bold: true };
  sheet.getCell(`G${footerRow}`).alignment = { horizontal: "center", vertical: "middle" };

  sheet.getCell(`I${footerRow}`).value = summary.totalExpense;
  sheet.getCell(`I${footerRow}`).numFmt = "#,##0";
  sheet.getCell(`I${footerRow}`).font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFDC2626" } };
  sheet.getCell(`I${footerRow}`).alignment = { horizontal: "right", vertical: "middle" };

  sheet.getCell(`J${footerRow}`).value = summary.totalExpense;
  sheet.getCell(`J${footerRow}`).numFmt = "#,##0";
  sheet.getCell(`J${footerRow}`).font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFDC2626" } };
  sheet.getCell(`J${footerRow}`).alignment = { horizontal: "right", vertical: "middle" };

  ["G", "H", "I", "J"].forEach((col) => {
    const cell = sheet.getCell(`${col}${footerRow}`);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF2F2" } }; // Red 50
    cell.border = {
      top: { style: "thin", color: { argb: "FFFCA5A5" } },
      bottom: { style: "double", color: { argb: "FFDC2626" } },
    };
  });

  // -------------------------------------------------------------
  // SHEET 2: KATEGORI & METRIK
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet("Kategori & Ringkasan", {
    views: [{ showGridLines: true }],
  });

  summarySheet.columns = [
    { width: 4 },  // A
    { width: 28 }, // B
    { width: 18 }, // C
    { width: 14 }, // D
    { width: 4 },  // E
    { width: 28 }, // F
    { width: 18 }, // G
    { width: 14 }, // H
  ];

  // Header Title
  summarySheet.mergeCells("B2:H2");
  const sTitle = summarySheet.getCell("B2");
  sTitle.value = "BREAKDOWN KATEGORI & ANALITIK";
  sTitle.font = { name: "Segoe UI", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  sTitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
  sTitle.alignment = { vertical: "middle", horizontal: "center" };
  summarySheet.getRow(2).height = 30;

  // Headers: Left Pemasukan, Right Pengeluaran (Row 4)
  summarySheet.getRow(4).height = 24;

  const sumIncHeader = [
    { col: "B", title: "Kategori Pemasukan" },
    { col: "C", title: "Nominal (Rp)" },
    { col: "D", title: "Porsi (%)" },
  ];
  sumIncHeader.forEach((h) => {
    const cell = summarySheet.getCell(`${h.col}4`);
    cell.value = h.title;
    cell.font = { name: "Segoe UI", size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF15803D" } };
    cell.alignment = { vertical: "middle", horizontal: h.col === "B" ? "left" : "right" };
  });

  const sumExpHeader = [
    { col: "F", title: "Kategori Pengeluaran" },
    { col: "G", title: "Nominal (Rp)" },
    { col: "H", title: "Porsi (%)" },
  ];
  sumExpHeader.forEach((h) => {
    const cell = summarySheet.getCell(`${h.col}4`);
    cell.value = h.title;
    cell.font = { name: "Segoe UI", size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDC2626" } };
    cell.alignment = { vertical: "middle", horizontal: h.col === "F" ? "left" : "right" };
  });

  // Calculate Income breakdown
  const incMap = new Map<string, number>();
  transactions.filter((t) => t.type === "income").forEach((t) => {
    const cat = t.categoryName || "Pemasukan Lainnya";
    incMap.set(cat, (incMap.get(cat) || 0) + t.amount);
  });
  const incomeCatList = Array.from(incMap.entries()).sort((a, b) => b[1] - a[1]);
  const expenseCatList = summary.categoryBreakdown || [];

  const maxCatRows = Math.max(incomeCatList.length, expenseCatList.length, 1);
  for (let k = 0; k < maxCatRows; k++) {
    const rNum = 5 + k;
    const r = summarySheet.getRow(rNum);
    r.height = 20;

    const incCat = incomeCatList[k];
    if (incCat) {
      const bC = summarySheet.getCell(`B${rNum}`);
      bC.value = incCat[0];
      bC.font = { name: "Segoe UI", size: 9.5 };
      bC.border = borderStyle;

      const cC = summarySheet.getCell(`C${rNum}`);
      cC.value = incCat[1];
      cC.numFmt = "#,##0";
      cC.font = { name: "Segoe UI", size: 9.5 };
      cC.alignment = { horizontal: "right" };
      cC.border = borderStyle;

      const dC = summarySheet.getCell(`D${rNum}`);
      dC.value = summary.totalIncome > 0 ? (incCat[1] / summary.totalIncome) * 100 : 0;
      dC.numFmt = '0.0"%"';
      dC.font = { name: "Segoe UI", size: 9.5 };
      dC.alignment = { horizontal: "right" };
      dC.border = borderStyle;
    }

    const expCat = expenseCatList[k];
    if (expCat) {
      const fC = summarySheet.getCell(`F${rNum}`);
      fC.value = expCat.name;
      fC.font = { name: "Segoe UI", size: 9.5 };
      fC.border = borderStyle;

      const gC = summarySheet.getCell(`G${rNum}`);
      gC.value = expCat.amount;
      gC.numFmt = "#,##0";
      gC.font = { name: "Segoe UI", size: 9.5 };
      gC.alignment = { horizontal: "right" };
      gC.border = borderStyle;

      const hC = summarySheet.getCell(`H${rNum}`);
      hC.value = expCat.percentage;
      hC.numFmt = '0.0"%"';
      hC.font = { name: "Segoe UI", size: 9.5 };
      hC.alignment = { horizontal: "right" };
      hC.border = borderStyle;
    }
  }

  // -------------------------------------------------------------
  // TRIGGER DOWNLOAD IN BROWSER
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
