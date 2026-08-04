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

drop function if exists public.increment_blog_view(text);

revoke all on function public.increment_blog_view(text, text) from public;
grant execute on function public.increment_blog_view(text, text) to service_role;

notify pgrst, 'reload schema';
