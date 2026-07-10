import { CopyPlus } from "lucide-react";
import { PendingButton } from "@/components/shared/PendingButton";
import type { Combo } from "@/features/combos/types";
import { addComboToDateAction } from "../actions";

export function AddComboInline({
  date,
  combos,
}: {
  date: string;
  combos: Combo[];
}) {
  if (combos.length === 0) return null;

  return (
    <form action={addComboToDateAction} className="grid grid-cols-[1fr_auto] gap-2">
      <input type="hidden" name="date" value={date} />
      <select
        name="id"
        className="h-8 min-w-0 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs outline-none focus:border-emerald-400"
      >
        {combos.map((combo) => (
          <option key={combo.id} value={combo.id}>
            {combo.name}
          </option>
        ))}
      </select>
      <PendingButton type="submit" size="icon-sm" title="Copy combo to this day">
        <CopyPlus className="size-4" />
      </PendingButton>
    </form>
  );
}
