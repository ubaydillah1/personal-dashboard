import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/shared/TagInput";
import { createTemplateAction } from "../actions";

const dayOptions = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const tagInputClassName =
  "h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm outline-none focus:border-emerald-400";

export function TemplateForm({ tags }: { tags: string[] }) {
  return (
    <form action={createTemplateAction} className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-[1fr_180px_auto]">
      <input
        name="title"
        placeholder="Combo task"
        className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm outline-none focus:border-emerald-400"
        required
      />
      <TagInput tags={tags} className={tagInputClassName} showHint={false} />
      <Button type="submit" className="h-10 gap-2">
        <Plus className="size-4" />
        Add
      </Button>
      <div className="flex flex-wrap gap-2 md:col-span-3">
        {dayOptions.map((day) => (
          <label key={day.value} className="flex items-center gap-1 text-xs text-zinc-400">
            <input name="activeDays" type="checkbox" value={day.value} className="accent-emerald-400" />
            {day.label}
          </label>
        ))}
        <span className="text-xs text-zinc-600">Used when applying this combo to the whole week. Leave empty for every day.</span>
      </div>
    </form>
  );
}
