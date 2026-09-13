"use client";

import { useId, useRef, useState, useTransition } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  Loader2,
  Minus,
  Moon,
  Plus,
  Settings2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTransaction } from "../hooks";
import { LabelAutocomplete } from "./LabelAutocomplete";
import {
  DEFAULT_PRESETS,
  PresetManagerModal,
  type QuickPreset,
} from "./PresetManagerModal";
import type { FinanceCategory, LabelSuggestion, TransactionType } from "../types";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  categories: FinanceCategory[];
  suggestions: LabelSuggestion[];
  onSuccess?: () => void;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
const PRESETS_STORAGE_KEY = "finance.quickPresets_v2";

function formatK(num: number | unknown) {
  const n = Number(num);
  if (isNaN(n) || n === 0) return "0";
  const abs = Math.abs(n);
  if (abs < 1000) return String(abs);
  const k = abs / 1000;
  return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
}

function parseStoredPresets(raw: string | null): QuickPreset[] {
  if (!raw) return DEFAULT_PRESETS;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PRESETS;
    const validPresets: QuickPreset[] = parsed.map((item, idx) => ({
      id: typeof item?.id === "string" ? item.id : `preset-${idx}`,
      title: typeof item?.title === "string" ? item.title : (typeof item?.title?.title === "string" ? item.title.title : "Pintasan"),
      amount: typeof item?.amount === "number" ? item.amount : Number(item?.amount) || 10000,
      categoryName: typeof item?.categoryName === "string" ? item.categoryName : "Makanan & Minuman",
      type: (item?.type === "income" ? "income" : "expense") as "expense" | "income",
    }));

    // If existing localStorage only contains expense presets, merge with default income presets
    const hasIncome = validPresets.some((p) => p.type === "income");
    const defaultIncomes = DEFAULT_PRESETS.filter((p) => p.type === "income");
    if (!hasIncome && defaultIncomes.length > 0) {
      return [...validPresets, ...defaultIncomes];
    }

    return validPresets;
  } catch {
    return DEFAULT_PRESETS;
  }
}

function formatDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayString() {
  return formatDateString(new Date());
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateString(d);
}

// Begadang rule: Jika sebelum jam 06:00 pagi (00:00 - 05:59), default ke hari KEMARIN
function getDefaultTransactionDate(): { date: string; isNightOwl: boolean } {
  const now = new Date();
  const hours = now.getHours();
  const isNightOwl = hours < 6;

  if (isNightOwl) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return { date: formatDateString(yesterday), isNightOwl: true };
  }

  return { date: formatDateString(now), isNightOwl: false };
}

