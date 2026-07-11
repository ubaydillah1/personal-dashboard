create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.note_blocks (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  type text not null check (type in ('bullet', 'text', 'todo', 'link')),
  content text not null default '' check (char_length(content) <= 5000),
  position int not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists note_blocks_note_position_idx on public.note_blocks(note_id, position);
create index if not exists notes_updated_at_idx on public.notes(updated_at desc);

drop trigger if exists set_notes_updated_at on public.notes;
create trigger set_notes_updated_at
before update on public.notes
for each row
execute function public.set_updated_at();

drop trigger if exists set_note_blocks_updated_at on public.note_blocks;
create trigger set_note_blocks_updated_at
before update on public.note_blocks
for each row
execute function public.set_updated_at();

alter table public.notes enable row level security;
alter table public.note_blocks enable row level security;

revoke all on public.notes from anon, authenticated;
revoke all on public.note_blocks from anon, authenticated;

notify pgrst, 'reload schema';
