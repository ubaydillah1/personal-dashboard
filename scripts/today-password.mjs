const DEFAULT_PASSWORD_PREFIX = "ubay";
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

function getDateParts(date) {
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

await loadEnv();

const { day, month } = getDateParts(new Date());
const prefix = process.env.APP_PASSWORD_PREFIX?.trim() || DEFAULT_PASSWORD_PREFIX;
console.log(`${prefix}${day}${month}`.toLowerCase());
