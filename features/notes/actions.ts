"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/jwt";
import { noteIdSchema, saveNoteSchema, type SaveNoteSchemaInput } from "@/validators/note.schema";
import { notesService } from "./service";

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .trim();
}

function getTitleFromHtml(html: string) {
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const title = ogTitle ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  return title ? decodeHtmlEntities(title).replace(/\s+-\s+YouTube\s*$/i, "") : null;
}

export async function getNotesListAction() {
  await requireAuth();
  return notesService.getNoteList();
}

export async function getNoteAction(id: string) {
  await requireAuth();
  const parsed = noteIdSchema.safeParse({ id });
  if (!parsed.success) return null;
  return notesService.getNote(parsed.data.id);
}

export async function createNoteAction() {
  await requireAuth();
  const note = await notesService.createNote();
  revalidatePath("/notes");
  return { success: true, note };
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

export async function fetchYoutubeTitleAction(url: string) {
  await requireAuth();

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");
    const isYoutube =
      hostname === "youtube.com" || hostname.endsWith(".youtube.com") || hostname === "youtu.be";

    if (!isYoutube) return { success: false, title: null };

    const response = await fetch(parsedUrl.toString(), {
      cache: "no-store",
      headers: {
        "user-agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) return { success: false, title: null };

    const html = await response.text();
    return { success: true, title: getTitleFromHtml(html) };
  } catch {
    return { success: false, title: null };
  }
}

export async function deleteNoteAction(idOrFormData: string | FormData) {
  await requireAuth();
  const rawId = typeof idOrFormData === "string" ? idOrFormData : idOrFormData.get("id");
  const parsed = noteIdSchema.safeParse({ id: rawId });

  if (!parsed.success) return { success: false, error: "Invalid ID." };
  await notesService.deleteNote(parsed.data.id);
  revalidatePath("/notes");
  return { success: true };
}
