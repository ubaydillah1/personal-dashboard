import { redirect } from "next/navigation";
import { NotesWorkspace } from "@/features/notes/components/NotesWorkspace";
import { notesService } from "@/features/notes/service";

export default async function NotesPage() {
  const notes = await notesService.getNoteList();
  if (notes[0]) redirect(`/notes/${notes[0].id}`);

  return <NotesWorkspace notes={notes} note={null} />;
}
