"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function NoteImageView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const { src, alt, width = "65%", align = "center", isLoading } = node.attrs;

  const isSmall = width === "30%" || width === "35%" || width === "31%";
  const isFull = width === "100%";
  const isMedium = !isSmall && !isFull;

  const currentWidth = isSmall ? "35%" : isFull ? "100%" : "65%";
  const currentAlign = align || "center";

  const wrapperAlignClass =
    currentAlign === "left"
      ? "justify-start"
      : currentAlign === "right"
        ? "justify-end"
        : "justify-center";

  return (
    <NodeViewWrapper
      className={cn("flex w-full my-3 select-none transition-all duration-200", wrapperAlignClass)}
    >
      <div
        className={cn(
          "group relative inline-block transition-all duration-200",
          selected && "ring-2 ring-sky-500 ring-offset-2 ring-offset-zinc-950 rounded-xl",
        )}
        style={{ width: currentWidth }}
      >
        {/* Floating Toolbar inside top-right corner of image */}
        <div
          className={cn(
            "absolute top-2.5 right-2.5 z-30 flex items-center gap-1 rounded-lg border border-zinc-700/90 bg-zinc-950/95 p-1 shadow-2xl backdrop-blur-md transition-opacity duration-150 whitespace-nowrap min-w-max",
            "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
            selected && "opacity-100 pointer-events-auto",
          )}
        >
          {/* Alignment Buttons: Kiri, Tengah, Kanan */}
          <div className="flex items-center gap-0.5 border-r border-zinc-800 pr-1">
            <button
              type="button"
              onClick={() => updateAttributes({ align: "left" })}
              className={cn(
                "rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50",
                currentAlign === "left" && "bg-zinc-800 text-sky-400",
              )}
              title="Rata Kiri"
            >
              <AlignLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateAttributes({ align: "center" })}
              className={cn(
                "rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50",
                currentAlign === "center" && "bg-zinc-800 text-sky-400",
              )}
              title="Rata Tengah"
            >
              <AlignCenter className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateAttributes({ align: "right" })}
              className={cn(
                "rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50",
                currentAlign === "right" && "bg-zinc-800 text-sky-400",
              )}
              title="Rata Kanan"
            >
              <AlignRight className="size-3.5" />
            </button>
          </div>

          {/* Size Buttons: S (35%), M (65%), Full (100%) */}
          <div className="flex items-center gap-1 border-r border-zinc-800 px-1">
            <button
              type="button"
              onClick={() => updateAttributes({ width: "35%" })}
              className={cn(
                "rounded px-2 py-0.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 shrink-0 whitespace-nowrap",
                isSmall && "bg-zinc-800 text-sky-400",
              )}
              title="Ukuran Kecil (35%)"
            >
              S
            </button>
            <button
              type="button"
              onClick={() => updateAttributes({ width: "65%" })}
              className={cn(
                "rounded px-2 py-0.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 shrink-0 whitespace-nowrap",
                isMedium && "bg-zinc-800 text-sky-400",
              )}
              title="Ukuran Sedang (65%)"
            >
              M
            </button>
            <button
              type="button"
              onClick={() => updateAttributes({ width: "100%" })}
              className={cn(
                "rounded px-2 py-0.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 shrink-0 whitespace-nowrap",
                isFull && "bg-zinc-800 text-sky-400",
              )}
              title="Ukuran Penuh (100%)"
            >
              Full
            </button>
          </div>

          {/* Delete Button */}
          <button
            type="button"
            onClick={deleteNode}
            className="rounded p-1 text-zinc-400 hover:bg-red-950/80 hover:text-red-400"
            title="Hapus gambar"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        {/* Image Card Display */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900 shadow-md">
          {src ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={src}
              alt={alt || "Note image"}
              className="block h-auto w-full max-w-full rounded-xl object-contain"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-zinc-900 text-zinc-600">
              No image
            </div>
          )}

          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-xs">
              <Loader2 className="size-7 animate-spin text-sky-400" />
              <span className="text-xs font-medium text-zinc-300">Uploading image...</span>
            </div>
          ) : null}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
