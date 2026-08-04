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
  position int not null default 0,
  note text check (note is null or char_length(note) <= 500),
  template_id uuid references public.task_templates(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_date_idx on public.tasks(date);
create index if not exists tasks_date_position_idx on public.tasks(date, position);
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

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(slug) between 1 and 180
  ),
  title text not null check (char_length(title) between 1 and 220),
  excerpt text not null check (char_length(excerpt) between 1 and 500),
  cover_image text check (cover_image is null or char_length(cover_image) <= 1000),
  status text not null default 'draft' check (status in ('draft', 'published')),
  tags text[] not null default '{}',
  reading_time text not null default '1 min read' check (char_length(reading_time) between 1 and 40),
  content jsonb not null default '[]'::jsonb check (jsonb_typeof(content) = 'array'),
  title_en text check (title_en is null or char_length(title_en) between 1 and 220),
  excerpt_en text check (excerpt_en is null or char_length(excerpt_en) between 1 and 500),
  content_en jsonb not null default '[]'::jsonb check (jsonb_typeof(content_en) = 'array'),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blogs_published_at_required check (
    status <> 'published' or published_at is not null
  )
);

create index if not exists blogs_status_published_at_idx
  on public.blogs(status, published_at desc, id desc);

create index if not exists blogs_tags_idx
  on public.blogs using gin(tags);

drop trigger if exists set_blogs_updated_at on public.blogs;
create trigger set_blogs_updated_at
before update on public.blogs
for each row
execute function public.set_updated_at();

alter table public.blogs enable row level security;

revoke all on public.blogs from anon, authenticated;

create table if not exists public.blog_view_counts (
  blog_id uuid primary key references public.blogs(id) on delete cascade,
  view_count bigint not null default 0 check (view_count >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists blog_view_counts_view_count_idx
  on public.blog_view_counts(view_count desc);

drop trigger if exists set_blog_view_counts_updated_at on public.blog_view_counts;
create trigger set_blog_view_counts_updated_at
before update on public.blog_view_counts
for each row
execute function public.set_updated_at();

alter table public.blog_view_counts enable row level security;

revoke all on public.blog_view_counts from anon, authenticated;

create table if not exists public.blog_views (
  id uuid primary key default gen_random_uuid(),
  blog_id uuid not null references public.blogs(id) on delete cascade,
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  first_viewed_at timestamptz not null default now()
);

create unique index if not exists blog_views_blog_visitor_idx
  on public.blog_views(blog_id, visitor_hash);

create index if not exists blog_views_blog_id_idx
  on public.blog_views(blog_id);

alter table public.blog_views enable row level security;

revoke all on public.blog_views from anon, authenticated;

create or replace function public.increment_blog_view(p_slug text, p_visitor_key text)
returns table (
  blog_id uuid,
  slug text,
  view_count bigint,
  counted boolean
)
language plpgsql
set search_path = public
as $$
declare
  target_blog_id uuid;
  inserted_count int;
begin
  select blogs.id
  into target_blog_id
  from public.blogs
  where blogs.slug = p_slug
    and blogs.status = 'published';

  if target_blog_id is null then
    return;
  end if;

  insert into public.blog_views (blog_id, visitor_hash)
  values (target_blog_id, encode(digest(p_visitor_key, 'sha256'), 'hex'))
  on conflict (blog_id, visitor_hash) do nothing;

  get diagnostics inserted_count = row_count;

  if inserted_count > 0 then
    insert into public.blog_view_counts (blog_id, view_count)
    values (target_blog_id, 1)
    on conflict (blog_id) do update
      set view_count = public.blog_view_counts.view_count + 1;
  end if;

  return query
  select
    target_blog_id,
    p_slug,
    coalesce(public.blog_view_counts.view_count, 0),
    inserted_count > 0
  from public.blog_view_counts
  where public.blog_view_counts.blog_id = target_blog_id;
end;
$$;

revoke all on function public.increment_blog_view(text, text) from public;
grant execute on function public.increment_blog_view(text, text) to service_role;

notify pgrst, 'reload schema';
