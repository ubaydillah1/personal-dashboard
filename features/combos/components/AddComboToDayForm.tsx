"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addDays, formatDayLabel, startOfWeekMonday, toDateKey } from "@/lib/utils";
import { useAddComboToDate } from "../hooks";

function getCurrentWeekDates() {
  const start = startOfWeekMonday(new Date());
  return Array.from({ length: 7 }, (_, index) => toDateKey(addDays(start, index)));
}

export function AddComboToDayForm({ comboId }: { comboId: string }) {
  const dates = getCurrentWeekDates();
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const addMutation = useAddComboToDate();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addMutation.mutateAsync({ id: comboId, date: selectedDate });
  }

  return (
    <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
      <select
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="h-8 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-100 outline-none focus:border-emerald-400"
      >
        {dates.map((date) => (
          <option key={date} value={date}>
            {formatDayLabel(date)}
          </option>
        ))}
      </select>
      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={addMutation.isPending}
        className="gap-2 border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
      >
        <CalendarPlus className="size-4" />
        {addMutation.isPending ? "Adding..." : "Add"}
      </Button>
    </form>
  );
}
