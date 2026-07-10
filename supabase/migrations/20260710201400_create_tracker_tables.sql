create extension if not exists "pgcrypto";

create table if not exists public.task_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  keyword text not null check (char_length(keyword) between 1 and 80),
  active_days int[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint task_templates_active_days_valid check (
    active_days <@ array[0, 1, 2, 3, 4, 5, 6]
  )
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  keyword text not null check (char_length(keyword) between 1 and 80),
  date date not null,
  is_done boolean not null default false,
  note text check (note is null or char_length(note) <= 500),
  template_id uuid references public.task_templates(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_date_idx on public.tasks(date);
create index if not exists tasks_keyword_idx on public.tasks(keyword);
create unique index if not exists tasks_template_date_idx
  on public.tasks(template_id, date)
  where template_id is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.task_templates enable row level security;

revoke all on public.tasks from anon, authenticated;
revoke all on public.task_templates from anon, authenticated;

notify pgrst, 'reload schema';
