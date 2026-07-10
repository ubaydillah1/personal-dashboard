import { createHmac } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const PASSWORD_OWNER = "ubay";
const PASSWORD_LENGTH = 8;
const PASSWORD_TIMEZONE = "Asia/Jakarta";

async function loadEnv() {
  const envFile = await import("node:fs").then((fs) => fs.readFileSync(".env", "utf8"));
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
    }
  }
}

function base32Encode(bytes) {
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

function getDateKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PASSWORD_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

await loadEnv();

if (!process.env.SECRET_PEPPER) {
  throw new Error("Missing SECRET_PEPPER in .env");
}

const raw = `${getDateKey(new Date())}-${PASSWORD_OWNER}`;
const digest = createHmac("sha256", process.env.SECRET_PEPPER).update(raw).digest();
console.log(base32Encode(digest).slice(0, PASSWORD_LENGTH).toLowerCase());
