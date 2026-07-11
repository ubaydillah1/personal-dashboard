import type { Note, NoteBlock, NoteBlockType, NoteListItem, SaveNoteInput } from "@/features/notes/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type NoteRow = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type NoteBlockRow = {
  id: string;
  note_id: string;
  type: NoteBlockType;
  content: string;
  position: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function mapNoteListItem(row: NoteRow): NoteListItem {
  return {
    id: row.id,
    title: row.title,
    updatedAt: row.updated_at,
  };
}

function mapNoteBlock(row: NoteBlockRow): NoteBlock {
  return {
    id: row.id,
    noteId: row.note_id,
    type: row.type,
    content: row.content,
    position: row.position,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapNote(row: NoteRow, blocks: NoteBlock[]): Note {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    blocks,
  };
}

export const noteRepository = {
  async findList(): Promise<NoteListItem[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("notes")
      .select("id,title,created_at,updated_at")
      .order("updated_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch notes: ${error.message}`);
    return (data ?? []).map((row) => mapNoteListItem(row as NoteRow));
  },

  async findById(id: string): Promise<Note | null> {
    const supabase = getSupabaseServerClient();
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (noteError) throw new Error(`Failed to fetch note: ${noteError.message}`);
    if (!note) return null;

    const { data: blocks, error: blockError } = await supabase
      .from("note_blocks")
      .select("*")
      .eq("note_id", id)
      .order("position", { ascending: true });

    if (blockError) throw new Error(`Failed to fetch note blocks: ${blockError.message}`);
    return mapNote(note as NoteRow, (blocks ?? []).map((row) => mapNoteBlock(row as NoteBlockRow)));
  },

  async create(title: string): Promise<Note> {
    const supabase = getSupabaseServerClient();
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .insert({ title })
      .select("*")
      .single();

    if (noteError) throw new Error(`Failed to create note: ${noteError.message}`);

    const { data: block, error: blockError } = await supabase
      .from("note_blocks")
      .insert({
        note_id: String(note.id),
        type: "bullet",
        content: "",
        position: 0,
        metadata: {},
      })
      .select("*")
      .single();

    if (blockError) throw new Error(`Failed to create note block: ${blockError.message}`);
    return mapNote(note as NoteRow, [mapNoteBlock(block as NoteBlockRow)]);
  },

  async save(input: SaveNoteInput): Promise<void> {
    const supabase = getSupabaseServerClient();
    const { error: noteError } = await supabase
      .from("notes")
      .update({ title: input.title })
      .eq("id", input.id);

    if (noteError) throw new Error(`Failed to save note: ${noteError.message}`);

    const { error: deleteError } = await supabase.from("note_blocks").delete().eq("note_id", input.id);
    if (deleteError) throw new Error(`Failed to replace note blocks: ${deleteError.message}`);

    const blocks = input.blocks.map((block) => ({
      note_id: input.id,
      type: block.type,
      content: block.content,
      position: block.position,
      metadata: block.metadata ?? {},
    }));

    const { error: insertError } = await supabase.from("note_blocks").insert(blocks);
    if (insertError) throw new Error(`Failed to save note blocks: ${insertError.message}`);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete note: ${error.message}`);
  },
};
