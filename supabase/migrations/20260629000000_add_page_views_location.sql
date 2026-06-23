-- ═══════════════════════════════════════════════════════════
-- Add country & region to page_views for geographic analytics
-- ═══════════════════════════════════════════════════════════

-- Add location columns
alter table public.page_views
  add column if not exists country text not null default 'Unknown',
  add column if not exists region text not null default 'Unknown';

-- Replace the unique index to include location dimensions
drop index if exists idx_page_views_unique;
create unique index if not exists idx_page_views_unique
  on public.page_views (page_type, page_id, view_date, country, region);

-- Speed up location-based queries
create index if not exists idx_page_views_location
  on public.page_views (country, region);

-- Update the increment function to accept location
create or replace function public.increment_page_view(
  p_page_type text,
  p_page_id uuid,
  p_view_date date default current_date,
  p_country text default 'Unknown',
  p_region text default 'Unknown'
)
returns void
language plpgsql
as $$
begin
  insert into public.page_views (page_type, page_id, view_date, count, country, region)
  values (p_page_type, p_page_id, p_view_date, 1, p_country, p_region)
  on conflict (page_type, page_id, view_date, country, region)
  do update set count = page_views.count + 1;
end;
$$;
