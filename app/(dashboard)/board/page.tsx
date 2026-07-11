import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BoardView } from "@/features/board/components/BoardView";
import { boardService } from "@/features/board/service";
import {
  addDaysToDateKey,
  compareDateKeys,
  isDateKey,
  toAppDateKey,
} from "@/lib/utils";

const DEFAULT_RANGE_DAYS = 4;

function normalizeRange(params: { from?: string; to?: string }) {
  const today = toAppDateKey();
  const defaultRange = {
    from: today,
    to: addDaysToDateKey(today, DEFAULT_RANGE_DAYS - 1),
  };
  const rawFrom = isDateKey(params.from) ? params.from : defaultRange.from;
  const rawTo = isDateKey(params.to) ? params.to : defaultRange.to;

  if (compareDateKeys(rawFrom, rawTo) <= 0) {
    return { from: rawFrom, to: rawTo };
  }

  return { from: rawTo, to: rawFrom };
}

function boardHref(from: string, to: string) {
  return `/board?from=${from}&to=${to}`;
}

function BoardRangeControls({ from, to }: { from: string; to: string }) {
  const previousFrom = addDaysToDateKey(from, -DEFAULT_RANGE_DAYS);
  const previousTo = addDaysToDateKey(to, -DEFAULT_RANGE_DAYS);
  const nextFrom = addDaysToDateKey(from, DEFAULT_RANGE_DAYS);
  const nextTo = addDaysToDateKey(to, DEFAULT_RANGE_DAYS);

  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-2">
        <Link
          href={boardHref(previousFrom, previousTo)}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50"
          title="Previous 4 days"
        >
          <ChevronLeft className="size-4" />
        </Link>
        <div className="min-w-[210px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
          <p className="text-xs text-zinc-500">Showing</p>
          <p className="text-sm font-medium text-zinc-100">
            {from} to {to}
          </p>
        </div>
        <Link
          href={boardHref(nextFrom, nextTo)}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50"
          title="Next 4 days"
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-2" action="/board">
        <label className="grid gap-1 text-xs text-zinc-500">
          From
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/70"
          />
        </label>
        <label className="grid gap-1 text-xs text-zinc-500">
          To
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/70"
          />
        </label>
        <button
          className="h-9 rounded-lg bg-zinc-100 px-3 text-sm font-medium text-zinc-950 transition hover:bg-white"
          type="submit"
        >
          Apply
        </button>
        <Link
          href="/board"
          className="inline-flex h-9 items-center rounded-lg border border-zinc-800 px-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50"
        >
          Today
        </Link>
      </form>
    </div>
  );
}

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const range = normalizeRange(params);
  const [days, combos, tags] = await Promise.all([
    boardService.getRangeBoard(range.from, range.to),
    boardService.getActiveCombos(),
    boardService.getKnownTags(),
  ]);
  const today = toAppDateKey();

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-zinc-50">Board</h1>
        <p className="mt-1 text-sm leading-6 text-zinc-400">
          Default view starts today and shows four days. Use the arrows or pick a custom range.
        </p>
      </div>
      <BoardRangeControls from={range.from} to={range.to} />
      <BoardView days={days} combos={combos} tags={tags} today={today} />
    </div>
  );
}
