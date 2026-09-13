export function NotesSidebarLoading() {
  return (
    <aside className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-3 animate-pulse">
      <div className="mb-3 h-9 w-full rounded-md bg-zinc-800/80" />
      <div className="grid gap-2">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-9 w-full rounded-md bg-zinc-800/40" />
        ))}
      </div>
    </aside>
  );
}

export function NoteEditorLoading() {
  return (
    <section className="flex h-[calc(100vh-3rem)] min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-800/60 bg-zinc-950/80 p-5 animate-pulse">
      <div className="mb-5 flex items-center justify-between">
        <div className="h-9 w-64 rounded-md bg-zinc-800/80" />
        <div className="h-5 w-16 rounded bg-zinc-900" />
      </div>
      <div className="grid gap-3">
        <div className="h-6 w-3/4 rounded bg-zinc-800/40" />
        <div className="h-6 w-1/2 rounded bg-zinc-800/40" />
        <div className="h-6 w-5/6 rounded bg-zinc-800/40" />
        <div className="h-6 w-2/3 rounded bg-zinc-800/40" />
      </div>
    </section>
  );
}

export function NotesLoading() {
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <NotesSidebarLoading />
      <NoteEditorLoading />
    </div>
  );
}
