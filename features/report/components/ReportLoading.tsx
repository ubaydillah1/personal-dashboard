export function ReportLoading() {
  return (
    <div className="grid gap-5 animate-pulse">
      <div>
        <div className="h-8 w-36 rounded-md bg-zinc-800" />
        <div className="mt-2 h-4 w-80 rounded-md bg-zinc-800/70" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-9 w-24 rounded-md bg-zinc-800/60" />
        ))}
      </div>

      {/* Date Pickers Skeleton */}
      <div className="flex flex-wrap gap-2">
        <div className="h-9 w-36 rounded-md bg-zinc-800/50" />
        <div className="h-9 w-36 rounded-md bg-zinc-800/50" />
        <div className="h-9 w-20 rounded-md bg-zinc-800/50" />
      </div>

      {/* Summary Stat Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        {[1, 2, 3].map((card) => (
          <div key={card} className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-4">
            <div className="h-3 w-16 rounded bg-zinc-800/60" />
            <div className="mt-2 h-8 w-20 rounded bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Completion rate per keyword Skeleton */}
      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-4">
        <div className="h-4 w-48 rounded bg-zinc-800" />
        <div className="mt-4 grid gap-3">
          {[1, 2, 3].map((row) => (
            <div key={row} className="grid gap-1">
              <div className="flex justify-between">
                <div className="h-4 w-28 rounded bg-zinc-800/60" />
                <div className="h-4 w-16 rounded bg-zinc-800/60" />
              </div>
              <div className="h-3 rounded bg-zinc-950/50" />
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Skeleton */}
      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-4">
        <div className="h-4 w-40 rounded bg-zinc-800" />
        <div className="mt-4 grid gap-2">
          {[1, 2, 3].map((row) => (
            <div key={row} className="h-8 rounded bg-zinc-950/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
