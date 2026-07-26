"use client";

import { useMemo, useState } from "react";
import { Code2, Heading1, Image, Images, LinkIcon, List, MessageSquareQuote, Plus, Trash2 } from "lucide-react";
import type { BlogContentBlock } from "../types";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

type BlockType = BlogContentBlock["type"];

const blockOptions: Array<{ type: BlockType | "double-image"; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { type: "paragraph", label: "Text", icon: Plus },
  { type: "heading", label: "H1", icon: Heading1 },
  { type: "image", label: "Image", icon: Image },
  { type: "double-image", label: "Double", icon: Images },
  { type: "list", label: "List", icon: List },
  { type: "quote", label: "Quote", icon: MessageSquareQuote },
  { type: "code", label: "Code", icon: Code2 },
  { type: "link", label: "Link", icon: LinkIcon },
];

function createBlock(type: BlockType | "double-image"): BlogContentBlock {
  if (type === "heading") return { type: "heading", level: 1, text: "" };
  if (type === "image") return { type: "image", src: "", alt: "", caption: "" };
  if (type === "double-image") {
    return {
      type: "gallery",
      items: [
        { src: "", alt: "" },
        { src: "", alt: "" },
      ],
    };
  }
  if (type === "gallery") return { type: "gallery", items: [{ src: "", alt: "" }] };
  if (type === "quote") return { type: "quote", text: "" };
  if (type === "code") return { type: "code", code: "" };
  if (type === "list") return { type: "list", style: "unordered", items: [""] };
  if (type === "callout") return { type: "callout", title: "", text: "" };
  if (type === "link") return { type: "link", href: "", label: "" };
  return { type: "paragraph", text: "" };
}

function getInitialBlocks(content: BlogContentBlock[]) {
  return content.length > 0 ? content : [createBlock("paragraph")];
}

function replaceBlock(blocks: BlogContentBlock[], index: number, block: BlogContentBlock) {
  return blocks.map((currentBlock, currentIndex) => (currentIndex === index ? block : currentBlock));
}

function normalizeBlocks(blocks: BlogContentBlock[]) {
  return blocks
    .map((block): BlogContentBlock | null => {
      if (block.type === "paragraph") return block.text.trim() ? { ...block, text: block.text.trim() } : null;
      if (block.type === "heading") return block.text.trim() ? { ...block, text: block.text.trim() } : null;
      if (block.type === "quote") return block.text.trim() ? { ...block, text: block.text.trim() } : null;
      if (block.type === "code") return block.code.trim() ? block : null;
      if (block.type === "image") {
        return block.src.trim() && block.alt.trim()
          ? { ...block, src: block.src.trim(), alt: block.alt.trim(), caption: block.caption?.trim() || undefined }
          : null;
      }
      if (block.type === "gallery") {
        const items = block.items
          .map((item) => ({ src: item.src.trim(), alt: item.alt.trim() }))
          .filter((item) => item.src && item.alt);
        return items.length > 0 ? { ...block, items } : null;
      }
      if (block.type === "list") {
        const items = block.items.map((item) => item.trim()).filter(Boolean);
        return items.length > 0 ? { ...block, items } : null;
      }
      if (block.type === "callout") {
        return block.title.trim() && block.text.trim()
          ? { ...block, title: block.title.trim(), text: block.text.trim() }
          : null;
      }
      if (block.type === "link") {
        return block.href.trim() && block.label.trim() ? { ...block, href: block.href.trim(), label: block.label.trim() } : null;
      }
      return null;
    })
    .filter((block): block is BlogContentBlock => Boolean(block));
}

function getSlashCommand(value: string) {
  const command = value.trim().toLowerCase();
  if (command === "/h1") return createBlock("heading");
  if (command === "/h2") return { type: "heading", level: 2, text: "" } satisfies BlogContentBlock;
  if (command === "/image") return createBlock("image");
  if (command === "/double image" || command === "/double-image" || command === "/double") return createBlock("double-image");
  if (command === "/list") return createBlock("list");
  if (command === "/quote") return createBlock("quote");
  if (command === "/code") return createBlock("code");
  if (command === "/link") return createBlock("link");
  return null;
}

function inputClassName(extra = "") {
  return `w-full border border-transparent bg-transparent outline-none transition focus:border-zinc-800 focus:bg-zinc-950 ${extra}`;
}

function preventEnterSubmit(event: React.KeyboardEvent) {
  if (event.key === "Enter") event.preventDefault();
}

