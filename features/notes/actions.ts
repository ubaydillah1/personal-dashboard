"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/jwt";
import { noteIdSchema, saveNoteSchema, type SaveNoteSchemaInput } from "@/validators/note.schema";
import { notesService } from "./service";

export async function createNoteAction() {
  await requireAuth();
  const note = await notesService.createNote();
  revalidatePath("/notes");
  redirect(`/notes/${note.id}`);
}

export async function saveNoteAction(input: SaveNoteSchemaInput) {
  await requireAuth();
  const parsed = saveNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid note payload." };
  }

  await notesService.saveNote(parsed.data);
  revalidatePath("/notes");
  revalidatePath(`/notes/${parsed.data.id}`);
  return { success: true };
}

export async function openNoteAction(formData: FormData) {
  await requireAuth();
  const parsed = noteIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) redirect("/notes");
  redirect(`/notes/${parsed.data.id}`);
}

export async function deleteNoteAction(formData: FormData) {
  await requireAuth();
  const parsed = noteIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) return;
  await notesService.deleteNote(parsed.data.id);
  revalidatePath("/notes");
  redirect("/notes");
}
