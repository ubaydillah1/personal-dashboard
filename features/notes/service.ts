import { noteRepository } from "@/repositories/note.repository";
import type { SaveNoteSchemaInput } from "@/validators/note.schema";

export const notesService = {
  async getNoteList() {
    return noteRepository.findList();
  },

  async getNote(id: string) {
    return noteRepository.findById(id);
  },

  async createNote() {
    return noteRepository.create("Untitled note");
  },

  async saveNote(input: SaveNoteSchemaInput) {
    await noteRepository.save({
      id: input.id,
      title: input.title,
      blocks: input.blocks,
    });
  },

  async deleteNote(id: string) {
    await noteRepository.delete(id);
  },
};
