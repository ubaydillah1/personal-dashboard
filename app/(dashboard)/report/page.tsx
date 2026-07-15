import Link from "next/link";
import type { Metadata } from "next";
import { ReportView } from "@/features/report/components/ReportView";
import { reportService } from "@/features/report/service";

export const metadata: Metadata = {
  title: "Report",
  description: "Review skipped todos and progress patterns.",
};

const filters = [
  { mode: "overall", label: "Overall" },
  { mode: "week", label: "This Week" },
  { mode: "month", label: "This Month" },
];

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const report = await reportService.getReport(params);

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-zinc-50">Report</h1>
        <p className="mt-1 text-sm leading-6 text-zinc-400">See which tasks are skipped most often and when the gaps happen.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.mode}
            href={`/report?mode=${filter.mode}`}
            className="rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            {filter.label}
          </Link>
        ))}
      </div>
      <form className="flex flex-wrap gap-2" action="/report">
        <input type="hidden" name="mode" value="custom" />
        <input
          type="date"
          name="start"
          defaultValue={params.start}
          className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm"
        />
        <input
          type="date"
          name="end"
          defaultValue={params.end}
          className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm"
        />
        <button className="h-9 rounded-md bg-zinc-100 px-3 text-sm font-medium text-zinc-950" type="submit">
          Custom
        </button>
      </form>
      <ReportView {...report} />
    </div>
  );
}
