-- 1. Point any transactions referencing duplicate categories to the primary category (earliest created or lowest id)
with ranked_categories as (
  select id, name, type,
         row_number() over (partition by lower(trim(name)), type order by created_at asc, id asc) as rn,
         first_value(id) over (partition by lower(trim(name)), type order by created_at asc, id asc) as primary_id
  from public.finance_categories
)
update public.finance_transactions ft
set category_id = rc.primary_id
from ranked_categories rc
where ft.category_id = rc.id and rc.rn > 1;

-- 2. Delete duplicate category rows
with ranked_categories as (
  select id,
         row_number() over (partition by lower(trim(name)), type order by created_at asc, id asc) as rn
  from public.finance_categories
)
delete from public.finance_categories
where id in (
  select id from ranked_categories where rn > 1
);

-- 3. Add unique index to prevent future duplicate categories with same name and type
create unique index if not exists finance_categories_name_type_uidx
on public.finance_categories (lower(trim(name)), type);

notify pgrst, 'reload schema';
