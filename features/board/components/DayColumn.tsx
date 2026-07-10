import { formatDayLabel } from "@/lib/utils";
import type { DayBoard } from "../types";
import { AddTaskInline } from "./AddTaskInline";
import { TaskItem } from "./TaskItem";

export function DayColumn({ day }: { day: DayBoard }) {
  const doneCount = day.tasks.filter((task) => task.isDone).length;

  return (
    <section className="flex h-full min-h-[520px] w-[280px] shrink-0 flex-col rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">{formatDayLabel(day.date)}</h2>
          <p className="text-xs text-zinc-500">{day.date}</p>
        </div>
        <span className="rounded bg-zinc-950 px-2 py-1 text-xs text-zinc-400">
          {doneCount}/{day.tasks.length}
        </span>
      </header>
      <div className="flex flex-1 flex-col gap-2">
        {day.tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
      <div className="mt-3 border-t border-zinc-800 pt-3">
        <AddTaskInline date={day.date} />
      </div>
    </section>
  );
}
