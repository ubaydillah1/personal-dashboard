export type NoteBlockType = "bullet" | "text" | "todo" | "link";

export type NoteBlock = {
  id: string;
  noteId: string;
  type: NoteBlockType;
  content: string;
  position: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  blocks: NoteBlock[];
};

export type NoteListItem = {
  id: string;
  title: string;
  updatedAt: string;
};

export type SaveNoteInput = {
  id: string;
  title: string;
  blocks: Array<{
    id?: string;
    type: NoteBlockType;
    content: string;
    position: number;
    metadata?: Record<string, unknown>;
  }>;
};
