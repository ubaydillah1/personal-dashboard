"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Check, Loader2, Plus, RotateCcw, Trash2, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FinanceCategory } from "../types";
import { cn } from "@/lib/utils";

export interface QuickPreset {
  id: string;
  title: string;
  amount: number;
  categoryName: string;
  type: "expense" | "income";
}

export const DEFAULT_PRESETS: QuickPreset[] = [
  // Pengeluaran
  { id: "exp-1", title: "Makan Pagi", amount: 10000, categoryName: "Makanan & Minuman", type: "expense" },
  { id: "exp-2", title: "Makan Siang", amount: 12000, categoryName: "Makanan & Minuman", type: "expense" },
  { id: "exp-3", title: "Makan Malam", amount: 12000, categoryName: "Makanan & Minuman", type: "expense" },
  { id: "exp-4", title: "Kopi / Minum", amount: 10000, categoryName: "Makanan & Minuman", type: "expense" },
  { id: "exp-5", title: "Bensin", amount: 20000, categoryName: "Transportasi", type: "expense" },
  { id: "exp-6", title: "Jajan / Snack", amount: 10000, categoryName: "Makanan & Minuman", type: "expense" },
  // Pemasukan
  { id: "inc-1", title: "Gaji Bulanan", amount: 5000000, categoryName: "Gaji Pokok", type: "income" },
  { id: "inc-2", title: "Side Job / Freelance", amount: 500000, categoryName: "Freelance & Side Job", type: "income" },
  { id: "inc-3", title: "Bonus / Insentif", amount: 1000000, categoryName: "Bonus & Hadiah", type: "income" },
  { id: "inc-4", title: "Dividen / Investasi", amount: 250000, categoryName: "Investasi & Dividen", type: "income" },
  { id: "inc-5", title: "Cashback / Hadiah", amount: 50000, categoryName: "Bonus & Hadiah", type: "income" },
];

let idCounter = 100;
function createNewPresetId(): string {
  idCounter += 1;
  return `preset-${Date.now()}-${idCounter}`;
}

interface PresetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: QuickPreset[];
  onSavePresets: (newPresets: QuickPreset[]) => void;
  categories: FinanceCategory[];
  activeType?: "expense" | "income";
}

