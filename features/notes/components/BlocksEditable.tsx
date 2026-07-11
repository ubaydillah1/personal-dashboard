"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createDraftBlock, isUrl } from "../editor/draft";
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

    return {
      id: previousBlock?.id ?? crypto.randomUUID(),
      type: isBullet ? "bullet" : "text",
      content,
      position: index,
      metadata: previousBlock?.metadata ?? {},
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

export function BlocksEditable({
  blocks,
  setBlocks,
}: {
  blocks: DraftBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<DraftBlock[]>>;
}) {
  const initialText = useMemo(() => blocksToText(blocks.length > 0 ? blocks : [createDraftBlock(0)]), [blocks]);
  const [text, setText] = useState(initialText);
  const [commandLineStart, setCommandLineStart] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const commandLineIndex =
    commandLineStart === null ? 0 : text.slice(0, commandLineStart).split("\n").length - 1;

  useEffect(() => {
    setText(blocksToText(blocks));
  }, [blocks]);

  function commitText(nextText: string) {
    setText(nextText);
    setBlocks((currentBlocks) => textToBlocks(nextText, currentBlocks));
  }

  function handleChange(nextText: string, cursor: number) {
    const { lineStart, line } = getLineBounds(nextText, cursor);
    setCommandLineStart(line === "/" ? lineStart : null);
    commitText(nextText);
  }

  function setTextareaSelection(textarea: HTMLTextAreaElement, cursor: number) {
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
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

    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      const deleteEnd = lineEnd < text.length ? lineEnd + 1 : lineEnd;
      const nextText = replaceRange(text, lineStart, deleteEnd, "");
      commitText(nextText.length > 0 ? nextText : "");
      setTextareaSelection(textarea, lineStart);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const prefix = line.startsWith(BULLET_PREFIX) ? `\n${BULLET_PREFIX}` : "\n";
      const nextText = replaceRange(text, cursor, selectionEnd, prefix);
      const nextCursor = cursor + prefix.length;
      commitText(nextText);
      setCommandLineStart(null);
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

  const links = text
    .split("\n")
    .map((line) => (line.startsWith(BULLET_PREFIX) ? line.slice(BULLET_PREFIX.length) : line))
    .filter(isUrl);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(event) => handleChange(event.currentTarget.value, event.currentTarget.selectionStart)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="min-h-[420px] w-full resize-none bg-transparent text-base font-medium leading-8 text-zinc-100 outline-none selection:bg-sky-500/35"
      />
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
      {links.length > 0 ? (
        <div className="mt-3 grid gap-1">
          {links.map((link) => (
            <a key={link} href={link} target="_blank" rel="noreferrer" className="truncate text-xs text-sky-300 hover:underline">
              {link}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