export function TransactionForm({ categories, suggestions, onSuccess }: TransactionFormProps) {
  const defaultDateInfo = getDefaultTransactionDate();

  const [type, setType] = useState<TransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState(defaultDateInfo.date);
  const [categoryId, setCategoryId] = useState<string>("");
  const [categoryName, setCategoryName] = useState<string>("Lainnya");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  // Quick Presets state with lazy initializer
  const [presets, setPresets] = useState<QuickPreset[]>(() => {
    if (typeof window === "undefined") return DEFAULT_PRESETS;
    try {
      const stored = window.localStorage.getItem(PRESETS_STORAGE_KEY);
      return parseStoredPresets(stored);
    } catch {
      return DEFAULT_PRESETS;
    }
  });
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  function handleSavePresets(newPresets: QuickPreset[]) {
    setPresets(newPresets);
    try {
      window.localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
    } catch {
      // ignore
    }
  }

  const createMutation = useCreateTransaction();
  const isPending = createMutation.isPending;
  const amountInputRef = useRef<HTMLInputElement>(null);
  const titleInputId = useId();
  const amountInputId = useId();
  const dateInputId = useId();
  const categoryInputId = useId();

  // Filter categories by type
  const availableCategories = (categories || []).filter(
    (c) => c && (c.type === type || c.type === "both")
  );

  // Filter presets by current type
  const activePresets = (Array.isArray(presets) ? presets : DEFAULT_PRESETS).filter(
    (p) => p && p.type === type
  );

  // Filter suggestions by current type
  const typeSuggestions = (suggestions || []).filter((s) => s && s.type === type);

  function handleSelectPreset(preset: QuickPreset) {
    setTitle(preset.title);
    setAmount(preset.amount);

    if (preset.categoryName) {
      const match = categories.find(
        (c) => c.name.toLowerCase() === preset.categoryName.toLowerCase()
      );
      if (match) {
        setCategoryId(match.id);
        setCategoryName(match.name);
      } else {
        setCategoryName(preset.categoryName);
      }
    }
  }

  function handleSelectSuggestion(suggestion: LabelSuggestion) {
    setTitle(suggestion.title);

    if (suggestion.categoryId) {
      const match = categories.find((c) => c.id === suggestion.categoryId);
      if (match) {
        setCategoryId(match.id);
        setCategoryName(match.name);
      }
    } else if (suggestion.categoryName) {
      const match = categories.find(
        (c) => c.name.toLowerCase() === suggestion.categoryName.toLowerCase()
      );
      if (match) {
        setCategoryId(match.id);
        setCategoryName(match.name);
      } else {
        setCategoryName(suggestion.categoryName);
      }
    }

    // Move focus directly to amount input
    setTimeout(() => {
      amountInputRef.current?.focus();
    }, 50);
  }

  function handleCategoryChange(selectedId: string) {
    setCategoryId(selectedId);
    const cat = categories.find((c) => c.id === selectedId);
    if (cat) {
      setCategoryName(cat.name);
    }
  }

  function handleAdjustAmount(delta: number) {
    const current = typeof amount === "number" ? amount : 0;
    const next = current + delta;
    setAmount(next > 0 ? next : "");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Nama / label transaksi wajib diisi.");
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg("Nominal harus lebih dari 0.");
      return;
    }

    createMutation.mutate(
      {
        title: title.trim(),
        type,
        amount: numAmount,
        date,
        categoryId: categoryId || null,
        categoryName: categoryName || "Lainnya",
        paymentMethod: "Cash",
        note: note.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          if (!res.success) {
            setErrorMsg(res.error || "Gagal menyimpan transaksi.");
          } else {
            // Reset form
            setTitle("");
            setAmount("");
            setNote("");
            setSuccessMsg(true);
            setTimeout(() => setSuccessMsg(false), 2500);
            onSuccess?.();
          }
        },
        onError: (err) => {
          setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan transaksi.");
        },
      }
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle: Pengeluaran vs Pemasukan */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-950 p-1 border border-zinc-800/80">
            <button
              type="button"
              onClick={() => {
                setType("expense");
                setCategoryId("");
                setCategoryName("Lainnya");
              }}
              className={cn(
                "flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200",
                type === "expense"
                  ? "bg-red-500/15 text-red-400 border border-red-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              )}
            >
              <ArrowDownLeft className="size-4 text-red-400" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income");
                setCategoryId("");
                setCategoryName("Lainnya");
              }}
              className={cn(
                "flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200",
                type === "income"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              )}
            >
              <ArrowUpRight className="size-4 text-emerald-400" />
              <span>Pemasukan</span>
            </button>
          </div>

          {/* Quick Presets (Label + Harga) */}
          <div className="space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <Zap className="size-3.5 text-amber-400" />
                <span>Pintasan Cepat (Label + Harga)</span>
              </span>
              <button
                type="button"
                onClick={() => setIsSettingOpen(true)}
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
              >
                <Settings2 className="size-3 text-sky-400" />
                <span>Atur Pintasan</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {activePresets.length === 0 ? (
                <p className="text-[11px] text-zinc-500 py-1">Belum ada pintasan. Klik &quot;Atur Pintasan&quot; untuk menambahkan.</p>
              ) : (
                activePresets.map((p, idx) => {
                  const pTitle = typeof p?.title === "string" ? p.title : String(p?.title ?? "Pintasan");
                  const pAmount = typeof p?.amount === "number" ? p.amount : Number(p?.amount) || 0;
                  const pKey = p?.id || `preset-item-${idx}`;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="group inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs transition hover:border-sky-500/50 hover:bg-zinc-800/80 hover:shadow-sm"
                    >
                      <span className="font-semibold text-zinc-200 group-hover:text-zinc-50">{pTitle}</span>
                      <span className="font-mono font-bold text-sky-400 bg-sky-950/60 border border-sky-800/40 rounded px-1.5 py-0.2 text-[10px]">
                        {formatK(pAmount)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3.5">
            {/* Label / Nama Transaksi */}
            <div className="space-y-1.5">
              <label htmlFor={titleInputId} className="text-xs font-semibold text-zinc-300">
                Nama / Label Transaksi <span className="text-red-400">*</span>
              </label>
              <LabelAutocomplete
                value={title}
                onChange={setTitle}
                onSelectSuggestion={handleSelectSuggestion}
                suggestions={typeSuggestions}
                placeholder={type === "expense" ? "Misal: Makan Siang, Kopi, Bensin..." : "Misal: Gaji Bulanan, Bonus..."}
              />
            </div>

            {/* Nominal (Amount) + Quick Add */}
            <div className="space-y-1.5">
              <label htmlFor={amountInputId} className="text-xs font-semibold text-zinc-300">
                Nominal (Rp) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                  Rp
                </span>
                <input
                  id={amountInputId}
                  ref={amountInputRef}
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0"
                  className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/90 pl-10 pr-3 text-sm font-bold text-zinc-100 placeholder:text-zinc-600 focus:border-sky-500/80 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              {/* Quick Adjust Buttons (+ / -) */}
              <div className="space-y-1.5 pt-1">
                {/* Tambah (+) */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400 w-14 shrink-0">
                    <Plus className="size-3 text-emerald-400" />
                    <span>Tambah:</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {QUICK_AMOUNTS.map((q) => (
                      <button
                        key={`add-${q}`}
                        type="button"
                        onClick={() => handleAdjustAmount(q)}
                        className="rounded-md border border-emerald-900/40 bg-emerald-950/20 px-2 py-0.5 text-xs font-medium text-emerald-300 transition hover:border-emerald-500/60 hover:bg-emerald-900/40 hover:text-emerald-100 active:scale-95"
                      >
                        +{formatK(q)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kurang (-) */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-0.5 text-[11px] font-semibold text-rose-400 w-14 shrink-0">
                    <Minus className="size-3 text-rose-400" />
                    <span>Kurang:</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {QUICK_AMOUNTS.map((q) => (
                      <button
                        key={`sub-${q}`}
                        type="button"
                        onClick={() => handleAdjustAmount(-q)}
                        className="rounded-md border border-rose-900/40 bg-rose-950/20 px-2 py-0.5 text-xs font-medium text-rose-300 transition hover:border-rose-500/60 hover:bg-rose-900/40 hover:text-rose-100 active:scale-95"
                      >
                        -{formatK(q)}
                      </button>
                    ))}
                    {amount !== "" && Number(amount) > 0 && (
                      <button
                        type="button"
                        onClick={() => setAmount("")}
                        className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200 active:scale-95 ml-0.5"
                        title="Kosongkan nominal"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tanggal & Kategori Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Tanggal */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor={dateInputId} className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                    <span>Tanggal</span>
                    {defaultDateInfo.isNightOwl && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1 py-0.2 text-[9px] font-medium text-amber-400 border border-amber-500/20">
                        <Moon className="size-2.5" /> Begadang
                      </span>
                    )}
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setDate(getTodayString())}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-medium transition",
                        date === getTodayString()
                          ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setDate(getYesterdayString())}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-medium transition",
                        date === getYesterdayString()
                          ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      Kemarin
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    id={dateInputId}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 text-xs font-medium text-zinc-100 focus:border-sky-500/80 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 [color-scheme:dark]"
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                </div>
              </div>

              {/* Kategori */}
              <div className="space-y-1.5">
                <label htmlFor={categoryInputId} className="text-xs font-semibold text-zinc-300">
                  Kategori
                </label>
                <div className="relative">
                  <select
                    id={categoryInputId}
                    value={categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900/90 pl-3 pr-8 text-xs font-medium text-zinc-100 focus:border-sky-500/80 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="">Pilih Kategori</option>
                    {availableCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                </div>
              </div>
            </div>

            {/* Catatan Tambahan (Opsional) */}
            <div className="space-y-1">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Catatan tambahan (opsional)..."
                maxLength={500}
                className="h-9 w-full rounded-lg border border-zinc-800/80 bg-zinc-900/50 px-3 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-sky-500/80 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {/* Error / Success Feedback */}
          {errorMsg && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {errorMsg}
            </p>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-1">
            {successMsg ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 animate-in fade-in">
                <Check className="size-4" /> Transaksi berhasil disimpan!
              </span>
            ) : (
              <span className="text-[11px] text-zinc-500">
                * Tanggal: {date}
              </span>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                "h-10 min-w-[140px] font-semibold text-white transition-all shadow-md",
                type === "expense"
                  ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-950/50"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/50"
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  <span>Simpan {type === "expense" ? "Pengeluaran" : "Pemasukan"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Settings Modal for Presets */}
      <PresetManagerModal
        isOpen={isSettingOpen}
        onClose={() => setIsSettingOpen(false)}
        presets={presets}
        onSavePresets={handleSavePresets}
        categories={categories}
        activeType={type}
      />
    </>
  );
}
