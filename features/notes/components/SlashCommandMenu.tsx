"use client";

import { List } from "lucide-react";

export function SlashCommandMenu({ onSelectList }: { onSelectList: () => void }) {
  return (
    <div className="mt-2 w-80 rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl shadow-black/30">
      <p className="px-3 py-2 text-xs font-medium text-zinc-500">Filtered results</p>
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-md bg-zinc-800 px-3 py-2 text-left text-sm text-zinc-100"
        onMouseDown={(event) => {
          event.preventDefault();
          onSelectList();
        }}
      >
        <List className="size-4 text-zinc-300" />
        <span>List</span>
      </button>
      <div className="mt-1 border-t border-zinc-800 px-3 py-2 text-xs text-zinc-500">
        Press Enter to select · esc to close
      </div>
    </div>
  );
}
