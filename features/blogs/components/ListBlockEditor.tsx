"use client";

import { Plus, X } from "lucide-react";
import type { BlogContentBlock } from "../types";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

interface ListBlockEditorProps {
  block: Extract<BlogContentBlock, { type: "list" }>;
  isActive: boolean;
  onChange: (updatedBlock: BlogContentBlock) => void;
  onAddBlockAfter: () => void;
  onDeleteBlock: () => void;
  blockIndex: number;
}

export function ListBlockEditor({
  block,
  isActive,
  onChange,
  onAddBlockAfter,
  onDeleteBlock,
  blockIndex,
}: ListBlockEditorProps) {
  const inputClassName = (extra = "") =>
    `w-full border border-transparent bg-transparent outline-none transition focus:border-zinc-800 focus:bg-zinc-950 ${extra}`;

  return (
    <div
      className={`grid gap-2 rounded-xl transition-all duration-200 ${
        isActive
          ? "border border-zinc-900 bg-zinc-950/40 p-3"
          : "border border-transparent bg-transparent p-0"
      }`}
    >
      {/* List type selector - only show when active */}
      {isActive && (
        <div className="flex gap-2 mb-2 pb-2 border-b border-zinc-900">
          <button
            type="button"
            onClick={() => onChange({ ...block, style: "unordered" })}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              block.style === "unordered"
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            Bulleted List
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...block, style: "ordered" })}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              block.style === "ordered"
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            Numbered List
          </button>
        </div>
      )}

      {/* List items */}
      <div className="grid gap-2 pl-2">
        {block.items.map((item, itemIndex) => (
          <div key={itemIndex} className="group/item flex items-start gap-2">
            {block.style === "ordered" ? (
              <span className="mt-1 text-sm font-medium text-zinc-500 w-4 shrink-0 text-right select-none">
                {itemIndex + 1}.
              </span>
            ) : (
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-zinc-600" />
            )}
            <AutoResizeTextarea
              value={item}
              onChange={(event) => {
                const items = block.items.map((currentItem, currentIndex) =>
                  currentIndex === itemIndex ? event.currentTarget.value : currentItem,
                );
                onChange({ ...block, items });
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  const items = [
                    ...block.items.slice(0, itemIndex + 1),
                    "",
                    ...block.items.slice(itemIndex + 1),
                  ];
                  onChange({ ...block, items });
                  setTimeout(() => {
                    const container = document.querySelector(`[data-block-index="${blockIndex}"]`);
                    const textareas = container?.querySelectorAll<HTMLTextAreaElement>("textarea");
                    textareas?.[itemIndex + 1]?.focus();
                  }, 0);
                  return;
                }

                if (event.key === "Backspace" && item === "") {
                  event.preventDefault();
                  if (block.items.length > 1) {
                    const items = block.items.filter((_, currentIndex) => currentIndex !== itemIndex);
                    onChange({ ...block, items });
                    setTimeout(() => {
                      const container = document.querySelector(`[data-block-index="${blockIndex}"]`);
                      const textareas = container?.querySelectorAll<HTMLTextAreaElement>("textarea");
                      const focusIndex = Math.max(0, itemIndex - 1);
                      const ta = textareas?.[focusIndex];
                      if (ta) {
                        ta.focus();
                        ta.setSelectionRange(ta.value.length, ta.value.length);
                      }
                    }, 0);
                  } else {
                    onDeleteBlock();
                  }
                  return;
                }

                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  event.preventDefault();
                  onAddBlockAfter();
                }
              }}
              placeholder="List item"
              className={inputClassName(
                "blog-body-font min-h-8 resize-none rounded-md px-0 py-1 text-[18px] leading-7 text-zinc-300 placeholder:text-zinc-700 bg-transparent"
              )}
            />
            {isActive && block.items.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const items = block.items.filter((_, currentIndex) => currentIndex !== itemIndex);
                  onChange({ ...block, items });
                }}
                className="mt-1 opacity-0 group-hover/item:opacity-100 rounded p-0.5 text-zinc-600 hover:bg-zinc-900 hover:text-zinc-400"
                title="Delete item"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* Add list item button - only show when active */}
        {isActive && (
          <button
            type="button"
            onClick={() => {
              onChange({ ...block, items: [...block.items, ""] });
              setTimeout(() => {
                const container = document.querySelector(`[data-block-index="${blockIndex}"]`);
                const textareas = container?.querySelectorAll<HTMLTextAreaElement>("textarea");
                if (textareas) {
                  textareas[textareas.length - 1]?.focus();
                }
              }, 0);
            }}
            className="mt-1 inline-flex w-fit items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
          >
            <Plus className="size-3.5" /> Add list item
          </button>
        )}
      </div>
    </div>
  );
}
