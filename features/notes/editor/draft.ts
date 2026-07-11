import type { Note } from "../types";
import type { DraftBlock } from "./types";

export function createDraftBlock(position: number, type: DraftBlock["type"] = "bullet"): DraftBlock {
  return {
    id: crypto.randomUUID(),
    type,
    content: "",
    position,
    metadata: {},
  };
}

export function getInitialDraftBlocks(note: Note): DraftBlock[] {
  if (note.blocks.length === 0) return [createDraftBlock(0)];

  return note.blocks.map((block, index) => ({
    id: block.id,
    type: block.type === "link" || block.type === "text" ? block.type : "bullet",
    content: block.content,
    position: index,
    metadata: block.metadata,
  }));
}

export function serializeDraft(title: string, blocks: DraftBlock[]) {
  return JSON.stringify({
    title: title.trim() || "Untitled note",
    blocks: blocks.map((block, index) => ({
      type: block.type === "link" || block.type === "text" ? block.type : "bullet",
      content: block.content,
      position: index,
      metadata: block.metadata,
    })),
  });
}

export function normalizeEditableText(value: string) {
  return value.replace(/\u00a0/g, " ").trimEnd();
}

export function isUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}
