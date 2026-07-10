alter table public.tasks
  add column if not exists position int not null default 0;

create index if not exists tasks_date_position_idx on public.tasks(date, position);

notify pgrst, 'reload schema';
