-- Events: staff-managed schedule shown in the public floating events panel.
-- Staff CRUD via dashboard; public read of published rows.

create type public.event_status as enum ('draft', 'published', 'cancelled');

create table public.events (
  id uuid primary key default gen_random_uuid(),
  status public.event_status not null default 'draft'::public.event_status,
  title text not null,
  slug text not null,
  summary text not null default '',
  description_html text,
  location_label text not null default '',
  location_address text not null default '',
  location_url text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  is_all_day boolean not null default false,
  timezone text not null default 'Africa/Kigali',
  category_label text not null default '',
  featured_image_url text not null default '',
  image_alt text not null default '',
  gallery_images jsonb not null default '[]'::jsonb,
  registration_url text not null default '',
  capacity_label text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  featured boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_title_len check (char_length(trim(title)) between 2 and 200),
  constraint events_slug_len check (char_length(slug) between 2 and 200),
  constraint events_summary_len check (char_length(summary) <= 1000),
  constraint events_description_len check (description_html is null or char_length(description_html) <= 60000),
  constraint events_dates_order check (ends_at is null or ends_at >= starts_at)
);

create unique index events_slug_unique on public.events (slug);
create index events_status_starts_idx on public.events (status, starts_at);
create index events_featured_published_idx on public.events (featured, status, starts_at) where featured;

create or replace function public.events_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_updated_at
  before update on public.events
  for each row execute function public.events_set_updated_at();

alter table public.events enable row level security;

-- Public can read published events only.
create policy "events_public_read_published"
  on public.events
  for select
  to anon, authenticated
  using (status = 'published'::public.event_status);

-- Staff: full read + write.
create policy "events_staff_all"
  on public.events
  for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());
