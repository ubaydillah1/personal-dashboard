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

create or replace function public.increment_blog_view(p_slug text)
returns table (
  blog_id uuid,
  slug text,
  view_count bigint
)
language sql
set search_path = public
as $$
  insert into public.blog_view_counts (blog_id, view_count)
  select blogs.id, 1
  from public.blogs
  where blogs.slug = p_slug
    and blogs.status = 'published'
  on conflict (blog_id) do update
    set view_count = public.blog_view_counts.view_count + 1
  returning public.blog_view_counts.blog_id, p_slug, public.blog_view_counts.view_count;
$$;

revoke all on function public.increment_blog_view(text) from public;
grant execute on function public.increment_blog_view(text) to service_role;

notify pgrst, 'reload schema';
