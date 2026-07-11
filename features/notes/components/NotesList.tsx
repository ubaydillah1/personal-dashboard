import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { PendingButton } from "@/components/shared/PendingButton";
import { cn } from "@/lib/utils";
import type { NoteListItem } from "../types";
import { createNoteAction } from "../actions";
import { DeleteNoteButton } from "./DeleteNoteButton";

export function NotesList({
  notes,
  activeNoteId,
}: {
  notes: NoteListItem[];
  activeNoteId?: string;
}) {
  return (
    <aside className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <form action={createNoteAction}>
        <PendingButton type="submit" className="mb-3 h-9 w-full gap-2" pendingLabel="Creating...">
          <Plus className="size-4" />
          New note
        </PendingButton>
      </form>

      <div className="grid gap-1">
        {notes.map((note) => (
          <div
            key={note.id}
            className={cn(
              "group/note grid grid-cols-[1fr_auto] items-center gap-1 rounded-md transition hover:bg-zinc-800",
              activeNoteId === note.id && "bg-zinc-800 text-zinc-50",
            )}
          >
            <Link
              href={`/notes/${note.id}`}
              className="flex min-w-0 items-center gap-2 px-2 py-2 text-sm text-zinc-400 transition hover:text-zinc-50"
            >
              <FileText className="size-4 shrink-0" />
              <span className="truncate">{note.title}</span>
            </Link>
            <DeleteNoteButton noteId={note.id} noteTitle={note.title} />
          </div>
        ))}
      </div>

      {notes.length === 0 ? (
        <p className="px-2 py-6 text-center text-sm text-zinc-500">No notes yet.</p>
      ) : null}
    </aside>
  );
}
