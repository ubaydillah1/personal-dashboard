"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createNoteAction,
  deleteNoteAction,
  getNoteAction,
  getNotesListAction,
  saveNoteAction,
} from "./actions";
import type { Note, NoteListItem } from "./types";
import type { SaveNoteSchemaInput } from "@/validators/note.schema";

export const NOTES_QUERY_KEYS = {
  all: ["notes"] as const,
  list: ["notes", "list"] as const,
  detail: (id: string) => ["notes", "detail", id] as const,
};

export function useNotesList(initialData?: NoteListItem[]) {
  return useQuery({
    queryKey: NOTES_QUERY_KEYS.list,
    queryFn: () => getNotesListAction(),
    initialData,
  });
}

export function useNote(id: string, initialData?: Note | null) {
  return useQuery({
    queryKey: NOTES_QUERY_KEYS.detail(id),
    queryFn: () => (id ? getNoteAction(id) : null),
    enabled: Boolean(id),
    initialData,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => createNoteAction(),
    onSuccess: (res) => {
      if (res.success && res.note) {
        queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEYS.list });
        queryClient.setQueryData(NOTES_QUERY_KEYS.detail(res.note.id), res.note);
        router.push(`/notes/${res.note.id}`);
      }
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ noteId }: { noteId: string; isActive?: boolean }) =>
      deleteNoteAction(noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEYS.list });
      queryClient.removeQueries({ queryKey: NOTES_QUERY_KEYS.detail(variables.noteId) });
      if (variables.isActive) {
        router.push("/notes");
      }
    },
  });
}

export function useSaveNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveNoteSchemaInput) => saveNoteAction(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEYS.detail(variables.id) });
    },
  });
}
