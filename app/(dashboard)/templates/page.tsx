import type { Metadata } from "next";
import { CombosClientView } from "@/features/combos/components/CombosClientView";

export const metadata: Metadata = {
  title: "Combos",
  description: "Create reusable todo groups and copy them into any day.",
};

export default function TemplatesPage() {
  return <CombosClientView />;
}
