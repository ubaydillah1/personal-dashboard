"use client";

import { useMemo, useState } from "react";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TextSelection } from "@tiptap/pm/state";
import { wrapInList } from "@tiptap/pm/schema-list";
import type { EditorView } from "@tiptap/pm/view";
import { fetchYoutubeTitleAction } from "../actions";
import { findFirstLinkPreview, getLinkPreview, isYoutubeUrl } from "../editor/link";
import { LinkMention } from "../editor/linkMention";
import { draftBlocksToTiptapDoc, tiptapDocToDraftBlocks } from "../editor/tiptapDocument";
import type { DraftBlock } from "../editor/types";
import { SlashCommandMenu } from "./SlashCommandMenu";

type MenuPosition = {
  top: number;
  left: number;
};

type PendingMention = MenuPosition & {
  from: number;
  to: number;
  url: string;
  label: string;
  isLoadingTitle: boolean;
};

type TextRangeValue = {
  from: number;
  to: number;
};

function getMenuPosition(view: EditorView): MenuPosition {
  const rect = view.coordsAtPos(view.state.selection.from);
  const parentRect = view.dom.getBoundingClientRect();

  return {
    top: rect.bottom - parentRect.top + 8,
    left: Math.max(0, rect.left - parentRect.left),
  };
}

function createMentionNode(view: EditorView, url: string, label: string) {
  const preview = findFirstLinkPreview(url);
  return view.state.schema.nodes.linkMention.create({
    href: url,
    label,
    kind: preview?.kind ?? "link",
  });
}

function findTextRange(view: EditorView, value: string, preferredFrom: number): TextRangeValue | null {
  let bestRange: TextRangeValue | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  view.state.doc.descendants((node, position) => {
    if (!node.isTextblock) return true;

    const text = node.textContent;
    const index = text.indexOf(value);
    if (index < 0) return true;

    const from = position + 1 + index;
    const to = from + value.length;
    const distance = Math.abs(from - preferredFrom);

    if (distance < bestDistance) {
      bestRange = { from, to };
      bestDistance = distance;
    }

    return true;
  });

  return bestRange;
}

function replaceRangeWithMention(view: EditorView, from: number, to: number, url: string, label: string) {
  const currentRange = findTextRange(view, url, from);
  const node = createMentionNode(view, url, label);
  const safeFrom = Math.min(currentRange?.from ?? from, view.state.doc.content.size);
  const safeTo = Math.min(Math.max(currentRange?.to ?? to, safeFrom), view.state.doc.content.size);
  const space = view.state.schema.text(" ");
  const transaction = view.state.tr.replaceWith(safeFrom, safeTo, [node, space]);
  const selectionPosition = Math.min(safeFrom + node.nodeSize + space.nodeSize, transaction.doc.content.size);

  view.dispatch(
    transaction
      .setSelection(TextSelection.create(transaction.doc, selectionPosition))
      .scrollIntoView(),
  );
  return safeFrom;
}

function turnCurrentTextblockIntoList(view: EditorView) {
  const { $from } = view.state.selection;
  view.dispatch(view.state.tr.delete($from.start(), $from.end()));
  wrapInList(view.state.schema.nodes.bulletList)(view.state, view.dispatch, view);
}

function getTextblockRange(view: EditorView) {
  const { $from } = view.state.selection;
  return { from: $from.start(), to: $from.end(), text: $from.parent.textContent };
}

