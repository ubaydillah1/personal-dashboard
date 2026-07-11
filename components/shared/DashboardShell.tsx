import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <DashboardSidebar />
      <main className="min-h-screen px-4 py-6 transition-[padding] duration-200 md:pl-[calc(var(--dashboard-sidebar-width,16rem)+2rem)] md:pr-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
