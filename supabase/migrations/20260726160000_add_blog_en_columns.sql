-- Add title_en, excerpt_en, and content_en columns
alter table public.blogs
add column if not exists title_en text check (title_en is null or char_length(title_en) between 1 and 220),
add column if not exists excerpt_en text check (excerpt_en is null or char_length(excerpt_en) between 1 and 500),
add column if not exists content_en jsonb not null default '[]'::jsonb check (jsonb_typeof(content_en) = 'array');

-- Notify postgrest to reload the schema cache
notify pgrst, 'reload schema';
