"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  FileText,
  Home,
  Images,
  LayoutList,
  LogOut,
  NotebookText,
  PackagePlus,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "dashboard.sidebarOpen";

const workspaces = [
  {
    id: "personal",
    label: "Personal Life",
    href: "/home",
    icon: Home,
    accentClassName: "text-sky-400",
    groups: [
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
    ],
  },
  {
    id: "publishing",
    label: "Publishing",
    href: "/blog-admin",
    icon: PenLine,
    accentClassName: "text-violet-300",
    groups: [
      {
        label: "Publishing",
        items: [
          { href: "/blog-admin", label: "Blog", icon: FileText },
          { href: "/blog-images", label: "Images", icon: Images },
        ],
      },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const activeWorkspace = workspaces.find((workspace) =>
    workspace.groups.some((group) => group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))),
  ) ?? workspaces[0];
  const ActiveWorkspaceIcon = activeWorkspace.icon;
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
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
      <div
        className={cn(
          "flex border-b border-zinc-800 px-3",
          isOpen ? "h-14 items-center justify-between" : "h-20 flex-col items-center justify-center gap-2",
        )}
      >
        <div className="relative min-w-0">
          <button
            type="button"
            className={cn(
              "flex min-w-0 items-center gap-2 rounded-md text-left transition hover:text-zinc-50",
              isOpen ? "h-9 px-2" : "size-8 justify-center",
            )}
            title="Switch workspace"
            onClick={() => setIsWorkspaceMenuOpen((currentValue) => !currentValue)}
          >
          <ActiveWorkspaceIcon className={cn("size-4 shrink-0", activeWorkspace.accentClassName)} />
          {isOpen ? (
            <>
              <span className="truncate text-sm font-semibold text-zinc-50">{activeWorkspace.label}</span>
              <ChevronsUpDown className="size-3 shrink-0 text-zinc-600" />
            </>
          ) : null}
          </button>

          {isWorkspaceMenuOpen ? (
            <div
              className={cn(
                "absolute left-0 top-11 z-50 w-56 rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-xl shadow-black/30",
                !isOpen && "left-9 top-0",
              )}
            >
              {workspaces.map((workspace) => {
                const WorkspaceIcon = workspace.icon;
                const isActive = workspace.id === activeWorkspace.id;

                return (
                  <Link
                    key={workspace.id}
                    href={workspace.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-zinc-900 hover:text-zinc-50",
                      isActive ? "bg-zinc-900 text-zinc-50" : "text-zinc-400",
                    )}
                    onClick={() => setIsWorkspaceMenuOpen(false)}
                  >
                    <WorkspaceIcon className={cn("size-4", workspace.accentClassName)} />
                    {workspace.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          title="Toggle sidebar"
          className={cn(!isOpen && "border border-zinc-800 bg-zinc-950")}
          onClick={toggleSidebar}
        >
          {isOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {activeWorkspace.groups.map((group) => (
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
