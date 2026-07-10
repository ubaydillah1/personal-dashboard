import { timingSafeEqual } from "node:crypto";

const DEFAULT_PASSWORD_PREFIX = "ubay";
const PASSWORD_TIMEZONE = "Asia/Jakarta";

function getPasswordPrefix() {
  return process.env.APP_PASSWORD_PREFIX?.trim() || DEFAULT_PASSWORD_PREFIX;
}

function getDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PASSWORD_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    day: values.day,
    month: values.month,
  };
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function generateDailyPassword(date = new Date()) {
  const { day, month } = getDateParts(date);
  return `${getPasswordPrefix()}${day}${month}`.toLowerCase();
}

export function verifyDailyPassword(input: string) {
  const candidate = Buffer.from(input.trim().toLowerCase());
  const expectedPasswords = [
    generateDailyPassword(new Date()),
    generateDailyPassword(addDays(new Date(), -1)),
  ];

  return expectedPasswords.some((expectedPassword) => {
    const expected = Buffer.from(expectedPassword);
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}
