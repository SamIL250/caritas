-- Community impact campaigns (distinct from donation_campaigns): categories, moderated posts, threaded moderated comments.

create type public.community_campaign_status as enum (
  'draft',
  'pending_review',
  'published',
  'archived'
);

create type public.community_campaign_comment_status as enum (
  'pending',
  'approved',
  'rejected'
);

create table public.community_campaign_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_campaign_categories_slug_unique unique (slug),
  constraint community_campaign_categories_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

create table public.community_campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  excerpt text not null default '',
  body text,
  category_id uuid not null references public.community_campaign_categories (id) on delete restrict,
  featured_image_url text not null default '',
  image_alt text not null default '',
  location_label text not null default '',
  raised_display text not null default '',
  goal_display text not null default '',
  progress_percent int not null default 0,
  donors_count_display text not null default '',
  days_left_display text not null default '',
  primary_action_label text not null default 'Support this campaign',
  primary_action_url text not null default '#donate',
  status public.community_campaign_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_campaigns_slug_unique unique (slug),
  constraint community_campaigns_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint community_campaigns_progress_percent_range check (
    progress_percent >= 0 and progress_percent <= 100
  )
);

create index community_campaigns_status_idx on public.community_campaigns (status);
create index community_campaigns_category_idx on public.community_campaigns (category_id);

create table public.community_campaign_comments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.community_campaigns (id) on delete cascade,
  parent_id uuid references public.community_campaign_comments (id) on delete cascade,
  author_display_name text not null,
  author_email text,
  body text not null,
  status public.community_campaign_comment_status not null default 'pending',
  moderated_at timestamptz,
  moderated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint community_campaign_comments_body_len check (
    char_length(trim(body)) >= 2 and char_length(body) <= 4000
  ),
  constraint community_campaign_comments_author_len check (
    char_length(trim(author_display_name)) >= 1
    and char_length(author_display_name) <= 120
  )
);

create index community_campaign_comments_campaign_idx
  on public.community_campaign_comments (campaign_id);
create index community_campaign_comments_pending_idx
  on public.community_campaign_comments (status)
  where status = 'pending'::public.community_campaign_comment_status;

create or replace function public.community_campaign_categories_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger community_campaign_categories_updated_at
  before update on public.community_campaign_categories
  for each row execute function public.community_campaign_categories_set_updated_at();

create or replace function public.community_campaigns_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger community_campaigns_updated_at
  before update on public.community_campaigns
  for each row execute function public.community_campaigns_set_updated_at();

alter table public.community_campaign_categories enable row level security;
alter table public.community_campaigns enable row level security;
alter table public.community_campaign_comments enable row level security;

-- Categories: readable by everyone; staff maintain.
create policy "community_campaign_categories_select_public"
  on public.community_campaign_categories for select
  using (true);

create policy "community_campaign_categories_staff_all"
  on public.community_campaign_categories for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());

-- Campaigns: only published rows for anonymous/authenticated visitors.
create policy "community_campaigns_select_published"
  on public.community_campaigns for select
  using (status = 'published'::public.community_campaign_status);

create policy "community_campaigns_staff_all"
  on public.community_campaigns for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());

-- Comments: visitors see approved threads on published campaigns only.
create policy "community_campaign_comments_select_public"
  on public.community_campaign_comments for select
  using (
    status = 'approved'::public.community_campaign_comment_status
    and exists (
      select 1 from public.community_campaigns c
      where c.id = campaign_id
        and c.status = 'published'::public.community_campaign_status
    )
  );

create policy "community_campaign_comments_staff_all"
  on public.community_campaign_comments for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());

-- Public may submit pending comments only (no moderation bypass).
create policy "community_campaign_comments_insert_pending"
  on public.community_campaign_comments for insert
  with check (
    status = 'pending'::public.community_campaign_comment_status
    and moderated_at is null
    and moderated_by is null
    and exists (
      select 1 from public.community_campaigns c
      where c.id = campaign_id
        and c.status = 'published'::public.community_campaign_status
    )
    and (
      parent_id is null
      or exists (
        select 1 from public.community_campaign_comments p
        where p.id = parent_id
          and p.campaign_id = campaign_id
          and p.status = 'approved'::public.community_campaign_comment_status
      )
    )
  );

-- Seed categories (id-stable via slug conflict handled by fresh migration).
insert into public.community_campaign_categories (slug, name, sort_order)
values
  ('medical-support', 'Medical Support', 10),
  ('education', 'Education', 20),
  ('livelihood', 'Livelihood', 30)
on conflict (slug) do nothing;

-- Example published campaign (links from homepage CTA when wired to /campaigns/marie-uwimana-care).
insert into public.community_campaigns (
  slug,
  title,
  excerpt,
  body,
  category_id,
  featured_image_url,
  image_alt,
  location_label,
  raised_display,
  goal_display,
  progress_percent,
  donors_count_display,
  days_left_display,
  primary_action_label,
  primary_action_url,
  status,
  published_at
)
select
  'marie-uwimana-care',
  'Marie Uwimana, 68',
  'Medical support for chronic diabetes treatment in Nyaruguru.',
  'Marie raised six children alone after losing her husband in 1994. Today she suffers from chronic diabetes and cannot afford her monthly medication. Your support will cover six months of treatment and ensure Marie can continue to be the pillar of her family.',
  c.id,
  'https://caritasrwanda.org/wp-content/uploads/2026/02/162A7632-scaled.jpg',
  'Portrait representing an older Rwandan woman supported by Caritas programmes',
  'Nyaruguru District, Southern Province',
  'RWF 340,000 raised',
  'Goal: RWF 600,000',
  57,
  '124',
  '14',
  'Donate to Marie''s Care',
  '#donate',
  'published'::public.community_campaign_status,
  now()
from public.community_campaign_categories c
where c.slug = 'medical-support'
on conflict (slug) do nothing;
