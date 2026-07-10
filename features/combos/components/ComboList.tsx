import { Trash2 } from "lucide-react";
import { PendingButton } from "@/components/shared/PendingButton";
import type { Combo } from "../types";
import { deleteComboAction } from "../actions";
import { AddComboToDayForm } from "./AddComboToDayForm";

export function ComboList({ combos }: { combos: Combo[] }) {
  if (combos.length === 0) {
    return <p className="rounded-lg border border-zinc-800 p-6 text-sm text-zinc-500">No combos yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {combos.map((combo) => (
        <section key={combo.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-50">{combo.name}</h2>
              <p className="mt-1 text-xs text-zinc-500">{combo.tasks.length} tasks</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AddComboToDayForm comboId={combo.id} />
              <form action={deleteComboAction}>
                <input type="hidden" name="id" value={combo.id} />
                <PendingButton type="submit" size="sm" variant="destructive" className="gap-2" pendingLabel="Deleting...">
                  <Trash2 className="size-4" />
                  Delete
                </PendingButton>
              </form>
            </div>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {combo.tasks.map((task) => (
              <div key={task.id} className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
                <p className="text-sm font-medium text-zinc-100">{task.title}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span className="rounded bg-zinc-900 px-1.5 py-0.5">{task.keyword}</span>
                  {task.note ? <span>{task.note}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
