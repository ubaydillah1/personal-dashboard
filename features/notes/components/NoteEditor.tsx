"use client";

import { useMemo, useState } from "react";
import type { Note } from "../types";
import { getInitialDraftBlocks } from "../editor/draft";
import { useNoteAutosave } from "../editor/useNoteAutosave";
import type { DraftBlock } from "../editor/types";
import { BlocksEditable } from "./BlocksEditable";

export function NoteEditor({ note }: { note: Note }) {
  const initialBlocks = useMemo(() => getInitialDraftBlocks(note), [note]);
  const [title, setTitle] = useState(note.title);
  const [blocks, setBlocks] = useState<DraftBlock[]>(initialBlocks);
  const saveStatus = useNoteAutosave({
    noteId: note.id,
    title,
    blocks,
  });

  return (
    <section className="min-h-[calc(100vh-3rem)] rounded-lg border border-zinc-800 bg-zinc-950 p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          className="min-w-0 flex-1 bg-transparent text-3xl font-semibold text-zinc-50 outline-none placeholder:text-zinc-700"
          placeholder="Untitled note"
        />
        <span className="rounded bg-zinc-900 px-2 py-1 text-xs text-zinc-500">{saveStatus}</span>
      </div>

      <BlocksEditable blocks={blocks} setBlocks={setBlocks} />
    </section>
  );
}
