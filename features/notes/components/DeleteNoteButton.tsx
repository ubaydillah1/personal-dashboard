"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteNote } from "../hooks";

export function DeleteNoteButton({
  noteId,
  noteTitle,
  isActive,
}: {
  noteId: string;
  noteTitle: string;
  isActive?: boolean;
}) {
  const deleteMutation = useDeleteNote();

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const isConfirmed = window.confirm(`Delete "${noteTitle}"?`);
    if (isConfirmed) {
      deleteMutation.mutate({ noteId, isActive });
    }
  }

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      onClick={handleDelete}
      disabled={deleteMutation.isPending && deleteMutation.variables?.noteId === noteId}
      className="opacity-0 transition group-hover/note:opacity-100 hover:text-red-400"
      title="Delete note"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
