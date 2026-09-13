export function BlogImagesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-8 w-40 rounded-md bg-zinc-800" />
        <div className="mt-2 h-4 w-72 rounded-md bg-zinc-800/70" />
      </div>

      {/* Upload Dropzone Skeleton */}
      <div className="flex h-36 w-full items-center justify-center rounded-xl border-2 border-dashed border-zinc-800/80 bg-zinc-900/40 p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-zinc-800/60" />
          <div className="h-4 w-48 rounded bg-zinc-800/60" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-10 w-72 rounded-lg bg-zinc-900/60 border border-zinc-800/60" />
        <div className="h-4 w-24 rounded bg-zinc-800/50" />
      </div>

      {/* Image Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-2"
          >
            <div className="h-full w-full rounded-lg bg-zinc-950/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
