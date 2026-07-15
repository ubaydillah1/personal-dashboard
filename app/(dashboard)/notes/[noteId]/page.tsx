import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotesWorkspace } from "@/features/notes/components/NotesWorkspace";
import { notesService } from "@/features/notes/service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ noteId: string }>;
}): Promise<Metadata> {
  const { noteId } = await params;
  const note = await notesService.getNote(noteId);

  return {
    title: note ? `${note.title} | Notes` : "Notes",
    description: "Edit and organize a note in your tracker workspace.",
  };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  const [notes, note] = await Promise.all([
    notesService.getNoteList(),
    notesService.getNote(noteId),
  ]);

  if (!note) notFound();
  return <NotesWorkspace notes={notes} note={note} />;
}