export function PresetManagerModal({
  isOpen,
  onClose,
  presets,
  onSavePresets,
  categories,
  activeType = "expense",
}: PresetManagerModalProps) {
  const [selectedTab, setSelectedTab] = useState<"expense" | "income">(activeType);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync tab with activeType when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTab(activeType);
    }
  }, [isOpen, activeType]);

  if (!isOpen) return null;

  const currentPresets = (Array.isArray(presets) ? presets : DEFAULT_PRESETS).filter(
    (p) => p && p.type === selectedTab
  );

  const availableCategories = (categories || [])
    .filter((c) => c && (c.type === selectedTab || c.type === "both"))
    .filter(
      (c, index, self) =>
        index ===
        self.findIndex(
          (item) => item.name.trim().toLowerCase() === c.name.trim().toLowerCase()
        )
    );

  const fallbackCategories = (
    availableCategories.length > 0 ? availableCategories : categories || []
  ).filter(
    (c, index, self) =>
      index ===
      self.findIndex(
        (item) => item.name.trim().toLowerCase() === c.name.trim().toLowerCase()
      )
  );

  function triggerAutoSave(updatedList: QuickPreset[]) {
    onSavePresets(updatedList);
    setSaveStatus("saving");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1200);
    }, 400);
  }

  function handleUpdateField(id: string, field: keyof QuickPreset, value: string | number) {
    const next = presets.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    triggerAutoSave(next);
  }

  function handleAddNewRow() {
    const defaultCatName =
      fallbackCategories[0]?.name ||
      (selectedTab === "income" ? "Gaji Pokok" : "Makanan & Minuman");

    const next = [
      ...presets,
      {
        id: createNewPresetId(),
        title: selectedTab === "income" ? "Pemasukan Baru" : "Pintasan Baru",
        amount: selectedTab === "income" ? 50000 : 10000,
        categoryName: defaultCatName,
        type: selectedTab,
      },
    ];
    triggerAutoSave(next);
  }

  function handleDeletePreset(id: string) {
    const next = presets.filter((p) => p.id !== id);
    triggerAutoSave(next);
  }

  function handleResetDefault() {
    const label = selectedTab === "income" ? "Pemasukan" : "Pengeluaran";
    if (window.confirm(`Kembalikan daftar pintasan ${label} ke bawaan awal?`)) {
      const otherPresets = presets.filter((p) => p.type !== selectedTab);
      const defaultTabPresets = DEFAULT_PRESETS.filter((p) => p.type === selectedTab);
      triggerAutoSave([...otherPresets, ...defaultTabPresets]);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Zap className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">Kelola Pintasan Cepat</h3>
                {saveStatus === "saving" && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Loader2 className="size-3 animate-spin text-sky-400" />
                    <span>Menyimpan...</span>
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 animate-in fade-in">
                    <Check className="size-3" />
                    <span>Tersimpan</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Klik langsung pada teks/harga untuk mengedit (Auto-save)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab Selector: Pengeluaran vs Pemasukan */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-900/80 p-1 border border-zinc-800">
          <button
            type="button"
            onClick={() => setSelectedTab("expense")}
            className={cn(
              "flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              selectedTab === "expense"
                ? "bg-red-500/15 text-red-400 border border-red-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <ArrowDownLeft className="size-3.5 text-red-400" />
            <span>Pintasan Pengeluaran</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("income")}
            className={cn(
              "flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              selectedTab === "income"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <ArrowUpRight className="size-3.5 text-emerald-400" />
            <span>Pintasan Pemasukan</span>
          </button>
        </div>

        {/* Notion-style Editable Table / Rows */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {/* Column Header */}
          <div className="grid grid-cols-[1fr_130px_110px_32px] gap-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Nama / Label</span>
            <span>Kategori</span>
            <span>Harga (Rp)</span>
            <span />
          </div>

          {currentPresets.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 rounded-xl border border-dashed border-zinc-800">
              Belum ada pintasan {selectedTab === "income" ? "pemasukan" : "pengeluaran"}. Klik tombol di bawah untuk menambah.
            </div>
          ) : (
            currentPresets.map((preset) => (
              <div
                key={preset.id}
                className="group grid grid-cols-[1fr_130px_110px_32px] items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-1.5 transition hover:border-zinc-700 hover:bg-zinc-900"
              >
                {/* Editable Title */}
                <input
                  type="text"
                  value={preset.title}
                  onChange={(e) => handleUpdateField(preset.id, "title", e.target.value)}
                  placeholder="Nama pintasan..."
                  className="h-8 w-full rounded-lg bg-transparent px-2.5 text-xs font-semibold text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                />

                {/* Editable Category */}
                <select
                  value={preset.categoryName}
                  onChange={(e) => handleUpdateField(preset.id, "categoryName", e.target.value)}
                  className="h-8 w-full appearance-none rounded-lg border border-transparent bg-zinc-800/60 px-2 text-[11px] font-medium text-zinc-300 focus:border-zinc-700 focus:bg-zinc-950 focus:outline-none"
                >
                  {fallbackCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Editable Amount */}
                <div className="relative">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="500"
                    value={preset.amount || ""}
                    onChange={(e) =>
                      handleUpdateField(preset.id, "amount", e.target.value === "" ? 0 : Number(e.target.value))
                    }
                    placeholder="0"
                    className="h-8 w-full rounded-lg border border-transparent bg-zinc-800/60 pl-6 pr-1.5 text-right font-mono text-xs font-bold text-sky-400 focus:border-zinc-700 focus:bg-zinc-950 focus:outline-none"
                  />
                </div>

                {/* Delete Button */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleDeletePreset(preset.id)}
                    className="flex size-7 items-center justify-center rounded-lg text-zinc-500 opacity-60 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 cursor-pointer"
                    title="Hapus baris"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Notion-style Add Row Button */}
          <button
            type="button"
            onClick={handleAddNewRow}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-800 py-2 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900/60 hover:text-zinc-200 cursor-pointer"
          >
            <Plus className="size-3.5 text-sky-400" />
            <span>Tambah Pintasan {selectedTab === "income" ? "Pemasukan" : "Pengeluaran"} Baru</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300 cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>Reset {selectedTab === "income" ? "Pemasukan" : "Pengeluaran"} ke Bawaan</span>
          </button>

          <Button
            type="button"
            onClick={onClose}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 cursor-pointer"
          >
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
}

