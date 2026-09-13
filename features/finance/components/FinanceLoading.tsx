export function FinanceLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-zinc-800" />
          <div className="space-y-1.5">
            <div className="h-6 w-44 rounded-md bg-zinc-800" />
            <div className="h-3.5 w-64 rounded bg-zinc-800/60" />
          </div>
        </div>
        <div className="h-9 w-44 rounded-xl bg-zinc-800/80" />
      </div>

      {/* Main Content Skeleton: Form (Left) + List (Right) */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        {/* Left Column: Form Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="h-4 w-32 rounded bg-zinc-800" />
            <div className="h-3.5 w-20 rounded bg-zinc-800/60" />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-4">
            {/* Toggle Switch */}
            <div className="h-11 rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-1" />

            {/* Presets Box */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-3 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-36 rounded bg-zinc-800" />
                <div className="h-3.5 w-20 rounded bg-zinc-800" />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <div className="h-7 w-24 rounded-lg bg-zinc-800/70" />
                <div className="h-7 w-28 rounded-lg bg-zinc-800/70" />
                <div className="h-7 w-20 rounded-lg bg-zinc-800/70" />
                <div className="h-7 w-24 rounded-lg bg-zinc-800/70" />
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 rounded bg-zinc-800" />
              <div className="h-10 rounded-lg bg-zinc-800/70" />
            </div>

            {/* Amount Input + Adjust buttons */}
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 rounded bg-zinc-800" />
              <div className="h-10 rounded-lg bg-zinc-800/70" />
              <div className="space-y-1 pt-1">
                <div className="h-5 w-full rounded bg-zinc-800/50" />
                <div className="h-5 w-3/4 rounded bg-zinc-800/50" />
              </div>
            </div>

            {/* Grid 2 cols */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <div className="h-3.5 w-16 rounded bg-zinc-800" />
                <div className="h-10 rounded-lg bg-zinc-800/70" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3.5 w-16 rounded bg-zinc-800" />
                <div className="h-10 rounded-lg bg-zinc-800/70" />
              </div>
            </div>

            {/* Submit button */}
            <div className="h-10 rounded-xl bg-zinc-800 pt-2" />
          </div>
        </div>

        {/* Right Column: Transaction List Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="h-4 w-32 rounded bg-zinc-800" />
            <div className="h-3.5 w-24 rounded bg-zinc-800/60" />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-4">
            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="h-10 rounded-lg bg-zinc-800/70" />
              <div className="flex gap-2">
                <div className="h-8 w-20 rounded-lg bg-zinc-800" />
                <div className="h-8 w-24 rounded-lg bg-zinc-800" />
                <div className="h-8 w-24 rounded-lg bg-zinc-800" />
              </div>
            </div>

            {/* Transaction Items */}
            <div className="space-y-2.5 pt-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-zinc-800" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 rounded bg-zinc-800" />
                      <div className="h-3 w-20 rounded bg-zinc-800/60" />
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="h-4 w-24 rounded bg-zinc-800 ml-auto" />
                    <div className="h-3 w-14 rounded bg-zinc-800/60 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
