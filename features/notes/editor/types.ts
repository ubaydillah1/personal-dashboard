import type { NoteBlockType } from "../types";

export type DraftBlock = {
  id: string;
  type: NoteBlockType;
  content: string;
  position: number;
  metadata: Record<string, unknown>;
};

export type SaveStatus = "saved" | "saving" | "unsaved";
