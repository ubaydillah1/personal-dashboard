import { CopyPlus } from "lucide-react";
import { PendingButton } from "@/components/shared/PendingButton";
import { copyDayTasksAction } from "../actions";

export function CopyPreviousDayButton({
  from,
  to,
}: {
  from: string;
  to: string;
}) {
  return (
    <form action={copyDayTasksAction}>
      <input type="hidden" name="from" value={from} />
      <input type="hidden" name="to" value={to} />
      <PendingButton
        type="submit"
        variant="outline"
        size="sm"
        className="h-8 w-full justify-start gap-2 border-zinc-800 bg-zinc-950 text-xs text-zinc-300 hover:bg-zinc-900"
        pendingLabel="Copying..."
      >
        <CopyPlus className="size-3.5" />
        Copy previous day
      </PendingButton>
    </form>
  );
}