export function BlocksEditable({
  blocks,
  setBlocks,
}: {
  blocks: DraftBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<DraftBlock[]>>;
}) {
  const content = useMemo(() => draftBlocksToTiptapDoc(blocks), []);
  const [slashMenu, setSlashMenu] = useState<MenuPosition | null>(null);
  const [pendingMention, setPendingMention] = useState<PendingMention | null>(null);

  function hideMenus() {
    setSlashMenu(null);
    setPendingMention(null);
  }

  const editor = useEditor({
    immediatelyRender: false,
    content,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        link: false,
      }),
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: true,
        HTMLAttributes: {
          class: "font-semibold text-zinc-100 underline decoration-zinc-500 underline-offset-4 hover:decoration-zinc-300",
          target: "_blank",
          rel: "noreferrer",
        },
      }),
      LinkMention,
    ],
    editorProps: {
      attributes: {
        class:
          "notes-scrollbar h-full min-h-0 overflow-y-auto pr-2 text-base font-medium leading-8 text-zinc-100 outline-none selection:bg-sky-500/35",
      },
      handleKeyDown(view, event) {
        if (pendingMention && event.key === "Enter") {
          event.preventDefault();
          const position = replaceRangeWithMention(
            view,
            pendingMention.from,
            pendingMention.to,
            pendingMention.url,
            pendingMention.label,
          );
          setPendingMention(null);

          if (isYoutubeUrl(pendingMention.url)) {
            fetchYoutubeTitleAction(pendingMention.url).then((result) => {
              if (!result.success || !result.title) return;
              const node = view.state.doc.nodeAt(position);
              if (node?.type.name !== "linkMention") return;
              view.dispatch(view.state.tr.setNodeMarkup(position, undefined, { ...node.attrs, label: result.title }));
            });
          }
          return true;
        }

        if ((slashMenu || pendingMention) && event.key === "Escape") {
          event.preventDefault();
          hideMenus();
          return true;
        }

        if (slashMenu && event.key === "Enter") {
          event.preventDefault();
          turnCurrentTextblockIntoList(view);
          setSlashMenu(null);
          return true;
        }

        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          const { $from } = view.state.selection;
          const start = $from.start();
          const end = $from.end();
          const target = Math.max(0, start - 1);
          view.dispatch(
            view.state.tr
              .delete(start, end)
              .setSelection(TextSelection.near(view.state.doc.resolve(target))),
          );
          return true;
        }

        if (event.key === "Enter") {
          const { $from } = view.state.selection;
          if ($from.parent.textContent === "/list") {
            event.preventDefault();
            turnCurrentTextblockIntoList(view);
            return true;
          }
        }

        return false;
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain").trim();
        const preview = text ? getLinkPreview(text) : null;
        if (!preview) return false;

        event.preventDefault();
        const from = view.state.selection.from;
        view.dispatch(view.state.tr.insertText(preview.url).scrollIntoView());
        const currentRange = findTextRange(view, preview.url, from);
        const to = currentRange?.to ?? from + preview.url.length;
        const position = getMenuPosition(view);
        setSlashMenu(null);
        setPendingMention({
          ...position,
          from,
          to,
          url: preview.url,
          label: preview.title,
          isLoadingTitle: isYoutubeUrl(preview.url),
        });

        if (isYoutubeUrl(preview.url)) {
          fetchYoutubeTitleAction(preview.url).then((result) => {
            if (!result.success || !result.title) return;
            setPendingMention((current) =>
              current?.url === preview.url ? { ...current, label: result.title ?? current.label, isLoadingTitle: false } : current,
            );
          });
        }

        return true;
      },
    },
    onSelectionUpdate({ editor }) {
      const view = editor.view;
      const range = getTextblockRange(view);
      setSlashMenu(range.text === "/" ? getMenuPosition(view) : null);
    },
    onUpdate({ editor }) {
      const view = editor.view;
      const range = getTextblockRange(view);
      setSlashMenu(range.text === "/" ? getMenuPosition(view) : null);
      setBlocks(tiptapDocToDraftBlocks(editor.getJSON() as JSONContent));
    },
  });

  function selectSlashList() {
    if (!editor) return;
    turnCurrentTextblockIntoList(editor.view);
    setSlashMenu(null);
  }

  function selectMention() {
    if (!editor || !pendingMention) return;
    replaceRangeWithMention(editor.view, pendingMention.from, pendingMention.to, pendingMention.url, pendingMention.label);
    setPendingMention(null);
  }

  return (
    <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
      <EditorContent editor={editor} className="notes-editor h-full min-h-0 min-w-0 overflow-hidden" />
      {slashMenu ? (
        <div className="absolute z-30" style={{ top: slashMenu.top, left: slashMenu.left }}>
          <SlashCommandMenu onSelectList={selectSlashList} />
        </div>
      ) : null}
      {pendingMention ? (
        <div
          className="absolute z-30 w-80 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl shadow-black/30"
          style={{ top: pendingMention.top, left: pendingMention.left }}
        >
          <p className="px-3 py-2 text-xs font-medium text-zinc-500">Paste as</p>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-md bg-zinc-800 px-3 py-2 text-left text-sm font-medium text-zinc-100"
            onMouseDown={(event) => {
              event.preventDefault();
              selectMention();
            }}
          >
            Mention
            <span className="min-w-0 flex-1 truncate text-xs font-normal text-zinc-500">
              {pendingMention.isLoadingTitle ? "fetching title..." : pendingMention.label}
            </span>
          </button>
          <div className="mt-1 border-t border-zinc-800 px-3 py-2 text-xs text-zinc-500">
            Enter to select / esc to keep URL
          </div>
        </div>
      ) : null}
    </div>
  );
}
