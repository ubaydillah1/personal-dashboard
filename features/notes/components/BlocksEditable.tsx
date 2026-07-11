"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LinkIcon } from "lucide-react";
import { fetchYoutubeTitleAction } from "../actions";
import { createDraftBlock } from "../editor/draft";
import { findFirstLinkPreview, getLinkPreview, isYoutubeUrl } from "../editor/link";
import type { DraftBlock } from "../editor/types";
import { SlashCommandMenu } from "./SlashCommandMenu";

const BULLET_PREFIX = "• ";

function blocksToText(blocks: DraftBlock[]) {
  return blocks
    .map((block) => (block.type === "bullet" ? `${BULLET_PREFIX}${block.content}` : block.content))
    .join("\n");
}

function textToBlocks(value: string, previousBlocks: DraftBlock[]) {
  const lines = value.split("\n");

  return lines.map((line, index) => {
    const previousBlock = previousBlocks[index];
    const isBullet = line.startsWith(BULLET_PREFIX);
    const content = isBullet ? line.slice(BULLET_PREFIX.length) : line;
    const label =
      (previousBlock?.metadata?.label as string | undefined) ||
      (previousBlock?.type === "link" ? previousBlock.content : undefined);
    const isSameLink =
      previousBlock?.type === "link" &&
      (previousBlock.content === content || (label && content.startsWith(label)));

    return {
      id: previousBlock?.id ?? crypto.randomUUID(),
      type: isBullet ? "bullet" : isSameLink ? "link" : "text",
      content,
      position: index,
      metadata: isSameLink ? { ...previousBlock.metadata, label } : {},
    } satisfies DraftBlock;
  });
}

function getLineBounds(value: string, cursor: number) {
  const lineStart = value.lastIndexOf("\n", cursor - 1) + 1;
  const nextLineBreak = value.indexOf("\n", cursor);
  const lineEnd = nextLineBreak === -1 ? value.length : nextLineBreak;
  return {
    lineStart,
    lineEnd,
    line: value.slice(lineStart, lineEnd),
  };
}

function replaceRange(value: string, start: number, end: number, replacement: string) {
  return `${value.slice(0, start)}${replacement}${value.slice(end)}`;
}

function getLineIndex(value: string, cursor: number) {
  return value.slice(0, cursor).split("\n").length - 1;
}

function getBlockUrl(block?: DraftBlock) {
  const url = block?.metadata.url;
  return typeof url === "string" ? url : null;
}

function isLinkBlock(block?: DraftBlock) {
  return block?.type === "link" && Boolean(getBlockUrl(block));
}

function getDisplayLine(line: string) {
  return line.startsWith(BULLET_PREFIX) ? line.slice(BULLET_PREFIX.length) : line;
}

function getLineDeleteRange(value: string, lineStart: number, lineEnd: number) {
  if (lineStart === 0 && lineEnd === value.length) return { start: 0, end: value.length };
  if (lineEnd < value.length) return { start: lineStart, end: lineEnd + 1 };
  return { start: Math.max(0, lineStart - 1), end: lineEnd };
}

type PendingMention = {
  url: string;
  start: number;
  end: number;
  lineStart: number;
  label: string;
  isLoadingTitle: boolean;
};

