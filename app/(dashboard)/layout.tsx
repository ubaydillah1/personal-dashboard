import { requireAuth } from "@/lib/auth/jwt";
import { DashboardShell } from "@/components/shared/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return <DashboardShell>{children}</DashboardShell>;
}
