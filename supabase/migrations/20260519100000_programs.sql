-- Programs CMS
-- ---------------------------------------------------------------
-- Activity articles ("programs") grouped under editor-managed
-- "program categories". Built-ins cover the four canonical pillars
-- (Social Welfare, Health, Development, Finance & Administration).
-- Articles are rich-text body + cover image + optional read-more
-- link, mirroring the news article shape so editors feel at home.

create type public.program_status as enum ('draft', 'published');

create table public.program_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  plural_label text not null default '',
  description text not null default '',
  icon text not null default 'fa-solid fa-folder',
  accent text not null default '#7A1515',
  cover_image_url text not null default '',
  is_system boolean not null default false,
  sort_order int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint program_categories_slug_format check (slug ~ '^[a-z][a-z0-9_-]*$')
);

create index program_categories_sort_idx
  on public.program_categories (sort_order, label);

create or replace function public.program_categories_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger program_categories_updated_at
  before update on public.program_categories
  for each row execute function public.program_categories_set_updated_at();

alter table public.program_categories enable row level security;

create policy "program_categories_select_all"
  on public.program_categories
  for select
  using (true);

create policy "program_categories_staff_all"
  on public.program_categories
  for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());

------------------------------------------------------------
-- Built-in pillar categories
------------------------------------------------------------
insert into public.program_categories
  (slug, label, plural_label, description, icon, accent, is_system, sort_order)
values
  (
    'social-welfare',
    'Social Welfare',
    'Social Welfare',
    'Community mobilization, social protection and humanitarian response.',
    'fa-solid fa-people-roof',
    '#a5280d',
    true,
    10
  ),
  (
    'health',
    'Health',
    'Health',
    'Healthcare services, ECD, nutrition and community health outreach.',
    'fa-solid fa-heart-pulse',
    '#b91c1c',
    true,
    20
  ),
  (
    'development',
    'Development',
    'Development',
    'Sustainable livelihoods, agriculture, vocational training and economic empowerment.',
    'fa-solid fa-seedling',
    '#15803d',
    true,
    30
  ),
  (
    'finance-administration',
    'Finance & Administration',
    'Finance & Administration',
    'Governance, financial stewardship and operational accountability.',
    'fa-solid fa-building-columns',
    '#0d1b2a',
    true,
    40
  );

------------------------------------------------------------
-- Programs (articles)
------------------------------------------------------------
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.program_categories(id) on delete restrict,
  category text not null, -- slug snapshot, kept in sync via trigger
  title text not null,
  slug text not null,
  excerpt text not null default '',
  body text,
  cover_image_url text not null default '',
  cover_image_alt text not null default '',
  external_url text not null default '',
  tag_label text not null default '',
  tag_icon text not null default '',
  featured boolean not null default false,
  status public.program_status not null default 'draft',
  published_at timestamptz,
  sort_order int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint programs_slug_unique unique (slug)
);

create index programs_category_id_status_idx on public.programs (category_id, status);
create index programs_status_sort_idx on public.programs (status, sort_order, published_at desc nulls last);

create or replace function public.programs_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger programs_updated_at
  before update on public.programs
  for each row execute function public.programs_set_updated_at();

create or replace function public.programs_sync_category_slug()
returns trigger as $$
declare
  resolved text;
begin
  if new.category_id is null then
    raise exception 'programs.category_id required';
  end if;
  if (tg_op = 'INSERT')
     or (new.category_id is distinct from old.category_id)
     or (new.category is null) then
    select c.slug into resolved from public.program_categories c where c.id = new.category_id;
    if resolved is null then
      raise exception 'unknown program_categories row %', new.category_id;
    end if;
    new.category := resolved;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger programs_sync_category
  before insert or update on public.programs
  for each row execute function public.programs_sync_category_slug();

alter table public.programs enable row level security;

create policy "programs_select_published"
  on public.programs
  for select
  using (status = 'published'::public.program_status);

create policy "programs_staff_all"
  on public.programs
  for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());

------------------------------------------------------------
-- /programs CMS page (page chrome + section anchor)
------------------------------------------------------------
insert into public.pages (title, slug, status, meta)
select
  'Programs',
  'programs',
  'published'::public.page_status,
  jsonb_build_object(
    'seo_title',
    'Programs — Caritas Rwanda',
    'seo_description',
    'Activities and stories from Caritas Rwanda program areas: Social Welfare, Health, Development and Finance & Administration.'
  )
where not exists (select 1 from public.pages p where p.slug = 'programs');

update public.pages
set
  title = 'Programs',
  status = 'published'::public.page_status,
  meta = jsonb_build_object(
    'seo_title',
    'Programs — Caritas Rwanda',
    'seo_description',
    'Activities and stories from Caritas Rwanda program areas: Social Welfare, Health, Development and Finance & Administration.'
  ),
  updated_at = now()
where slug = 'programs';

insert into public.hero_content (
  page_id,
  heading,
  subheading,
  cta_text,
  cta_url,
  image_url,
  options
)
select
  p.id,
  'Programs that',
  'Activities, projects and stories of impact across Caritas Rwanda''s four pillars: social welfare, health, development and governance.',
  '',
  '',
  '',
  jsonb_strip_nulls(jsonb_build_object(
    'align', 'center',
    'overlay_opacity', 0.55,
    'text_color', '#ffffff',
    'badge_text', 'What we do',
    'heading_accent', 'transform lives'
  ))
from public.pages p
where p.slug = 'programs'
  and not exists (select 1 from public.hero_content h where h.page_id = p.id);
