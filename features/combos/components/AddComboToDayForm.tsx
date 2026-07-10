"use client";

import { CalendarPlus } from "lucide-react";
import { PendingButton } from "@/components/shared/PendingButton";
import { addDays, formatDayLabel, startOfWeekMonday, toDateKey } from "@/lib/utils";
import { addComboToDateFromListAction } from "../actions";

function getCurrentWeekDates() {
  const start = startOfWeekMonday(new Date());
  return Array.from({ length: 7 }, (_, index) => toDateKey(addDays(start, index)));
}

export function AddComboToDayForm({ comboId }: { comboId: string }) {
  const dates = getCurrentWeekDates();

  return (
    <form action={addComboToDateFromListAction} className="flex flex-wrap gap-2">
      <input type="hidden" name="id" value={comboId} />
      <select
        name="date"
        className="h-8 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-100 outline-none focus:border-emerald-400"
      >
        {dates.map((date) => (
          <option key={date} value={date}>
            {formatDayLabel(date)}
          </option>
        ))}
      </select>
      <PendingButton
        type="submit"
        size="sm"
        variant="outline"
        className="gap-2 border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
        pendingLabel="Adding..."
      >
        <CalendarPlus className="size-4" />
        Add
      </PendingButton>
    </form>
  );
}
