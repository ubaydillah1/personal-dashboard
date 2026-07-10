import { createHmac, timingSafeEqual } from "node:crypto";

const PASSWORD_OWNER = "ubay";
const PASSWORD_LENGTH = 8;
const PASSWORD_TIMEZONE = "Asia/Jakarta";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function getPasswordPepper() {
  const pepper = process.env.SECRET_PEPPER;
  if (!pepper) {
    throw new Error("Missing SECRET_PEPPER.");
  }
  return pepper;
}

function base32Encode(bytes: Buffer) {
  let bits = "";
  let encoded = "";

  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, "0");
  }

  for (let index = 0; index < bits.length; index += 5) {
    const chunk = bits.slice(index, index + 5).padEnd(5, "0");
    encoded += BASE32_ALPHABET[Number.parseInt(chunk, 2)];
  }

  return encoded;
}

function getDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PASSWORD_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function generateDailyPassword(date = new Date()) {
  const raw = `${getDateKey(date)}-${PASSWORD_OWNER}`;
  const digest = createHmac("sha256", getPasswordPepper()).update(raw).digest();
  return base32Encode(digest).slice(0, PASSWORD_LENGTH).toLowerCase();
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
