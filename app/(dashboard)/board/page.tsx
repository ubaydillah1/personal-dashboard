import type { Metadata } from "next";
import { Suspense } from "react";
import { BoardClientView } from "@/features/board/components/BoardClientView";
import BoardLoading from "./loading";

export const metadata: Metadata = {
  title: "Todo",
  description: "Plan and track daily todos across a flexible date range.",
};

export default function BoardPage() {
  return (
    <Suspense fallback={<BoardLoading />}>
      <BoardClientView />
    </Suspense>
  );
}
