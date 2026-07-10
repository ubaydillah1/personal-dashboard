import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTaskAction } from "../actions";

export function AddTaskInline({ date }: { date: string }) {
  return (
    <form action={createTaskAction} className="flex flex-col gap-2">
      <input type="hidden" name="date" value={date} />
      <input
        name="title"
        placeholder="Add task"
        className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm outline-none focus:border-emerald-400"
        required
      />
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          name="keyword"
          placeholder="tag"
          className="h-8 min-w-0 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs outline-none focus:border-emerald-400"
        />
        <Button type="submit" size="icon-sm" title="Tambah task">
          <Plus className="size-4" />
        </Button>
      </div>
    </form>
  );
}
