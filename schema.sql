-- ============================================================
--  Caritas Rwanda CMS — Supabase PostgreSQL Schema
--  Run this in: Supabase Dashboard > SQL Editor
--  Order: extensions → types → tables → indexes →
--         triggers → functions → RLS policies
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- for full-text search on slugs/titles


-- ============================================================
-- 1. CUSTOM TYPES (enums)
-- ============================================================

create type user_role       as enum ('admin', 'editor');
create type page_status     as enum ('draft', 'published', 'archived');
create type donation_status as enum ('pending', 'succeeded', 'failed', 'refunded');
create type audit_action    as enum ('insert', 'update', 'delete');


-- ============================================================
-- 2. TABLES
-- ============================================================

-- ----------------------------------------------------------
-- 2.1  profiles
--      Extends auth.users. Populated via trigger on signup.
-- ----------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text        not null unique,
  full_name    text,
  role         user_role   not null default 'editor',
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is
  'One row per authenticated user. Mirrors auth.users with extra CMS fields.';


-- ----------------------------------------------------------
-- 2.2  pages
-- ----------------------------------------------------------
create table public.pages (
  id             uuid        primary key default uuid_generate_v4(),
  title          text        not null,
  slug           text        not null unique,
  status         page_status not null default 'draft',
  -- meta holds SEO: { seo_title, seo_description, og_image, keywords[] }
  meta           jsonb       not null default '{}',
  created_by     uuid        references public.profiles (id) on delete set null,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on column public.pages.meta is
  'SEO & social metadata. Shape: { seo_title, seo_description, og_image, keywords }';


-- ----------------------------------------------------------
-- 2.3  sections
--      Ordered content blocks that compose a page.
--      The "type" field drives which React component renders.
-- ----------------------------------------------------------
create table public.sections (
  id          uuid        primary key default uuid_generate_v4(),
  page_id     uuid        not null references public.pages (id) on delete cascade,
  type        text        not null,
  -- content shape varies by type — see comment below
  content     jsonb       not null default '{}',
  "order"     integer     not null default 0,
  visible     boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.sections.type is
  'Known values: text_block | image_grid | testimonial | cta | gallery | embed | divider';
comment on column public.sections.content is
  'Shape by type:
   text_block  → { heading, body, alignment }
   image_grid  → { images: [{ url, caption, alt }], columns }
   testimonial → { quote, author, role, avatar_url }
   cta         → { heading, body, button_text, button_url, bg_color }
   gallery     → { media_ids: uuid[], caption }
   embed       → { html, caption }
   divider     → { style }';


-- ----------------------------------------------------------
-- 2.4  hero_content
--      One-to-one with pages. Separate table because the
--      dashboard gives heroes their own dedicated editor.
-- ----------------------------------------------------------
create table public.hero_content (
  id           uuid        primary key default uuid_generate_v4(),
  page_id      uuid        not null unique references public.pages (id) on delete cascade,
  heading      text,
  subheading   text,
  cta_text     text,
  cta_url      text,
  image_url    text,
  -- extra flexible fields (overlay color, text color, etc.)
  options      jsonb       not null default '{}',
  updated_at   timestamptz not null default now()
);

comment on column public.hero_content.options is
  'Extra display options. Shape: { text_color, overlay_opacity, align }';


-- ----------------------------------------------------------
-- 2.5  nav_links
--      Self-referential for one level of nested dropdowns.
-- ----------------------------------------------------------
create table public.nav_links (
  id          uuid        primary key default uuid_generate_v4(),
  label       text        not null,
  url         text        not null,
  "order"     integer     not null default 0,
  parent_id   uuid        references public.nav_links (id) on delete cascade,
  visible     boolean     not null default true,
  open_in_new boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.nav_links.parent_id is
  'NULL = top-level link. Non-null = child of a dropdown parent.';


-- ----------------------------------------------------------
-- 2.6  media
--      Tracks every file uploaded to Supabase Storage.
-- ----------------------------------------------------------
create table public.media (
  id            uuid        primary key default uuid_generate_v4(),
  filename      text        not null,
  storage_path  text        not null unique,   -- internal bucket path
  url           text        not null,          -- public CDN URL
  size_bytes    bigint,
  mime_type     text,
  alt_text      text,
  uploaded_by   uuid        references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);


-- ----------------------------------------------------------
-- 2.7  slide_items
--      Maps media items into the homepage carousel.
--      Keeping this separate lets the same image exist in
--      the library without automatically being a slide.
-- ----------------------------------------------------------
create table public.slide_items (
  id          uuid        primary key default uuid_generate_v4(),
  media_id    uuid        not null references public.media (id) on delete cascade,
  "order"     integer     not null default 0,
  visible     boolean     not null default true,
  caption     text,
  link_url    text,
  updated_at  timestamptz not null default now()
);


-- ----------------------------------------------------------
-- 2.8  donation_campaigns
--      Configuration for each fundraising campaign.
-- ----------------------------------------------------------
create table public.donation_campaigns (
  id              uuid        primary key default uuid_generate_v4(),
  name            text        not null,
  description     text,
  active          boolean     not null default true,
  -- e.g. [500, 1000, 5000, 10000] in RWF
  preset_amounts  jsonb       not null default '[1000, 5000, 10000, 50000]',
  goal_amount     bigint,                     -- optional fundraising target (RWF)
  currency        text        not null default 'RWF',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ----------------------------------------------------------
-- 2.9  donations
--      Append-only. Written by the Stripe webhook handler.
--      Never edited after insert.
-- ----------------------------------------------------------
create table public.donations (
  id                        uuid            primary key default uuid_generate_v4(),
  stripe_payment_intent_id  text            unique,
  amount                    bigint          not null,   -- in smallest currency unit
  currency                  text            not null default 'RWF',
  donor_email               text,                       -- may be null (anonymous)
  donor_name                text,
  status                    donation_status not null default 'pending',
  campaign_id               uuid            references public.donation_campaigns (id) on delete set null,
  stripe_metadata           jsonb           not null default '{}',
  created_at                timestamptz     not null default now()
);

comment on column public.donations.stripe_metadata is
  'Raw Stripe PaymentIntent metadata for auditing. Never expose to the public.';


-- ----------------------------------------------------------
-- 2.10 page_revisions
--      Full snapshot of a page (+ its sections) every time
--      it is published. Enables rollback without event sourcing.
-- ----------------------------------------------------------
create table public.page_revisions (
  id          uuid        primary key default uuid_generate_v4(),
  page_id     uuid        not null references public.pages (id) on delete cascade,
  -- snapshot contains the page row + sections array at publish time
  snapshot    jsonb       not null,
  label       text,                           -- optional human label e.g. "Christmas 2025"
  created_by  uuid        references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

comment on column public.page_revisions.snapshot is
  'Shape: { page: { ...page row }, sections: [ ...section rows ] }';


-- ----------------------------------------------------------
-- 2.11 audit_logs
--      Records every write action across the CMS.
-- ----------------------------------------------------------
create table public.audit_logs (
  id          uuid         primary key default uuid_generate_v4(),
  actor_id    uuid         references public.profiles (id) on delete set null,
  action      audit_action not null,
  table_name  text         not null,
  record_id   uuid,
  -- diff holds { before: {}, after: {} } for updates
  diff        jsonb        not null default '{}',
  created_at  timestamptz  not null default now()
);

comment on table public.audit_logs is
  'Append-only log. Never update or delete rows from this table.';


-- ----------------------------------------------------------
-- 2.12 site_settings
--      Single-row table for global site configuration.
-- ----------------------------------------------------------
create table public.site_settings (
  id            integer     primary key default 1,          -- enforces single row
  site_name     text        not null default 'Caritas Rwanda',
  tagline       text,
  contact_email text,
  logo_url      text,
  favicon_url   text,
  -- social links, analytics IDs, etc.
  options       jsonb       not null default '{}',
  updated_at    timestamptz not null default now(),
  updated_by    uuid        references public.profiles (id) on delete set null,
  -- prevent a second row ever being inserted
  constraint single_row check (id = 1)
);

comment on table public.site_settings is
  'Global site configuration. Always exactly one row (id = 1).';

-- Seed the single row immediately
insert into public.site_settings (id) values (1)
  on conflict (id) do nothing;


-- ============================================================
-- 3. INDEXES
-- ============================================================

-- Pages
create index idx_pages_slug       on public.pages (slug);
create index idx_pages_status     on public.pages (status);
create index idx_pages_created_by on public.pages (created_by);

-- Full-text search on page titles
create index idx_pages_title_trgm on public.pages using gin (title gin_trgm_ops);

-- Sections
create index idx_sections_page_id on public.sections (page_id);
create index idx_sections_order   on public.sections (page_id, "order");
create index idx_sections_type    on public.sections (type);

-- Hero content
create index idx_hero_page_id on public.hero_content (page_id);

-- Nav links
create index idx_nav_order     on public.nav_links ("order");
create index idx_nav_parent_id on public.nav_links (parent_id);

-- Media
create index idx_media_uploaded_by on public.media (uploaded_by);
create index idx_media_mime        on public.media (mime_type);
create index idx_media_filename_trgm on public.media using gin (filename gin_trgm_ops);

-- Slide items
create index idx_slides_order on public.slide_items ("order");

-- Donations
create index idx_donations_campaign on public.donations (campaign_id);
create index idx_donations_status   on public.donations (status);
create index idx_donations_created  on public.donations (created_at desc);

-- Page revisions
create index idx_revisions_page_id  on public.page_revisions (page_id);
create index idx_revisions_created  on public.page_revisions (created_at desc);

-- Audit logs
create index idx_audit_actor      on public.audit_logs (actor_id);
create index idx_audit_table      on public.audit_logs (table_name);
create index idx_audit_record     on public.audit_logs (record_id);
create index idx_audit_created    on public.audit_logs (created_at desc);


-- ============================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================

-- ----------------------------------------------------------
-- 4.1  Auto-update updated_at on any row change
-- ----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_pages_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

create trigger trg_sections_updated_at
  before update on public.sections
  for each row execute function public.set_updated_at();

create trigger trg_hero_updated_at
  before update on public.hero_content
  for each row execute function public.set_updated_at();

create trigger trg_nav_updated_at
  before update on public.nav_links
  for each row execute function public.set_updated_at();

create trigger trg_slide_updated_at
  before update on public.slide_items
  for each row execute function public.set_updated_at();

create trigger trg_campaigns_updated_at
  before update on public.donation_campaigns
  for each row execute function public.set_updated_at();

create trigger trg_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();


-- ----------------------------------------------------------
-- 4.2  Auto-create a profile row when a new user signs up
--      in Supabase Auth. Runs as a trigger on auth.users.
-- ----------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ----------------------------------------------------------
-- 4.3  Auto-set pages.published_at when status → published
-- ----------------------------------------------------------
create or replace function public.handle_page_publish()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' and old.status <> 'published' then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger trg_page_publish
  before update on public.pages
  for each row execute function public.handle_page_publish();


-- ----------------------------------------------------------
-- 4.4  Snapshot a page + its sections on publish
--      Creates a page_revision row automatically.
-- ----------------------------------------------------------
create or replace function public.snapshot_page_on_publish()
returns trigger language plpgsql security definer as $$
declare
  v_sections jsonb;
begin
  if new.status = 'published' and old.status <> 'published' then
    select jsonb_agg(s order by s."order")
    into v_sections
    from public.sections s
    where s.page_id = new.id;

    insert into public.page_revisions (page_id, snapshot, created_by)
    values (
      new.id,
      jsonb_build_object(
        'page',     to_jsonb(new),
        'sections', coalesce(v_sections, '[]'::jsonb)
      ),
      new.created_by
    );
  end if;
  return new;
end;
$$;

create trigger trg_snapshot_on_publish
  after update on public.pages
  for each row execute function public.snapshot_page_on_publish();


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on every table
alter table public.profiles           enable row level security;
alter table public.pages              enable row level security;
alter table public.sections           enable row level security;
alter table public.hero_content       enable row level security;
alter table public.nav_links          enable row level security;
alter table public.media              enable row level security;
alter table public.slide_items        enable row level security;
alter table public.donation_campaigns enable row level security;
alter table public.donations          enable row level security;
alter table public.page_revisions     enable row level security;
alter table public.audit_logs         enable row level security;
alter table public.site_settings      enable row level security;


-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: is the current user authenticated (admin or editor)?
create or replace function public.is_authenticated_staff()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;


-- ----------------------------------------------------------
-- profiles
-- ----------------------------------------------------------
-- Public: no access
-- Editor: read & update own row only
-- Admin:  full access

create policy "profiles: staff can read all"
  on public.profiles for select
  using (public.is_authenticated_staff());

create policy "profiles: editor can update own"
  on public.profiles for update
  using (auth.uid() = id and not public.is_admin())
  with check (auth.uid() = id);

create policy "profiles: admin full access"
  on public.profiles for all
  using (public.is_admin());


-- ----------------------------------------------------------
-- pages
-- ----------------------------------------------------------
-- Public (anon): read published pages only
-- Editor/Admin: read all; insert/update; admin can delete

create policy "pages: public read published"
  on public.pages for select
  to anon
  using (status = 'published');

create policy "pages: staff read all"
  on public.pages for select
  using (public.is_authenticated_staff());

create policy "pages: staff insert"
  on public.pages for insert
  with check (public.is_authenticated_staff());

create policy "pages: staff update"
  on public.pages for update
  using (public.is_authenticated_staff());

create policy "pages: admin delete"
  on public.pages for delete
  using (public.is_admin());


-- ----------------------------------------------------------
-- sections
-- ----------------------------------------------------------
create policy "sections: public read visible on published pages"
  on public.sections for select
  to anon
  using (
    visible = true
    and exists (
      select 1 from public.pages p
      where p.id = page_id and p.status = 'published'
    )
  );

create policy "sections: staff read all"
  on public.sections for select
  using (public.is_authenticated_staff());

create policy "sections: staff insert"
  on public.sections for insert
  with check (public.is_authenticated_staff());

create policy "sections: staff update"
  on public.sections for update
  using (public.is_authenticated_staff());

create policy "sections: admin delete"
  on public.sections for delete
  using (public.is_admin());


-- ----------------------------------------------------------
-- hero_content
-- ----------------------------------------------------------
create policy "hero: public read on published pages"
  on public.hero_content for select
  to anon
  using (
    exists (
      select 1 from public.pages p
      where p.id = page_id and p.status = 'published'
    )
  );

create policy "hero: staff read all"
  on public.hero_content for select
  using (public.is_authenticated_staff());

create policy "hero: staff insert & update"
  on public.hero_content for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());


-- ----------------------------------------------------------
-- nav_links
-- ----------------------------------------------------------
create policy "nav: public read visible"
  on public.nav_links for select
  to anon
  using (visible = true);

create policy "nav: staff read all"
  on public.nav_links for select
  using (public.is_authenticated_staff());

create policy "nav: staff write"
  on public.nav_links for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());


-- ----------------------------------------------------------
-- media
-- ----------------------------------------------------------
create policy "media: public read all"
  on public.media for select
  to anon
  using (true);

create policy "media: staff insert"
  on public.media for insert
  with check (public.is_authenticated_staff());

create policy "media: uploader or admin can update"
  on public.media for update
  using (auth.uid() = uploaded_by or public.is_admin());

create policy "media: admin delete"
  on public.media for delete
  using (public.is_admin());


-- ----------------------------------------------------------
-- slide_items
-- ----------------------------------------------------------
create policy "slides: public read visible"
  on public.slide_items for select
  to anon
  using (visible = true);

create policy "slides: staff read all"
  on public.slide_items for select
  using (public.is_authenticated_staff());

create policy "slides: staff write"
  on public.slide_items for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());


-- ----------------------------------------------------------
-- donation_campaigns
-- ----------------------------------------------------------
create policy "campaigns: public read active"
  on public.donation_campaigns for select
  to anon
  using (active = true);

create policy "campaigns: staff read all"
  on public.donation_campaigns for select
  using (public.is_authenticated_staff());

create policy "campaigns: admin write"
  on public.donation_campaigns for all
  using (public.is_admin())
  with check (public.is_admin());


-- ----------------------------------------------------------
-- donations  (sensitive — admin read only; webhook insert via service role)
-- ----------------------------------------------------------
create policy "donations: admin read"
  on public.donations for select
  using (public.is_admin());

-- Inserts come from your Stripe webhook using the service_role key,
-- which bypasses RLS entirely — no insert policy needed here.


-- ----------------------------------------------------------
-- page_revisions
-- ----------------------------------------------------------
create policy "revisions: staff read"
  on public.page_revisions for select
  using (public.is_authenticated_staff());

create policy "revisions: admin delete"
  on public.page_revisions for delete
  using (public.is_admin());

-- Inserts are handled by the snapshot trigger (security definer).


-- ----------------------------------------------------------
-- audit_logs  (append-only — no update or delete policies)
-- ----------------------------------------------------------
create policy "audit: admin read"
  on public.audit_logs for select
  using (public.is_admin());

-- Inserts should come from your server-side code using service_role.


-- ----------------------------------------------------------
-- site_settings
-- ----------------------------------------------------------
create policy "settings: public read"
  on public.site_settings for select
  to anon
  using (true);

create policy "settings: staff read"
  on public.site_settings for select
  using (public.is_authenticated_staff());

create policy "settings: admin update"
  on public.site_settings for update
  using (public.is_admin())
  with check (public.is_admin());


-- ============================================================
-- END OF SCHEMA
-- ============================================================