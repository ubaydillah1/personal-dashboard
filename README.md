# Activity Tracker

Personal daily activity tracker built with Next.js App Router and Supabase.

## Stack

- Next.js App Router
- Supabase Postgres
- Tailwind CSS + shadcn/ui
- Custom daily-password auth with JWT cookies
- Vercel Cron for a daily Supabase keep-alive query

## Environment Variables

Create `.env` from `.env.example`:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
APP_PASSWORD_PREFIX=ubay
CRON_SECRET=
```

`SUPABASE_URL` must be the project base URL, for example:

```env
SUPABASE_URL=https://abcpmbwmelhwlmygmtuj.supabase.co
```

Do not use a Dashboard URL, MCP URL, or a URL ending in `/rest/v1`.

`SUPABASE_SERVICE_ROLE_KEY` is the server-only service role key from Supabase Project Settings. Never expose it in client code or commit it.

`JWT_SECRET` signs the app login token. Use a long random value:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`APP_PASSWORD_PREFIX` is the memorized prefix for the daily login password. The password format is:

```text
<APP_PASSWORD_PREFIX><DD><MM>
```

Example for July 11 with the default prefix:

```text
ubay1107
```

`CRON_SECRET` protects the Vercel cron endpoint. Vercel sends it as:

```text
Authorization: Bearer <CRON_SECRET>
```

Use at least 16 random characters.

## Database

Run the migration before opening the board:

```text
supabase/migrations/20260710201400_create_tracker_tables.sql
supabase/migrations/20260710204500_create_combo_groups.sql
supabase/migrations/20260711000000_create_notes.sql
```

With Supabase CLI:

```powershell
supabase login
supabase link --project-ref abcpmbwmelhwlmygmtuj
supabase db push
```

Without Supabase CLI, paste the migration SQL into the Supabase Dashboard SQL Editor and run it.

## Daily Password

Generate today's login password locally if you want to double-check it:

```powershell
pnpm.cmd today-password
```

## Development

```powershell
pnpm.cmd install
pnpm.cmd dev
```

Open:

```text
http://localhost:3000
```

## Combos

Combos are reusable groups of tasks. A combo can contain multiple task rows, each with its own title, tag, and note. Adding a combo to the board copies those rows into real daily tasks for the selected day.

Deleting a copied task from the board does not delete the combo. The combo is only the source preset.

## Notes

Notes are block-based and autosaved. The MVP supports text, bullet, todo, and link blocks. URL content that starts with `http://` or `https://` is shown as a clickable link.

## Vercel Cron Keep Alive

Vercel Functions are pinned to `sin1` (Singapore) in `vercel.json`.

`vercel.json` schedules one daily request:

```text
/api/cron/keep-alive
```

The route verifies `CRON_SECRET`, then runs a lightweight `head` query against the `tasks` table. This keeps the Supabase project active without changing application data.
