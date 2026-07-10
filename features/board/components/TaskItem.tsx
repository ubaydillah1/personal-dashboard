import { Check, Trash2 } from "lucide-react";
import { PendingButton } from "@/components/shared/PendingButton";
import type { Task } from "../types";
import { deleteTaskAction, toggleTaskAction } from "../actions";

export function TaskItem({ task }: { task: Task }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
      <div className="flex items-start gap-2">
        <form action={toggleTaskAction}>
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="isDone" value={String(!task.isDone)} />
          <PendingButton
            type="submit"
            size="icon-sm"
            variant={task.isDone ? "default" : "outline"}
            title={task.isDone ? "Mark as not done" : "Mark as done"}
          >
            <Check className="size-4" />
          </PendingButton>
        </form>
        <div className="min-w-0 flex-1">
          <p className={task.isDone ? "text-sm text-zinc-500 line-through" : "text-sm text-zinc-100"}>
            {task.title}
          </p>
          <div className="mt-2 flex flex-wrap gap-1 text-xs text-zinc-500">
            <span className="rounded bg-zinc-900 px-1.5 py-0.5">{task.keyword}</span>
            {task.note ? <span>{task.note}</span> : null}
          </div>
        </div>
        <form action={deleteTaskAction}>
          <input type="hidden" name="id" value={task.id} />
          <PendingButton type="submit" size="icon-sm" variant="ghost" title="Delete task">
            <Trash2 className="size-4" />
          </PendingButton>
        </form>
      </div>
    </div>
  );
}
