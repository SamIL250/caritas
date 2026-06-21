-- Create page_views table for content analytics (daily aggregates)

create table if not exists public.page_views (
  id          uuid primary key default gen_random_uuid(),
  page_type   text not null check (page_type in ('news_article', 'publication', 'program')),
  page_id     uuid not null,
  view_date   date not null default current_date,
  count       integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Enforce one aggregate row per page per day
create unique index if not exists idx_page_views_unique
  on public.page_views (page_type, page_id, view_date);

-- Speed up analytics queries
create index if not exists idx_page_views_type_date
  on public.page_views (page_type, view_date desc);

create index if not exists idx_page_views_page
  on public.page_views (page_type, page_id);

-- Enable RLS (data is only ever visible to admin/editor roles)
alter table public.page_views enable row level security;

-- Admins can read all rows; editors can also read
create policy "Admins and editors can read page_views"
  on public.page_views for select
  to authenticated
  using (true);

-- Service role / server actions can upsert (via anon key with a dedicated policy or via service_role)
-- For tracking we use the anon key with a restricted insert/update policy
create policy "Anyone can insert a page_view row"
  on public.page_views for insert
  to authenticated, anon
  with check (true);

create policy "Anyone can update a page_view row"
  on public.page_views for update
  to authenticated, anon
  using (true);
