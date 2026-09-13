"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Sparkles, Tag } from "lucide-react";
import type { LabelSuggestion } from "../types";
import { cn } from "@/lib/utils";

interface LabelAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion: (suggestion: LabelSuggestion) => void;
  suggestions: LabelSuggestion[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function LabelAutocomplete({
  value,
  onChange,
  onSelectSuggestion,
  suggestions,
  placeholder = "Misal: Makan Siang, Kopi, Bensin...",
  className,
  autoFocus = false,
}: LabelAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // Filter suggestions matching current input
  const trimmedValue = value.trim().toLowerCase();
  const filteredSuggestions = suggestions.filter((s) =>
    trimmedValue.length === 0 ? true : s.title.toLowerCase().includes(trimmedValue)
  ).slice(0, 8);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === "ArrowDown" && filteredSuggestions.length > 0) {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        e.preventDefault();
        const selected = filteredSuggestions[highlightedIndex];
        selectItem(selected);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  function selectItem(suggestion: LabelSuggestion) {
    onSelectSuggestion(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            if (filteredSuggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          autoFocus={autoFocus}
          className={cn(
            "h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-3.5 pr-9 text-sm text-zinc-100 placeholder:text-zinc-500",
            "focus:border-sky-500/80 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20",
            "transition-all duration-150",
            className
          )}
        />
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
          <Sparkles className="size-4 text-sky-400/70" />
        </div>
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <span>Rekomendasi Label</span>
            <span className="text-[10px] text-zinc-600">Gunakan ↑↓ + Enter</span>
          </div>
          <div className="mt-1 max-h-56 overflow-y-auto space-y-0.5">
            {filteredSuggestions.map((suggestion, index) => {
              const isSelected = highlightedIndex === index;
              return (
                <button
                  key={`${suggestion.title}-${index}`}
                  type="button"
                  onClick={() => selectItem(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    isSelected ? "bg-zinc-800/90 text-zinc-100" : "text-zinc-300 hover:bg-zinc-900"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-medium text-zinc-200">{suggestion.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-zinc-400 border border-zinc-700/50">
                      <Tag className="size-3 text-sky-400" />
                      {suggestion.categoryName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
