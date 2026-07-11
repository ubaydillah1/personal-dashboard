"use client";

import { Trash2 } from "lucide-react";
import { PendingButton } from "@/components/shared/PendingButton";
import { deleteNoteAction } from "../actions";

export function DeleteNoteButton({
  noteId,
  noteTitle,
}: {
  noteId: string;
  noteTitle: string;
}) {
  return (
    <form
      action={deleteNoteAction}
      onSubmit={(event) => {
        const isConfirmed = window.confirm(`Delete "${noteTitle}"?`);
        if (!isConfirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={noteId} />
      <PendingButton
        type="submit"
        size="icon-sm"
        variant="ghost"
        className="opacity-0 transition group-hover/note:opacity-100"
        title="Delete note"
      >
        <Trash2 className="size-4" />
      </PendingButton>
    </form>
  );
}
