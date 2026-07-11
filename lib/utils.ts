import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function toAppDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const nextDate = new Date(`${dateKey}T00:00:00.000Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function compareDateKeys(left: string, right: string) {
  return left.localeCompare(right);
}

export function getDateKeyRange(start: string, end: string) {
  const dates: string[] = [];
  let cursor = start;

  while (compareDateKeys(cursor, end) <= 0) {
    dates.push(cursor);
    cursor = addDaysToDateKey(cursor, 1);
  }

  return dates;
}

export function startOfWeekMondayDateKey(dateKey: string) {
  const day = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDaysToDateKey(dateKey, diff);
}

export function getWeekDateKeyRange(dateKey: string) {
  const start = startOfWeekMondayDateKey(dateKey);
  return {
    from: start,
    to: addDaysToDateKey(start, 6),
  };
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function startOfWeekMonday(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function formatDayLabel(dateKey: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${dateKey}T00:00:00.000Z`));
}
