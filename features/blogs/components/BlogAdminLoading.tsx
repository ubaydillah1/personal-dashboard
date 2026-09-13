export function BlogAdminLoading() {
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[320px_minmax(0,1fr)] animate-pulse">
      {/* Left Sidebar Skeleton */}
      <aside className="rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-4">
        <div className="mb-4 h-10 w-full rounded-lg bg-zinc-800/80" />
        <div className="grid gap-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-16 w-full rounded-lg border border-zinc-800/40 bg-zinc-950/40 p-3">
              <div className="h-4 w-3/4 rounded bg-zinc-800/60" />
              <div className="mt-2 h-3 w-1/2 rounded bg-zinc-800/40" />
            </div>
          ))}
        </div>
      </aside>

      {/* Right Editor Skeleton */}
      <section className="space-y-6">
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="h-8 w-48 rounded bg-zinc-800" />
            <div className="flex gap-2">
              <div className="h-9 w-20 rounded bg-zinc-800/60" />
              <div className="h-9 w-24 rounded bg-zinc-800/60" />
            </div>
          </div>
          <div className="grid gap-4">
            <div className="h-12 w-full rounded-lg bg-zinc-950/50 border border-zinc-800/40" />
            <div className="h-20 w-full rounded-lg bg-zinc-950/50 border border-zinc-800/40" />
            <div className="h-32 w-full rounded-lg bg-zinc-950/50 border border-zinc-800/40" />
          </div>
        </div>
      </section>
    </div>
  );
}
