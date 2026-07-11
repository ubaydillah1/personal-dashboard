"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutList,
  LogOut,
  NotebookText,
  PackagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "dashboard.sidebarOpen";

const navGroups = [
  {
    label: "Main",
    items: [{ href: "/home", label: "Home", icon: Home }],
  },
  {
    label: "Todo Tracker",
    items: [
      { href: "/board", label: "Board", icon: LayoutList },
      { href: "/templates", label: "Combos", icon: PackagePlus },
      { href: "/report", label: "Report", icon: BarChart3 },
    ],
  },
  {
    label: "Notes",
    items: [{ href: "/notes", label: "Notes", icon: NotebookText }],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    const storedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return storedValue === null ? true : storedValue === "true";
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--dashboard-sidebar-width", isOpen ? "16rem" : "4rem");
  }, [isOpen]);

  function toggleSidebar() {
    setIsOpen((currentValue) => {
      const nextValue = !currentValue;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextValue));
      document.documentElement.style.setProperty("--dashboard-sidebar-width", nextValue ? "16rem" : "4rem");
      return nextValue;
    });
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden border-r border-zinc-800 bg-zinc-950/95 text-zinc-300 shadow-2xl shadow-black/20 transition-[width] duration-200 md:flex md:flex-col",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-3">
        <Link href="/home" className="flex min-w-0 items-center gap-2">
          <span className="text-lg font-semibold text-sky-400">∞</span>
          {isOpen ? <span className="truncate text-sm font-semibold text-zinc-50">Personal Life</span> : null}
        </Link>
        <Button type="button" size="icon-sm" variant="ghost" title="Toggle sidebar" onClick={toggleSidebar}>
          {isOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            {isOpen ? (
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
                {group.label}
              </p>
            ) : null}
            <div className="grid gap-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "flex h-9 items-center gap-3 rounded-md px-2 text-sm font-medium transition hover:bg-zinc-900 hover:text-zinc-50",
                      isActive && "bg-zinc-800 text-zinc-50",
                      !isOpen && "justify-center",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {isOpen ? <span className="truncate">{item.label}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-zinc-800 p-2">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className={cn("h-9 w-full justify-start gap-3 text-zinc-400", !isOpen && "justify-center px-0")}
            title="Logout"
          >
            <LogOut className="size-4" />
            {isOpen ? "Logout" : null}
          </Button>
        </form>
      </div>
    </aside>
  );
}
