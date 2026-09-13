import type { Metadata } from "next";
import { BoardClientView } from "@/features/board/components/BoardClientView";

export const metadata: Metadata = {
  title: "Todo",
  description: "Plan and track daily todos across a flexible date range.",
};

export default function BoardPage() {
  return <BoardClientView />;
}
