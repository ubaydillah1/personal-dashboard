create table if not exists public.combos (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  active_days int[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint combos_active_days_valid check (
    active_days <@ array[0, 1, 2, 3, 4, 5, 6]
  )
);

create table if not exists public.combo_tasks (
  id uuid primary key default gen_random_uuid(),
  combo_id uuid not null references public.combos(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  keyword text not null check (char_length(keyword) between 1 and 80),
  note text check (note is null or char_length(note) <= 500),
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.tasks
  add column if not exists combo_id uuid references public.combos(id) on delete set null,
  add column if not exists combo_task_id uuid references public.combo_tasks(id) on delete set null;

create index if not exists combo_tasks_combo_id_idx on public.combo_tasks(combo_id);
create index if not exists tasks_combo_date_idx on public.tasks(combo_id, date)
  where combo_id is not null;

alter table public.combos enable row level security;
alter table public.combo_tasks enable row level security;

revoke all on public.combos from anon, authenticated;
revoke all on public.combo_tasks from anon, authenticated;

notify pgrst, 'reload schema';
