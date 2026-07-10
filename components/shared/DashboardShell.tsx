import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";

const navItems = [
  { href: "/board", label: "Board" },
  { href: "/templates", label: "Combos" },
  { href: "/report", label: "Report" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/board" className="text-sm font-semibold tracking-normal text-zinc-50">
            Activity Tracker
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction}>
            <Button type="submit" size="icon-sm" variant="ghost" title="Logout">
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
