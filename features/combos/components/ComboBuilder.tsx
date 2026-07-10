"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PendingButton } from "@/components/shared/PendingButton";
import { TagInput } from "@/components/shared/TagInput";
import { createComboAction } from "../actions";

const inputClassName =
  "h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm outline-none focus:border-emerald-400";

const compactInputClassName =
  "h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm outline-none focus:border-emerald-400";

type DraftTask = {
  id: number;
};

export function ComboBuilder({ tags }: { tags: string[] }) {
  const [tasks, setTasks] = useState<DraftTask[]>([{ id: 1 }]);

  function addTaskRow() {
    setTasks((current) => [...current, { id: Date.now() }]);
  }

  function removeTaskRow(id: number) {
    setTasks((current) => (current.length === 1 ? current : current.filter((task) => task.id !== id)));
  }

  return (
    <form action={createComboAction} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input name="name" placeholder="Combo name" className={inputClassName} required />
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2 border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
          onClick={addTaskRow}
        >
          <Plus className="size-4" />
          Task
        </Button>
      </div>

      <div className="mt-4 grid gap-3">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="grid gap-2 rounded-md border border-zinc-800 bg-zinc-950/50 p-3 lg:grid-cols-[minmax(220px,1fr)_minmax(160px,220px)_minmax(220px,1fr)_40px] lg:items-start"
          >
            <input
              name="taskTitle"
              placeholder={`Task ${index + 1}`}
              className={compactInputClassName}
              required={index === 0}
            />
            <TagInput tags={tags} name="taskKeyword" className={compactInputClassName} />
            <input name="taskNote" placeholder="Note" className={compactInputClassName} />
            <Button
              type="button"
              size="icon-lg"
              variant="ghost"
              className="mt-0 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50"
              title="Remove task row"
              onClick={() => removeTaskRow(task.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <PendingButton type="submit" className="h-10 gap-2" pendingLabel="Saving...">
          <Plus className="size-4" />
          Save combo
        </PendingButton>
      </div>
    </form>
  );
}
