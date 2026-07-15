import Link from "next/link";
import { LayoutList, NotebookText, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Open your todos, notes, combos, and reports.",
};

export default function HomePage() {
  return (
    <div className="grid min-h-[calc(100vh-3rem)] content-center gap-8">
      <section>
        <div className="mb-4 flex size-12 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-sky-300">
          <Sparkles className="size-5" />
        </div>
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-zinc-50">
          Welcome back, Ubay.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
          This is your personal life workspace: track daily tasks, build reusable combos, and keep focused notes in one place.
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/board" className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/80">
          <LayoutList className="mb-3 size-5 text-emerald-300" />
          <h2 className="font-semibold text-zinc-50">Todo Tracker</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">Open this week&apos;s board and keep the day moving.</p>
        </Link>
        <Link href="/notes" className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/80">
          <NotebookText className="mb-3 size-5 text-amber-300" />
          <h2 className="font-semibold text-zinc-50">Notes</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">Capture bullet notes, links, and ideas before they drift away.</p>
        </Link>
      </div>
    </div>
  );
}
