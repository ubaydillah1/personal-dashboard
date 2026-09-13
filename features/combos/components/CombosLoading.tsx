export function CombosLoading() {
  return (
    <div className="grid gap-5 animate-pulse">
      <div>
        <div className="h-8 w-36 rounded-md bg-zinc-800" />
        <div className="mt-2 h-4 w-72 rounded-md bg-zinc-800/70" />
      </div>

      {/* ComboBuilder Skeleton */}
      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="h-10 rounded-md bg-zinc-800/50" />
          <div className="h-10 w-24 rounded-md bg-zinc-800/50" />
        </div>
        <div className="mt-4 grid gap-3">
          <div className="h-14 rounded-md bg-zinc-950/40 border border-zinc-800/40" />
        </div>
        <div className="mt-4 flex justify-end">
          <div className="h-10 w-32 rounded-md bg-zinc-800/60" />
        </div>
      </div>

      {/* ComboList Skeleton */}
      <div className="grid gap-3">
        {[1, 2].map((item) => (
          <div key={item} className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="h-5 w-40 rounded bg-zinc-800" />
                <div className="mt-1 h-3 w-16 rounded bg-zinc-800/60" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-24 rounded bg-zinc-800/60" />
                <div className="h-8 w-20 rounded bg-zinc-800/60" />
              </div>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((task) => (
                <div key={task} className="h-16 rounded-md border border-zinc-800/40 bg-zinc-950/50" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
