-- Publications: dynamic categories with custom field schemas
-- ----------------------------------------------------------
-- 1) Convert publications.category from enum to text
-- 2) Create publication_categories table + seed built-ins
-- 3) Add category_id FK + custom_fields jsonb on publications
-- 4) Trigger keeps `category` slug in sync with category_id

------------------------------------------------------------
-- 1) Migrate the enum column to text
------------------------------------------------------------
alter table public.publications add column category_text text;
update public.publications set category_text = category::text;
alter table public.publications drop column category;
alter table public.publications rename column category_text to category;
alter table public.publications alter column category set not null;
drop type if exists public.publication_category;

------------------------------------------------------------
-- 2) Categories table (system + custom) with field schemas
------------------------------------------------------------
create type public.publication_category_kind as enum ('pdf', 'story', 'external', 'hybrid');

create table public.publication_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  plural_label text not null default '',
  description text not null default '',
  icon text not null default 'fa-solid fa-file-lines',
  accent text not null default '#7A1515',
  kind public.publication_category_kind not null default 'pdf',
  behavior jsonb not null default '{}'::jsonb,
  field_schema jsonb not null default '[]'::jsonb,
  is_system boolean not null default false,
  sort_order int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint publication_categories_slug_format check (slug ~ '^[a-z][a-z0-9_]*$')
);

create index publication_categories_sort_idx
  on public.publication_categories (sort_order, label);

create or replace function public.publication_categories_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger publication_categories_updated_at
  before update on public.publication_categories
  for each row execute function public.publication_categories_set_updated_at();

alter table public.publication_categories enable row level security;

create policy "publication_categories_select_all"
  on public.publication_categories
  for select
  using (true);

create policy "publication_categories_staff_all"
  on public.publication_categories
  for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());

-- Seed built-in categories. Slugs match the previous enum values so existing rows
-- in `publications.category` line up immediately during the join below.
insert into public.publication_categories
  (slug, label, plural_label, description, icon, accent, kind, behavior, field_schema, is_system, sort_order)
values
  (
    'strategic_plan',
    'Strategic Plan',
    'Strategic Plan',
    'Long-term strategic frameworks. Mark one as featured to anchor the top of /publications.',
    'fa-solid fa-map',
    '#0d1b2a',
    'pdf'::public.publication_category_kind,
    jsonb_build_object('site_anchor', 'strategic', 'single_featured', true),
    '[]'::jsonb,
    true,
    5
  ),
  (
    'annual_report',
    'Annual Report',
    'Annual Reports',
    'Year-end PDF reports — one entry per year.',
    'fa-solid fa-chart-bar',
    '#7A1515',
    'pdf'::public.publication_category_kind,
    jsonb_build_object('site_anchor', 'annual-reports'),
    '[]'::jsonb,
    true,
    10
  ),
  (
    'newsletter',
    'Newsletter',
    'Newsletters',
    'Quarterly PDF newsletters. Treated like news entries on the dashboard.',
    'fa-solid fa-newspaper',
    '#a5280d',
    'pdf'::public.publication_category_kind,
    jsonb_build_object('site_anchor', 'newsletters', 'news_like', true),
    '[]'::jsonb,
    true,
    20
  ),
  (
    'success_story',
    'Success Story',
    'Success Stories',
    'Beneficiary stories with rich body content and a tag badge.',
    'fa-solid fa-star',
    '#b45309',
    'story'::public.publication_category_kind,
    jsonb_build_object('site_anchor', 'success-stories'),
    '[]'::jsonb,
    true,
    30
  ),
  (
    'recent_update',
    'Recent Update',
    'Recent Updates',
    'External article links and short updates.',
    'fa-solid fa-rss',
    '#155e75',
    'external'::public.publication_category_kind,
    jsonb_build_object('site_anchor', 'latest-news'),
    '[]'::jsonb,
    true,
    40
  );

------------------------------------------------------------
-- 3) Wire publications.category_id + custom_fields
------------------------------------------------------------
alter table public.publications add column category_id uuid;

update public.publications p
set category_id = c.id
from public.publication_categories c
where c.slug = p.category;

alter table public.publications alter column category_id set not null;
alter table public.publications
  add constraint publications_category_id_fk
  foreign key (category_id) references public.publication_categories(id) on delete restrict;

create index publications_category_id_status_idx
  on public.publications (category_id, status);

alter table public.publications
  add column custom_fields jsonb not null default '{}'::jsonb;

------------------------------------------------------------
-- 4) Keep `publications.category` slug in sync with FK
------------------------------------------------------------
create or replace function public.publications_sync_category_slug()
returns trigger as $$
declare
  resolved text;
begin
  if new.category_id is null then
    raise exception 'publications.category_id required';
  end if;
  if (tg_op = 'INSERT')
     or (new.category_id is distinct from old.category_id)
     or (new.category is null) then
    select c.slug into resolved from public.publication_categories c where c.id = new.category_id;
    if resolved is null then
      raise exception 'unknown publication_categories row %', new.category_id;
    end if;
    new.category := resolved;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger publications_sync_category
  before insert or update on public.publications
  for each row execute function public.publications_sync_category_slug();
