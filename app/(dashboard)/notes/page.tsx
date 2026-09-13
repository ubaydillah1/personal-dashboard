import type { Metadata } from "next";
import { NotesWorkspaceClient } from "@/features/notes/components/NotesWorkspaceClient";

export const metadata: Metadata = {
  title: "Notes",
  description: "Capture notes, links, todos, and ideas.",
};

export default function NotesPage() {
  return <NotesWorkspaceClient />;
}
