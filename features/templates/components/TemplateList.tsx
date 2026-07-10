import { CalendarPlus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/shared/TagInput";
import type { TaskTemplate } from "../types";
import { addComboToWeekAction, deleteTemplateAction, updateTemplateAction } from "../actions";

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

export function TemplateList({
  templates,
  tags,
}: {
  templates: TaskTemplate[];
  tags: string[];
}) {
  if (templates.length === 0) {
    return <p className="rounded-lg border border-zinc-800 p-6 text-sm text-zinc-500">No combos yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {templates.map((template) => (
        <div key={template.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <form action={updateTemplateAction} className="grid gap-3 md:grid-cols-[1fr_180px_auto_auto]">
            <input type="hidden" name="id" value={template.id} />
            <input
              name="title"
              defaultValue={template.title}
              className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm outline-none focus:border-emerald-400"
              required
            />
            <TagInput tags={tags} defaultValue={template.keyword} className={tagInputClassName} showHint={false} />
            <label className="flex h-10 items-center gap-2 text-sm text-zinc-400">
              <input
                name="isActive"
                type="checkbox"
                value="true"
                defaultChecked={template.isActive}
                className="accent-emerald-400"
              />
              Active
            </label>
            <Button type="submit" size="icon-lg" title="Save combo">
              <Save className="size-4" />
            </Button>
            <div className="flex flex-wrap gap-2 md:col-span-4">
              {dayOptions.map((day) => (
                <label key={day.value} className="flex items-center gap-1 text-xs text-zinc-400">
                  <input
                    name="activeDays"
                    type="checkbox"
                    value={day.value}
                    defaultChecked={template.activeDays.includes(day.value)}
                    className="accent-emerald-400"
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={addComboToWeekAction}>
              <input type="hidden" name="id" value={template.id} />
              <Button type="submit" size="sm" variant="outline" className="gap-2">
                <CalendarPlus className="size-4" />
                Add to this week
              </Button>
            </form>
            <form action={deleteTemplateAction}>
              <input type="hidden" name="id" value={template.id} />
              <Button type="submit" size="sm" variant="destructive" className="gap-2">
                <Trash2 className="size-4" />
                Delete combo
              </Button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
