import type { Metadata } from "next";
import { ReportClientView } from "@/features/report/components/ReportClientView";

export const metadata: Metadata = {
  title: "Report",
  description: "Review skipped todos and progress patterns.",
};

export default function ReportPage() {
  return <ReportClientView />;
}