export function BlogBlockEditor({ initialContent }: { initialContent: BlogContentBlock[] }) {
  const [blocks, setBlocks] = useState<BlogContentBlock[]>(() => getInitialBlocks(initialContent));
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const normalizedBlocks = useMemo(() => normalizeBlocks(blocks), [blocks]);

  function addBlock(type: BlockType | "double-image" = "paragraph") {
    setBlocks((currentBlocks) => [...currentBlocks, createBlock(type)]);
  }

  function addBlockAfter(index: number, type: BlockType | "double-image" = "paragraph") {
    setBlocks((currentBlocks) => [
      ...currentBlocks.slice(0, index + 1),
      createBlock(type),
      ...currentBlocks.slice(index + 1),
    ]);
    setActiveBlockIndex(index + 1);
  }

  function updateBlock(index: number, block: BlogContentBlock) {
    setBlocks((currentBlocks) => replaceBlock(currentBlocks, index, block));
  }

  function deleteBlock(index: number) {
    setBlocks((currentBlocks) => {
      const nextBlocks = currentBlocks.filter((_, currentIndex) => currentIndex !== index);
      return nextBlocks.length > 0 ? nextBlocks : [createBlock("paragraph")];
    });
  }

  function handleParagraphKeyDown(index: number, value: string, event: React.KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      addBlockAfter(index);
      return;
    }

    if (event.key !== "Enter") return;
    const nextBlock = getSlashCommand(value);
    if (!nextBlock) return;
    event.preventDefault();
    updateBlock(index, nextBlock);
  }

  return (
    <div className="grid gap-8">
      <input type="hidden" name="content" value={JSON.stringify(normalizedBlocks)} />
      <div className="grid gap-8">
        {blocks.map((block, index) => (
          <div
            key={index}
            className="group relative grid gap-3"
            onFocusCapture={() => setActiveBlockIndex(index)}
          >
            {activeBlockIndex === index ? (
              <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-900 bg-zinc-950/90 p-2">
                {blockOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.type}
                      type="button"
                      className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        updateBlock(index, createBlock(option.type));
                      }}
                    >
                      <Icon className="size-4" />
                      {option.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    addBlock("paragraph");
                  }}
                >
                  <Plus className="size-4" />
                  New block
                </button>
              </div>
            ) : null}
            <div className="absolute -right-10 top-1 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
              <button
                type="button"
                className="grid size-7 place-items-center rounded-md text-zinc-600 transition hover:bg-zinc-900 hover:text-red-300"
                title="Delete block"
                onClick={() => deleteBlock(index)}
              >
                <Trash2 className="size-3" />
              </button>
            </div>

            {block.type === "paragraph" ? (
              <AutoResizeTextarea
                value={block.text}
                onChange={(event) => updateBlock(index, { ...block, text: event.currentTarget.value })}
                onKeyDown={(event) => handleParagraphKeyDown(index, block.text, event)}
                placeholder="Type /h1, /h2, /image, /double image..."
                className={inputClassName("blog-body-font min-h-10 resize-none rounded-md px-0 py-1 text-[23px] leading-9 text-zinc-300 placeholder:text-zinc-700")}
              />
            ) : null}

            {block.type === "heading" ? (
              <input
                value={block.text}
                onChange={(event) => updateBlock(index, { ...block, text: event.currentTarget.value })}
                onKeyDown={(event) => {
                  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                    event.preventDefault();
                    addBlockAfter(index);
                  }
                }}
                placeholder={block.level === 1 ? "Heading" : "Subheading"}
                className={inputClassName(
                  block.level === 1
                    ? "blog-heading-font rounded-md px-0 py-1 text-5xl font-semibold leading-tight text-zinc-100 placeholder:text-zinc-700"
                    : "blog-heading-font rounded-md px-0 py-1 text-3xl font-semibold leading-tight text-zinc-100 placeholder:text-zinc-700",
                )}
              />
            ) : null}

            {block.type === "image" ? (
              <div className="grid gap-3">
                <input
                  value={block.src}
                  onChange={(event) => updateBlock(index, { ...block, src: event.currentTarget.value })}
                  onKeyDown={preventEnterSubmit}
                  placeholder="Image URL"
                  className={inputClassName("h-10 rounded-md px-2 text-sm text-zinc-100")}
                />
                <input
                  value={block.alt}
                  onChange={(event) => updateBlock(index, { ...block, alt: event.currentTarget.value })}
                  onKeyDown={preventEnterSubmit}
                  placeholder="Alt text"
                  className={inputClassName("h-10 rounded-md px-2 text-sm text-zinc-100")}
                />
                <input
                  value={block.caption ?? ""}
                  onChange={(event) => updateBlock(index, { ...block, caption: event.currentTarget.value })}
                  onKeyDown={preventEnterSubmit}
                  placeholder="Caption"
                  className={inputClassName("h-10 rounded-md px-2 text-sm text-zinc-100")}
                />
                {block.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={block.src} alt={block.alt} className="max-h-[480px] w-full rounded-2xl object-cover" />
                ) : null}
              </div>
            ) : null}

            {block.type === "gallery" ? (
              <div className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  {block.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="grid gap-2 rounded-lg bg-zinc-950/80 p-3">
                      <input
                        value={item.src}
                        onChange={(event) => {
                          const items = block.items.map((currentItem, currentIndex) =>
                            currentIndex === itemIndex ? { ...currentItem, src: event.currentTarget.value } : currentItem,
                          );
                          updateBlock(index, { ...block, items });
                        }}
                        onKeyDown={preventEnterSubmit}
                        placeholder="Image URL"
                        className={inputClassName("h-10 rounded-md px-2 text-sm text-zinc-100")}
                      />
                      <input
                        value={item.alt}
                        onChange={(event) => {
                          const items = block.items.map((currentItem, currentIndex) =>
                            currentIndex === itemIndex ? { ...currentItem, alt: event.currentTarget.value } : currentItem,
                          );
                          updateBlock(index, { ...block, items });
                        }}
                        onKeyDown={preventEnterSubmit}
                        placeholder="Alt text"
                        className={inputClassName("h-10 rounded-md px-2 text-sm text-zinc-100")}
                      />
                      {item.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.src} alt={item.alt} className="h-56 w-full rounded-xl object-cover" />
                      ) : null}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 w-fit items-center gap-2 rounded-md px-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100"
                  onClick={() => updateBlock(index, { ...block, items: [...block.items, { src: "", alt: "" }] })}
                >
                  <Plus className="size-4" />
                  Add image
                </button>
              </div>
            ) : null}

            {block.type === "quote" ? (
              <AutoResizeTextarea
                value={block.text}
                onChange={(event) => updateBlock(index, { ...block, text: event.currentTarget.value })}
                onKeyDown={(event) => {
                  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                    event.preventDefault();
                    addBlockAfter(index);
                  }
                }}
                placeholder="Quote"
                className={inputClassName("blog-body-font min-h-12 resize-none border-l-2 border-sky-400 px-4 py-2 text-2xl italic leading-9 text-zinc-200")}
              />
            ) : null}

            {block.type === "code" ? (
              <AutoResizeTextarea
                value={block.code}
                onChange={(event) => updateBlock(index, { ...block, code: event.currentTarget.value })}
                onKeyDown={(event) => {
                  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                    event.preventDefault();
                    addBlockAfter(index);
                  }
                }}
                placeholder="const x = 1;"
                className={inputClassName("min-h-20 resize-none rounded-lg border-zinc-800 bg-zinc-950 px-3 py-3 font-mono text-sm leading-6 text-emerald-200")}
              />
            ) : null}

            {block.type === "list" ? (
              <AutoResizeTextarea
                value={block.items.join("\n")}
                onChange={(event) =>
                  updateBlock(index, { ...block, items: event.currentTarget.value.split("\n") })
                }
                onKeyDown={(event) => {
                  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                    event.preventDefault();
                    addBlockAfter(index);
                  }
                }}
                placeholder="One item per line"
                className={inputClassName("blog-body-font min-h-10 resize-none rounded-md px-0 py-1 text-[23px] leading-9 text-zinc-300")}
              />
            ) : null}

            {block.type === "callout" ? (
              <div className="grid gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3">
                <input
                  value={block.title}
                  onChange={(event) => updateBlock(index, { ...block, title: event.currentTarget.value })}
                  onKeyDown={preventEnterSubmit}
                  placeholder="Callout title"
                  className={inputClassName("h-10 rounded-md px-2 font-semibold text-amber-100")}
                />
                <AutoResizeTextarea
                  value={block.text}
                  onChange={(event) => updateBlock(index, { ...block, text: event.currentTarget.value })}
                  placeholder="Callout text"
                  className={inputClassName("min-h-10 resize-none rounded-md px-2 py-2 text-amber-100/80")}
                />
              </div>
            ) : null}

            {block.type === "link" ? (
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  value={block.href}
                  onChange={(event) => updateBlock(index, { ...block, href: event.currentTarget.value })}
                  onKeyDown={preventEnterSubmit}
                  placeholder="https://..."
                  className={inputClassName("h-10 rounded-md px-2 text-sm text-zinc-100")}
                />
                <input
                  value={block.label}
                  onChange={(event) => updateBlock(index, { ...block, label: event.currentTarget.value })}
                  onKeyDown={preventEnterSubmit}
                  placeholder="Open resource"
                  className={inputClassName("h-10 rounded-md px-2 text-sm text-zinc-100")}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

    </div>
  );
}
