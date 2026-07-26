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

notify pgrst, 'reload schema';
