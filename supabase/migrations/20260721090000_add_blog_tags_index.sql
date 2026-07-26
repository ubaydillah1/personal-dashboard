create index if not exists blogs_tags_idx
  on public.blogs using gin(tags);
