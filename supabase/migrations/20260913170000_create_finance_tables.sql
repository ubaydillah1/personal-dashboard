create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  type text not null check (type in ('expense', 'income', 'both')),
  icon text not null default 'Tag',
  color text not null default '#3b82f6',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  type text not null check (type in ('expense', 'income')),
  amount numeric(15, 2) not null check (amount > 0),
  date date not null default current_date,
  category_id uuid references public.finance_categories(id) on delete set null,
  category_name text not null default 'Lainnya',
  payment_method text not null default 'Cash',
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists finance_transactions_date_idx on public.finance_transactions(date desc);
create index if not exists finance_transactions_type_idx on public.finance_transactions(type);
create index if not exists finance_transactions_category_idx on public.finance_transactions(category_id);
create index if not exists finance_transactions_title_idx on public.finance_transactions(title);

drop trigger if exists set_finance_transactions_updated_at on public.finance_transactions;
create trigger set_finance_transactions_updated_at
before update on public.finance_transactions
for each row
execute function public.set_updated_at();

alter table public.finance_categories enable row level security;
alter table public.finance_transactions enable row level security;

revoke all on public.finance_categories from anon, authenticated;
revoke all on public.finance_transactions from anon, authenticated;

-- Seed default categories if empty
insert into public.finance_categories (name, type, icon, color, is_default)
values
  ('Makanan & Minuman', 'expense', 'UtensilsCrossed', '#f97316', true),
  ('Transportasi', 'expense', 'Car', '#3b82f6', true),
  ('Belanja', 'expense', 'ShoppingBag', '#ec4899', true),
  ('Tagihan & Utilitas', 'expense', 'Receipt', '#eab308', true),
  ('Hiburan & Rekreasi', 'expense', 'Film', '#a855f7', true),
  ('Kesehatan', 'expense', 'HeartPulse', '#ef4444', true),
  ('Pendidikan & Kerja', 'expense', 'GraduationCap', '#06b6d4', true),
  ('Pengeluaran Lainnya', 'expense', 'HelpCircle', '#71717a', true),
  ('Gaji Pokok', 'income', 'Banknote', '#10b981', true),
  ('Freelance & Side Job', 'income', 'Laptop', '#14b8a6', true),
  ('Investasi & Dividen', 'income', 'TrendingUp', '#8b5cf6', true),
  ('Bonus & Hadiah', 'income', 'Gift', '#f59e0b', true),
  ('Pemasukan Lainnya', 'income', 'Coins', '#10b981', true)
on conflict do nothing;

notify pgrst, 'reload schema';
