import type { Metadata } from "next";
import { NotesWorkspaceClient } from "@/features/notes/components/NotesWorkspaceClient";

export const metadata: Metadata = {
  title: "Notes",
  description: "Edit and organize a note in your tracker workspace.",
};

export default async function NotePage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  return <NotesWorkspaceClient noteId={noteId} />;
}
