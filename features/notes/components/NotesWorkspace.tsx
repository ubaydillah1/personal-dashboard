import type { Note, NoteListItem } from "../types";
import { NoteEditor } from "./NoteEditor";
import { NotesList } from "./NotesList";

export function NotesWorkspace({
  notes,
  note,
}: {
  notes: NoteListItem[];
  note: Note | null;
}) {
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <NotesList notes={notes} activeNoteId={note?.id} />
      {note ? (
        <NoteEditor note={note} />
      ) : (
        <section className="grid min-h-[420px] place-items-center rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-50">Notes</h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Create your first note to start collecting points, links, and rough ideas.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
