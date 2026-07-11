import { notFound } from "next/navigation";
import { NotesWorkspace } from "@/features/notes/components/NotesWorkspace";
import { notesService } from "@/features/notes/service";

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
