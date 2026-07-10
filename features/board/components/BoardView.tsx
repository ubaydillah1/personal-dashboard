import type { DayBoard } from "../types";
import { DayColumn } from "./DayColumn";

export function BoardView({ days }: { days: DayBoard[] }) {
  return (
    <div className="overflow-x-auto pb-3">
      <div className="flex min-w-max gap-3">
        {days.map((day) => (
          <DayColumn key={day.date} day={day} />
        ))}
      </div>
    </div>
  );
}
