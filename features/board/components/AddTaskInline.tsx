import { Plus } from "lucide-react";
import { TagInput } from "@/components/shared/TagInput";
import { PendingButton } from "@/components/shared/PendingButton";
import { createTaskAction } from "../actions";

const inputClassName =
  "h-8 min-w-0 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs outline-none focus:border-emerald-400";

export function AddTaskInline({ date, tags }: { date: string; tags: string[] }) {
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
        <TagInput tags={tags} className={inputClassName} showHint={false} />
        <PendingButton type="submit" size="icon-sm" title="Add task">
          <Plus className="size-4" />
        </PendingButton>
      </div>
    </form>
  );
}
