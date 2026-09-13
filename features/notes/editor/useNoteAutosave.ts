"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { saveNoteAction } from "../actions";
import { NOTES_QUERY_KEYS } from "../hooks";
import { createDraftBlock, serializeDraft } from "./draft";
import type { DraftBlock, SaveStatus } from "./types";

export function useNoteAutosave({
  noteId,
  title,
  blocks,
}: {
  noteId: string;
  title: string;
  blocks: DraftBlock[];
}) {
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const lastSavedDraftRef = useRef(serializeDraft(title, blocks));

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (saveStatus === "saved") return;
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  useEffect(() => {
    const nextDraft = serializeDraft(title, blocks);
    if (nextDraft === lastSavedDraftRef.current) return;

    setSaveStatus("unsaved");
    const timeoutId = window.setTimeout(async () => {
      setSaveStatus("saving");
      const normalizedBlocks = blocks.map((block, index) => ({
        id: block.id,
        type:
          block.type === "link" || block.type === "text"
            ? block.type
            : ("bullet" as const),
        content: block.content,
        position: index,
        metadata: block.metadata,
      }));

      const result = await saveNoteAction({
        id: noteId,
        title: title.trim() || "Untitled note",
        blocks: normalizedBlocks.length > 0 ? normalizedBlocks : [createDraftBlock(0)],
      });

      if (result.success) {
        lastSavedDraftRef.current = serializeDraft(title, blocks);
        setSaveStatus("saved");
        queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEYS.list });
      } else {
        setSaveStatus("unsaved");
      }
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [blocks, noteId, title, queryClient]);

  return saveStatus;
}
