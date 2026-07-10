import { BoardView } from "@/features/board/components/BoardView";
import { boardService } from "@/features/board/service";

export default async function BoardPage() {
  const [days, combos, tags] = await Promise.all([
    boardService.getWeekBoard(),
    boardService.getActiveCombos(),
    boardService.getKnownTags(),
  ]);

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-zinc-50">This Week&apos;s Board</h1>
        <p className="mt-1 text-sm leading-6 text-zinc-400">Copy saved combos into any day, or add a one-off task manually.</p>
      </div>
      <BoardView days={days} combos={combos} tags={tags} />
    </div>
  );
}
