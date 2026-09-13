export default function BoardLoading() {
  return (
    <div className="grid gap-5 animate-pulse">
      {/* Title */}
      <div>
        <div className="h-7 w-28 rounded-md bg-zinc-800" />
        <div className="mt-1 h-4 w-96 rounded bg-zinc-800/60" />
      </div>

      {/* Range controls skeleton */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-zinc-800" />
          <div className="h-10 w-52 rounded-lg bg-zinc-800/80" />
          <div className="size-9 rounded-lg bg-zinc-800" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 rounded-lg bg-zinc-800" />
          <div className="h-9 w-28 rounded-lg bg-zinc-800" />
          <div className="h-9 w-16 rounded-lg bg-zinc-800" />
          <div className="h-9 w-16 rounded-lg bg-zinc-800" />
        </div>
      </div>

      {/* 4 Day Columns Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-5 w-24 rounded bg-zinc-800" />
                <div className="h-3 w-16 rounded bg-zinc-800/60" />
              </div>
              <div className="h-6 w-12 rounded-full bg-zinc-800" />
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-zinc-800/80" />

            {/* Task Item Skeletons */}
            <div className="space-y-2 pt-1 flex-1">
              {[1, 2, 3].map((t) => (
                <div
                  key={t}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-4 rounded border border-zinc-700 bg-zinc-800" />
                    <div className="h-4 w-32 rounded bg-zinc-800" />
                  </div>
                  <div className="h-4 w-12 rounded bg-zinc-800/60" />
                </div>
              ))}
            </div>

            {/* Add task inline skeleton */}
            <div className="h-9 w-full rounded-lg bg-zinc-800/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