export function BlocksEditable({
  blocks,
  setBlocks,
}: {
  blocks: DraftBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<DraftBlock[]>>;
}) {
  const initialText = useMemo(
    () => blocksToText(blocks.length > 0 ? blocks : [createDraftBlock(0)]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [text, setText] = useState(initialText);
  const [commandLineStart, setCommandLineStart] = useState<number | null>(null);
  const [pendingMention, setPendingMention] = useState<PendingMention | null>(null);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const internalCommitRef = useRef(false);
  const commandLineIndex =
    commandLineStart === null ? 0 : text.slice(0, commandLineStart).split("\n").length - 1;

  useEffect(() => {
    if (internalCommitRef.current) {
      internalCommitRef.current = false;
      return;
    }
    setText(blocksToText(blocks));
  }, [blocks]);

  function commitText(nextText: string) {
    internalCommitRef.current = true;
    setText(nextText);
    setBlocks((currentBlocks) => textToBlocks(nextText, currentBlocks));
  }

  function commitTextAfterDeletingBlock(nextText: string, deletedIndex: number) {
    internalCommitRef.current = true;
    setText(nextText);
    setBlocks((currentBlocks) =>
      textToBlocks(
        nextText,
        currentBlocks.filter((_, index) => index !== deletedIndex),
      ),
    );
  }

  function commitLinkText(nextText: string, lineIndex: number, url: string, label: string) {
    internalCommitRef.current = true;
    setText(nextText);
    setBlocks((currentBlocks) =>
      textToBlocks(nextText, currentBlocks).map((block, index) =>
        index === lineIndex
          ? {
              ...block,
              type: "link",
              metadata: { ...block.metadata, url, label },
            }
          : block,
      ),
    );
  }

  function handleChange(nextText: string, cursor: number) {
    const { lineStart, line } = getLineBounds(nextText, cursor);
    setActiveLineIndex(getLineIndex(nextText, cursor));
    setCommandLineStart(line === "/" ? lineStart : null);
    setPendingMention(null);
    commitText(nextText);
  }

  function setTextareaSelection(textarea: HTMLTextAreaElement, cursor: number) {
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
      setActiveLineIndex(getLineIndex(textarea.value, cursor));
    });
  }

  function turnSlashIntoList(textarea: HTMLTextAreaElement) {
    if (commandLineStart === null) return;
    const nextText = replaceRange(text, commandLineStart, commandLineStart + 1, BULLET_PREFIX);
    commitText(nextText);
    setCommandLineStart(null);
    setTextareaSelection(textarea, commandLineStart + BULLET_PREFIX.length);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget;
    const cursor = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const { lineStart, lineEnd, line } = getLineBounds(text, cursor);
    const lineIndex = getLineIndex(text, cursor);

    if (pendingMention && event.key === "Enter") {
      event.preventDefault();
      turnPendingMentionIntoLink(textarea);
      return;
    }

    if (pendingMention && event.key === "Escape") {
      event.preventDefault();
      setPendingMention(null);
      return;
    }

    if (commandLineStart !== null && event.key === "Enter") {
      event.preventDefault();
      turnSlashIntoList(textarea);
      return;
    }

    if (commandLineStart !== null && event.key === "Escape") {
      event.preventDefault();
      setCommandLineStart(null);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      const deleteEnd = lineEnd < text.length ? lineEnd + 1 : lineEnd;
      const nextText = replaceRange(text, lineStart, deleteEnd, "");
      commitText(nextText.length > 0 ? nextText : "");
      const previousLineEnd = lineStart > 0 ? lineStart - 1 : 0;
      setTextareaSelection(textarea, previousLineEnd);
      return;
    }

    if (isLinkBlock(blocks[lineIndex])) {
      const label = blocks[lineIndex].metadata.label as string;
      const mentionEnd = lineStart + (line.startsWith(BULLET_PREFIX) ? BULLET_PREFIX.length : 0) + label.length;
      
      // Jika kursor berada tepat di/sebelum mentionEnd, backspace/delete akan menghapus mention secara utuh.
      // Jika kursor berada dikanan mentionEnd (misal user mengetik tulisan tambahan), ketikan backspace akan menghapus tulisan tambahan tersebut huruf demi huruf secara normal.
      if (cursor <= mentionEnd) {
        if (event.key === "Backspace" || event.key === "Delete") {
          event.preventDefault();
          const range = getLineDeleteRange(text, lineStart, lineEnd);
          const nextText = replaceRange(text, range.start, range.end, "");
          commitTextAfterDeletingBlock(nextText, lineIndex);
          setTextareaSelection(textarea, range.start);
          return;
        }
      }
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const prefix = line.startsWith(BULLET_PREFIX) ? `\n${BULLET_PREFIX}` : "\n";
      const nextText = replaceRange(text, cursor, selectionEnd, prefix);
      const nextCursor = cursor + prefix.length;
      commitText(nextText);
      setCommandLineStart(null);
      setPendingMention(null);
      setTextareaSelection(textarea, nextCursor);
      return;
    }

    if (
      event.key === "Backspace" &&
      cursor === selectionEnd &&
      line.startsWith(BULLET_PREFIX) &&
      cursor <= lineStart + BULLET_PREFIX.length
    ) {
      event.preventDefault();
      const nextText = replaceRange(text, lineStart, lineStart + BULLET_PREFIX.length, "");
      commitText(nextText);
      setTextareaSelection(textarea, lineStart);
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const pastedText = event.clipboardData.getData("text").trim();
    const preview = getLinkPreview(pastedText);
    if (!preview) return;

    event.preventDefault();

    const textarea = event.currentTarget;
    const cursor = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const nextText = replaceRange(text, cursor, selectionEnd, preview.url);
    const nextCursor = cursor + preview.url.length;
    const { lineStart } = getLineBounds(nextText, nextCursor);

    commitText(nextText);
    setCommandLineStart(null);
    setActiveLineIndex(getLineIndex(nextText, nextCursor));
    setPendingMention({
      url: preview.url,
      start: cursor,
      end: nextCursor,
      lineStart,
      label: preview.title,
      isLoadingTitle: isYoutubeUrl(preview.url),
    });
    setTextareaSelection(textarea, nextCursor);

    if (isYoutubeUrl(preview.url)) {
      fetchYoutubeTitleAction(preview.url).then((result) => {
        if (!result.success || !result.title) {
          setPendingMention((current) =>
            current?.url === preview.url ? { ...current, isLoadingTitle: false } : current,
          );
          return;
        }

        setPendingMention((current) =>
          current?.url === preview.url
            ? { ...current, label: result.title ?? current.label, isLoadingTitle: false }
            : current,
        );
      });
    }
  }

  function turnPendingMentionIntoLink(textarea: HTMLTextAreaElement) {
    if (!pendingMention) return;

    // Tidak perlu spasi ekstra karena visual rendering sekarang sudah presisi
    const nextText = replaceRange(text, pendingMention.start, pendingMention.end, pendingMention.label);
    const nextCursor = pendingMention.start + pendingMention.label.length;
    const lineIndex = getLineIndex(nextText, nextCursor);

    commitLinkText(nextText, lineIndex, pendingMention.url, pendingMention.label);
    setPendingMention(null);
    setActiveLineIndex(lineIndex);
    setTextareaSelection(textarea, nextCursor);
  }

  function handleClick(event: React.MouseEvent<HTMLTextAreaElement>) {
    if (!event.ctrlKey && !event.metaKey && event.detail < 2) return;

    const textarea = event.currentTarget;
    const lineIndex = getLineIndex(text, textarea.selectionStart);
    const block = blocks[lineIndex];
    const blockUrl = getBlockUrl(block);
    const url = blockUrl ?? findFirstLinkPreview(block?.content ?? "")?.url;
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  const linkOverlays = text
    .split("\n")
    .map((line, index) => {
      const block = blocks[index];
      const content = getDisplayLine(line);
      const mentionedUrl = getBlockUrl(block);
      const rawUrl = findFirstLinkPreview(content)?.url;
      const url = mentionedUrl ?? rawUrl;

      if (!url) return null;

      const label = (block?.metadata?.label as string | undefined) || (mentionedUrl ? content : url);

      return {
        index,
        url,
        label,
        isMention: Boolean(mentionedUrl),
        isBullet: line.startsWith(BULLET_PREFIX),
        isYoutube: isYoutubeUrl(url),
        isActive: activeLineIndex === index,
      };
    })
    .filter((overlay): overlay is NonNullable<typeof overlay> => Boolean(overlay));

  return (
    <div className="relative min-h-0 flex-1">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(event) => handleChange(event.currentTarget.value, event.currentTarget.selectionStart)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => setActiveLineIndex(getLineIndex(text, event.currentTarget.selectionStart))}
        onSelect={(event) => setActiveLineIndex(getLineIndex(text, event.currentTarget.selectionStart))}
        onFocus={(event) => setActiveLineIndex(getLineIndex(text, event.currentTarget.selectionStart))}
        onBlur={() => setActiveLineIndex(null)}
        onPaste={handlePaste}
        spellCheck={false}
        className="notes-scrollbar relative z-10 h-full min-h-0 w-full resize-none bg-transparent pr-2 text-base font-medium leading-8 text-zinc-100 outline-none selection:bg-sky-500/35"
      />
      {/* Overlay link/mention absolute di atas textarea */}
      <div className="absolute inset-0 pointer-events-none select-none z-20">
        {text.split("\n").map((line, index) => {
          const block = blocks[index];
          const isBullet = line.startsWith(BULLET_PREFIX);
          const content = isBullet ? line.slice(BULLET_PREFIX.length) : line;
          const mentionedUrl = getBlockUrl(block);
          const rawUrl = findFirstLinkPreview(content)?.url;
          const url = mentionedUrl ?? rawUrl;
          const isPendingMentionLine =
            pendingMention !== null && getLineIndex(text, pendingMention.start) === index;

          if (url && !isPendingMentionLine) {
            const label = (block?.metadata?.label as string | undefined) || (mentionedUrl ? content : url);
            const isMention = Boolean(mentionedUrl);
            const isYoutube = isYoutubeUrl(url);

            return (
              <div
                key={`${index}-${url}`}
                className="absolute flex h-8 max-w-full items-center"
                style={{
                  top: `${index * 32}px`,
                  left: isBullet ? "24px" : "0px",
                }}
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  title={url}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  onMouseDown={(event) => {
                    // Fokuskan kursor ke akhir label jika diklik
                    event.preventDefault();
                    const textarea = textareaRef.current;
                    if (!textarea) return;
                    const lines = text.split("\n");
                    const lineStart = lines.slice(0, index).join("\n").length + (index > 0 ? 1 : 0);
                    const prefixLen = isBullet ? BULLET_PREFIX.length : 0;
                    const selectionPos = lineStart + prefixLen + content.length;
                    textarea.focus();
                    textarea.setSelectionRange(selectionPos, selectionPos);
                  }}
                  className={
                    isMention
                      ? "relative inline-flex pointer-events-auto cursor-pointer items-center rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-base font-semibold leading-7 text-zinc-100 shadow-sm hover:bg-zinc-800"
                      : "relative inline-flex pointer-events-auto cursor-pointer items-center truncate text-base font-semibold leading-8 text-zinc-100 underline decoration-zinc-500 underline-offset-4 hover:decoration-zinc-300"
                  }
                >
                  <span
                    className={
                      isYoutube
                        ? "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded bg-red-600 text-white transition hover:bg-red-500 mr-1.5"
                        : "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded bg-zinc-800 text-emerald-300 transition hover:bg-zinc-700 mr-1.5"
                    }
                  >
                    {isYoutube ? (
                      <span className="ml-0.5 h-0 w-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-white" />
                    ) : (
                      <LinkIcon className="size-3.5" />
                    )}
                  </span>
                  <span>{label}</span>
                </a>
              </div>
            );
          }

          return null;
        })}
      </div>
      {commandLineStart !== null ? (
        <div
          className="absolute left-0 z-20"
          style={{ top: `${Math.max(36, commandLineIndex * 32 + 40)}px` }}
        >
          <SlashCommandMenu
            onSelectList={() => {
              if (textareaRef.current) turnSlashIntoList(textareaRef.current);
            }}
          />
        </div>
      ) : null}
      {pendingMention ? (
        <div
          className="absolute z-20 w-[260px] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl"
          style={{ top: `${Math.max(36, getLineIndex(text, pendingMention.start) * 32 + 40)}px`, left: "0px" }}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-zinc-100 hover:bg-zinc-800"
            onMouseDown={(event) => {
              event.preventDefault();
              if (textareaRef.current) turnPendingMentionIntoLink(textareaRef.current);
            }}
          >
            <LinkIcon className="size-4 text-zinc-400" />
            <span className="min-w-0 flex-1 truncate">
              Mention
              <span className="ml-1 text-xs font-normal text-zinc-500">
                {pendingMention.isLoadingTitle ? "fetching title..." : pendingMention.label}
              </span>
            </span>
          </button>
          <div className="border-t border-zinc-800 px-2 py-1 text-xs text-zinc-500">
            Enter to select · esc to keep URL
          </div>
        </div>
      ) : null}
    </div>
  );
}
