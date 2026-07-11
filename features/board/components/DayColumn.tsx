import { formatDayLabel } from "@/lib/utils";
import type { Combo } from "@/features/combos/types";
import type { DayBoard } from "../types";
import { AddComboInline } from "./AddComboInline";
import { AddTaskInline } from "./AddTaskInline";
import { CopyPreviousDayButton } from "./CopyPreviousDayButton";
import { SortableTaskList } from "./SortableTaskList";

export function DayColumn({
  day,
  combos,
  tags,
  previousDate,
  isToday = false,
}: {
  day: DayBoard;
  combos: Combo[];
  tags: string[];
  previousDate?: string;
  isToday?: boolean;
}) {
  const doneCount = day.tasks.filter((task) => task.isDone).length;

  return (
    <section className={isToday ? "flex h-full min-h-[520px] w-[280px] shrink-0 flex-col rounded-lg border border-emerald-500/50 bg-zinc-900/80 p-3 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]" : "flex h-full min-h-[520px] w-[280px] shrink-0 flex-col rounded-lg border border-zinc-800 bg-zinc-900/70 p-3"}>
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">{formatDayLabel(day.date)}</h2>
          <p className="text-xs text-zinc-500">{day.date}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded bg-zinc-950 px-2 py-1 text-xs text-zinc-400">
            {doneCount}/{day.tasks.length}
          </span>
        </div>
      </header>
      <SortableTaskList date={day.date} tasks={day.tasks} />
      <div className="mt-3 border-t border-zinc-800 pt-3">
        <div className="grid gap-3">
          {previousDate ? <CopyPreviousDayButton from={previousDate} to={day.date} /> : null}
          <AddComboInline date={day.date} combos={combos} />
          <AddTaskInline date={day.date} tags={tags} />
        </div>
      </div>
    </section>
  );
}
