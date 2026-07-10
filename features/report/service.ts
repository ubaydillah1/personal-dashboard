import { taskRepository } from "@/repositories/task.repository";
import { addDays, startOfWeekMonday, toDateKey } from "@/lib/utils";
import type { Task } from "@/features/board/types";

export type ReportMode = "overall" | "week" | "month" | "custom";

export type KeywordSummary = {
  keyword: string;
  total: number;
  done: number;
  skipped: number;
  completionRate: number;
  byDay: Record<number, { total: number; skipped: number }>;
};

type ReportInput = {
  mode?: string;
  start?: string;
  end?: string;
};

function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: toDateKey(start), end: toDateKey(end) };
}

function getWeekRange(date = new Date()) {
  const start = startOfWeekMonday(date);
  return { start: toDateKey(start), end: toDateKey(addDays(start, 6)) };
}

function getTasksForMode(input: ReportInput) {
  const mode = (input.mode ?? "week") as ReportMode;

  if (mode === "overall") return taskRepository.findAll();

  const range =
    mode === "month"
      ? getMonthRange()
      : mode === "custom" && input.start && input.end
        ? { start: input.start, end: input.end }
        : getWeekRange();

  return taskRepository.findByDateRange(range.start, range.end);
}

function buildSummary(tasks: Task[]) {
  const map = new Map<string, KeywordSummary>();

  for (const task of tasks) {
    const current =
      map.get(task.keyword) ??
      ({
        keyword: task.keyword,
        total: 0,
        done: 0,
        skipped: 0,
        completionRate: 0,
        byDay: {},
      } satisfies KeywordSummary);

    const day = new Date(`${task.date}T00:00:00`).getDay();
    current.total += 1;
    current.done += task.isDone ? 1 : 0;
    current.skipped += task.isDone ? 0 : 1;
    current.byDay[day] = current.byDay[day] ?? { total: 0, skipped: 0 };
    current.byDay[day].total += 1;
    current.byDay[day].skipped += task.isDone ? 0 : 1;
    current.completionRate = Math.round((current.done / current.total) * 100);
    map.set(task.keyword, current);
  }

  return [...map.values()].sort((left, right) => left.completionRate - right.completionRate);
}

export const reportService = {
  async getReport(input: ReportInput) {
    const tasks = await getTasksForMode(input);
    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((task) => task.isDone).length,
      summaries: buildSummary(tasks),
    };
  },
};
