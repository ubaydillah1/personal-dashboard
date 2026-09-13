export default function FinanceReportLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12 animate-pulse">
      {/* Back button & Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-44 rounded-xl bg-zinc-800" />
      </div>

      <div className="space-y-1.5">
        <div className="h-7 w-48 rounded bg-zinc-800" />
        <div className="h-3.5 w-72 rounded bg-zinc-800/60" />
      </div>

      {/* Month Selector Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="h-9 w-28 rounded-lg bg-zinc-800" />
        <div className="h-6 w-36 rounded bg-zinc-800" />
        <div className="h-9 w-28 rounded-lg bg-zinc-800" />
      </div>

      {/* 3 Metric Cards Skeleton */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-28 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="h-3.5 w-24 rounded bg-zinc-800" />
          <div className="h-6 w-36 rounded bg-zinc-800" />
        </div>
        <div className="h-28 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="h-3.5 w-24 rounded bg-zinc-800" />
          <div className="h-6 w-36 rounded bg-zinc-800" />
        </div>
        <div className="h-28 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="h-3.5 w-24 rounded bg-zinc-800" />
          <div className="h-6 w-36 rounded bg-zinc-800" />
        </div>
      </div>

      {/* Daily Chart Box Skeleton */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <div className="h-5 w-40 rounded bg-zinc-800" />
        <div className="h-44 w-full rounded-xl bg-zinc-800/50" />
      </div>

      {/* Categories Breakdown Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
          <div className="h-5 w-48 rounded bg-zinc-800" />
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 rounded-lg bg-zinc-800/60" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
          <div className="h-5 w-48 rounded bg-zinc-800" />
          <div className="space-y-2 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 rounded-lg bg-zinc-800/60" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
