"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNote, useNotesList } from "../hooks";
import { NoteEditor } from "./NoteEditor";
import { NotesList } from "./NotesList";
import { NoteEditorLoading, NotesSidebarLoading } from "./NotesLoading";

export function NotesWorkspaceClient({ noteId }: { noteId?: string }) {
  const router = useRouter();
  const { data: notes = [], isLoading: isLoadingList } = useNotesList();
  const { data: note, isLoading: isLoadingNote } = useNote(noteId ?? "");

  // Auto redirect to first note if on base /notes and notes exist
  useEffect(() => {
    if (!noteId && !isLoadingList && notes.length > 0 && notes[0]?.id) {
      router.replace(`/notes/${notes[0].id}`);
    }
  }, [noteId, isLoadingList, notes, router]);

  const isListInitialLoading = isLoadingList && notes.length === 0;
  const isEditorInitialLoading = Boolean(noteId && isLoadingNote && !note);

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Kolom Kiri: Sidebar Daftar Notes (Tetap Diam & Tidak Ikut Loading Selayar) */}
      {isListInitialLoading ? (
        <NotesSidebarLoading />
      ) : (
        <NotesList notes={notes} activeNoteId={noteId} />
      )}

      {/* Kolom Kanan: Area Editor (Hanya Bagian Ini yang Loading Jika Note Belum Ada di Cache) */}
      {isEditorInitialLoading ? (
        <NoteEditorLoading />
      ) : note ? (
        <NoteEditor key={note.id} note={note} />
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
