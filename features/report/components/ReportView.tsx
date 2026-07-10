import type { KeywordSummary } from "../service";

const dayLabels = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

function getHeatClass(summary: KeywordSummary, day: number) {
  const value = summary.byDay[day];
  if (!value || value.total === 0) return "bg-zinc-900";
  const skipRate = value.skipped / value.total;
  if (skipRate >= 0.7) return "bg-red-500";
  if (skipRate >= 0.4) return "bg-amber-500";
  if (skipRate > 0) return "bg-lime-500";
  return "bg-emerald-500";
}

export function ReportView({
  totalTasks,
  completedTasks,
  summaries,
}: {
  totalTasks: number;
  completedTasks: number;
  summaries: KeywordSummary[];
}) {
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500">Total</p>
          <p className="mt-1 text-2xl font-semibold">{totalTasks}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500">Completed</p>
          <p className="mt-1 text-2xl font-semibold">{completedTasks}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500">Completion</p>
          <p className="mt-1 text-2xl font-semibold">{completionRate}%</p>
        </div>
      </div>
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-semibold">Completion rate per keyword</h2>
        <div className="mt-4 grid gap-3">
          {summaries.map((summary) => (
            <div key={summary.keyword} className="grid gap-1">
              <div className="flex items-center justify-between text-sm">
                <span>{summary.keyword}</span>
                <span className="text-zinc-500">
                  {summary.completionRate}% · {summary.skipped} skip
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded bg-zinc-950">
                <div className="h-full bg-emerald-400" style={{ width: `${summary.completionRate}%` }} />
              </div>
            </div>
          ))}
          {summaries.length === 0 ? <p className="text-sm text-zinc-500">No data yet.</p> : null}
        </div>
      </section>
      <section className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-semibold">Skip pattern by day</h2>
        <div className="mt-4 min-w-[620px]">
          <div className="grid grid-cols-[160px_repeat(7,1fr)] gap-2 text-xs text-zinc-500">
            <span>Keyword</span>
            {dayLabels.map((day) => (
              <span key={day.value} className="text-center">
                {day.label}
              </span>
            ))}
          </div>
          <div className="mt-2 grid gap-2">
            {summaries.map((summary) => (
              <div key={summary.keyword} className="grid grid-cols-[160px_repeat(7,1fr)] gap-2">
                <span className="truncate text-sm">{summary.keyword}</span>
                {dayLabels.map((day) => (
                  <span
                    key={day.value}
                    className={`h-8 rounded ${getHeatClass(summary, day.value)}`}
                    title={`${summary.keyword} ${day.label}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
