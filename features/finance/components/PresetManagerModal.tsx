"use client";

import { useRef, useState } from "react";
import { Check, Loader2, Plus, RotateCcw, Trash2, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FinanceCategory } from "../types";

export interface QuickPreset {
  id: string;
  title: string;
  amount: number;
  categoryName: string;
  type: "expense" | "income";
}

export const DEFAULT_PRESETS: QuickPreset[] = [
  { id: "1", title: "Makan Pagi", amount: 10000, categoryName: "Makanan & Minuman", type: "expense" },
  { id: "2", title: "Makan Siang", amount: 12000, categoryName: "Makanan & Minuman", type: "expense" },
  { id: "3", title: "Makan Malam", amount: 12000, categoryName: "Makanan & Minuman", type: "expense" },
  { id: "4", title: "Kopi / Minum", amount: 10000, categoryName: "Makanan & Minuman", type: "expense" },
  { id: "5", title: "Bensin", amount: 20000, categoryName: "Transportasi", type: "expense" },
  { id: "6", title: "Jajan / Snack", amount: 10000, categoryName: "Makanan & Minuman", type: "expense" },
];

let idCounter = 100;
function createNewPresetId(): string {
  idCounter += 1;
  return `preset-${idCounter}`;
}

interface PresetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: QuickPreset[];
  onSavePresets: (newPresets: QuickPreset[]) => void;
  categories: FinanceCategory[];
}

export function PresetManagerModal({
  isOpen,
  onClose,
  presets,
  onSavePresets,
  categories,
}: PresetManagerModalProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  if (!isOpen) return null;

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
    const next = [
      ...presets,
      {
        id: createNewPresetId(),
        title: "Pintasan Baru",
        amount: 10000,
        categoryName: "Makanan & Minuman",
        type: "expense" as const,
      },
    ];
    triggerAutoSave(next);
  }

  function handleDeletePreset(id: string) {
    const next = presets.filter((p) => p.id !== id);
    triggerAutoSave(next);
  }

  function handleResetDefault() {
    if (window.confirm("Kembalikan semua daftar pintasan ke bawaan awal?")) {
      triggerAutoSave(DEFAULT_PRESETS);
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
                Klik langsung pada teks/harga untuk mengedit (Auto-save ala Notion)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Notion-style Editable Table / Rows */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {/* Column Header */}
          <div className="grid grid-cols-[1fr_120px_110px_32px] gap-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Nama / Label</span>
            <span>Kategori</span>
            <span>Harga (Rp)</span>
            <span />
          </div>

          {presets.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 rounded-xl border border-dashed border-zinc-800">
              Belum ada pintasan. Klik tombol di bawah untuk menambah.
            </div>
          ) : (
            presets.map((preset) => (
              <div
                key={preset.id}
                className="group grid grid-cols-[1fr_120px_110px_32px] items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-1.5 transition hover:border-zinc-700 hover:bg-zinc-900"
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
                  {categories.map((c) => (
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
                    className="flex size-7 items-center justify-center rounded-lg text-zinc-500 opacity-60 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
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
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-800 py-2 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900/60 hover:text-zinc-200"
          >
            <Plus className="size-3.5 text-sky-400" />
            <span>Tambah Pintasan Baru</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300"
          >
            <RotateCcw className="size-3" />
            <span>Reset ke Bawaan Awal</span>
          </button>

          <Button
            type="button"
            onClick={onClose}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4"
          >
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
}
