import type { Combo } from "@/features/combos/types";
import type { DayBoard } from "../types";
import { DayColumn } from "./DayColumn";

export function BoardView({
  days,
  combos,
  tags,
  today,
}: {
  days: DayBoard[];
  combos: Combo[];
  tags: string[];
  today: string;
}) {
  return (
    <div className="board-scrollbar overflow-x-auto pb-3">
      <div className="flex min-w-max gap-3">
        {days.map((day) => (
          <div key={day.date}>
            <DayColumn day={day} combos={combos} tags={tags} isToday={day.date === today} />
          </div>
        ))}
      </div>
    </div>
  );
}
