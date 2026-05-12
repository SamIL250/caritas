-- ============================================================
--  Caritas Rwanda CMS — PostgreSQL Schema v3
--
--  SAFE TO RUN alongside your existing Supabase auth setup.
--
--  What this file does NOT touch:
--  - public.profiles table (do not create or alter it)
--  - auth.users trigger (handle_new_user)
--  - user_role enum (assumed to already exist in your DB)
--  - Any RLS policies on profiles
--  - trg_profiles_updated_at trigger
--
--  What it assumes about your existing profiles table:
--  - Has a column `id` uuid (FK to auth.users)
--  - Has a column `role` that can be compared to 'admin'
--    and 'editor' (text or enum — both work with the
--    is_admin() and is_authenticated_staff() helpers below)
--
--  If your role column uses different values, update the
--  two helper functions in Section 6 accordingly.
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";


-- ============================================================
-- 1. CUSTOM TYPES
--
--  Skipped: user_role (assumed to exist already)
--  Created: the rest
-- ============================================================

do $$ begin
  create type page_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type donation_status as enum ('pending', 'succeeded', 'failed', 'refunded');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type audit_action as enum ('insert', 'update', 'delete');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type section_type as enum (
    'hero',
    'text_block',
    'image_grid',
    'testimonial',
    'cta',
    'partners',
    'news_cards',
    'contact_info',
    'gallery',
    'divider',
    'program_cards',
    'map_section'
  );
exception when duplicate_object then null;
end $$;


-- ============================================================
-- 2. TABLES
--
--  All tables use `if not exists` so re-running this file
--  is safe and will not error on an existing database.
-- ============================================================

-- ----------------------------------------------------------
-- 2.1  pages
-- ----------------------------------------------------------
-- Safety: Add columns if table already exists
do $$ begin
  alter table public.pages add column if not exists meta jsonb not null default '{}';
  alter table public.pages add column if not exists published_at timestamptz;
exception when others then null;
end $$;

create table if not exists public.pages (
  id           uuid        primary key default uuid_generate_v4(),
  title        text        not null,
  slug         text        not null unique,
  status       page_status not null default 'draft',
  meta         jsonb       not null default '{}',
  created_by   uuid        references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on column public.pages.meta is
  'SEO metadata. Shape: { seo_title, seo_description, og_image, keywords[] }';


-- ----------------------------------------------------------
-- 2.2  sections
-- ----------------------------------------------------------
-- Safety: Add columns or convert types if table already exists
do $$ begin
  -- Add missing columns
  alter table public.sections add column if not exists name text not null default '';
  alter table public.sections add column if not exists section_key text;
  
  -- Convert type column to enum if it's currently text
  if (select data_type from information_schema.columns 
      where table_schema = 'public' and table_name = 'sections' and column_name = 'type') = 'text' then
    alter table public.sections alter column type type section_type using type::section_type;
  end if;
exception when others then null;
end $$;

create table if not exists public.sections (
  id           uuid         primary key default uuid_generate_v4(),
  page_id      uuid         not null references public.pages (id) on delete cascade,
  name         text         not null default '',
  type         section_type not null,
  content      jsonb        not null default '{}',
  "order"      integer      not null default 0,
  visible      boolean      not null default true,
  section_key  text,
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now(),

  unique (page_id, section_key)
);

comment on column public.sections.name is
  'Human-readable label shown in the dashboard section list.';

comment on column public.sections.section_key is
  'Stable key for idempotent seed upserts. Unique per page.';

comment on column public.sections.content is
  'Jsonb shape varies by type:
   text_block   → { heading, body, alignment }
   image_grid   → { images: [{ url, alt, caption }], columns }
   testimonial  → { quote, author, role, avatar_url }
   cta          → { heading, body, button_text, button_url, bg_color }
   partners     → { items: [{ logo_url, name, website_url }] }
   news_cards   → { eyebrow, heading, heading_highlight, subtitle, view_all_url, view_all_label, articles: [{ image_url, title, excerpt, date, tag, link_url, open_in_new }] }
   contact_info → { eyebrow, heading_line1, heading_line2, subtext, headquarters_label, headquarters, phone_label, phone, email_label, email, hours_label, office_hours, form_title, form_subtitle }
   gallery      → { media_ids: uuid[], caption }
   divider      → { style: "solid" | "dashed" | "dotted" }
   hero         → {} (placeholder only — real data in hero_content)';


-- ----------------------------------------------------------
-- 2.3  hero_content
-- ----------------------------------------------------------
-- Safety: Add columns if table already exists
do $$ begin
  alter table public.hero_content add column if not exists cta_text text not null default '';
  alter table public.hero_content add column if not exists cta_url text not null default '';
  alter table public.hero_content add column if not exists image_url text not null default '';
  alter table public.hero_content add column if not exists options jsonb not null default '{"text_color": "#ffffff", "overlay_opacity": 0.4, "align": "left"}';
exception when others then null;
end $$;

create table if not exists public.hero_content (
  id          uuid        primary key default uuid_generate_v4(),
  page_id     uuid        not null unique references public.pages (id) on delete cascade,
  heading     text        not null default '',
  subheading  text        not null default '',
  cta_text    text        not null default '',
  cta_url     text        not null default '',
  image_url   text        not null default '',
  options     jsonb       not null default '{
    "text_color": "#ffffff",
    "overlay_opacity": 0.4,
    "align": "left"
  }',
  updated_at  timestamptz not null default now()
);

comment on column public.hero_content.options is
  'Form-controlled display options.
   Shape: { text_color: string, overlay_opacity: number, align: string }';


-- ----------------------------------------------------------
-- 2.4  nav_links
-- ----------------------------------------------------------
create table if not exists public.nav_links (
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


-- ----------------------------------------------------------
-- 2.5  media
-- ----------------------------------------------------------
create table if not exists public.media (
  id            uuid        primary key default uuid_generate_v4(),
  filename      text        not null,
  storage_path  text        not null unique,
  url           text        not null,
  size_bytes    bigint,
  mime_type     text,
  alt_text      text        not null default '',
  uploaded_by   uuid        references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);


-- ----------------------------------------------------------
-- 2.6  slide_items
-- ----------------------------------------------------------
-- Safety: Add columns if table already exists
do $$ begin
  alter table public.slide_items add column if not exists image_url text;
  alter table public.slide_items alter column media_id drop not null;
  alter table public.slide_items add column if not exists heading text not null default '';
  alter table public.slide_items add column if not exists subheading text not null default '';
  alter table public.slide_items add column if not exists cta_text text;
  alter table public.slide_items add column if not exists cta_url text;
  alter table public.slide_items add column if not exists badge_text text;
exception when others then null;
end $$;

create table if not exists public.slide_items (
  id          uuid        primary key default uuid_generate_v4(),
  page_id     uuid        not null references public.pages (id) on delete cascade,
  image_url   text        not null,
  heading     text        not null default '',
  subheading  text        not null default '',
  cta_text    text,
  cta_url     text,
  badge_text  text,
  "order"     integer     not null default 0,
  visible     boolean     not null default true,
  updated_at  timestamptz not null default now()
);

create index if not exists idx_slides_page_id on public.slide_items (page_id);


-- ----------------------------------------------------------
-- 2.7  donation_campaigns
-- ----------------------------------------------------------
create table if not exists public.donation_campaigns (
  id             uuid        primary key default uuid_generate_v4(),
  name           text        not null,
  description    text,
  active         boolean     not null default true,
  preset_amounts jsonb       not null default '[1000, 5000, 10000, 50000]',
  goal_amount    bigint,
  currency       text        not null default 'RWF',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);


-- ----------------------------------------------------------
-- 2.8  donations
-- ----------------------------------------------------------
create table if not exists public.donations (
  id                       uuid            primary key default uuid_generate_v4(),
  stripe_payment_intent_id text            unique,
  amount                   bigint          not null,
  currency                 text            not null default 'RWF',
  donor_email              text,
  donor_name               text,
  status                   donation_status not null default 'pending',
  campaign_id              uuid            references public.donation_campaigns (id) on delete set null,
  stripe_metadata          jsonb           not null default '{}',
  created_at               timestamptz     not null default now()
);


-- ----------------------------------------------------------
-- 2.9  page_revisions
-- ----------------------------------------------------------
create table if not exists public.page_revisions (
  id         uuid        primary key default uuid_generate_v4(),
  page_id    uuid        not null references public.pages (id) on delete cascade,
  snapshot   jsonb       not null,
  label      text,
  created_by uuid        references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on column public.page_revisions.snapshot is
  'Shape: { page: {...}, hero_content: {...} | null, sections: [...] }';


-- ----------------------------------------------------------
-- 2.10  audit_logs
-- ----------------------------------------------------------
create table if not exists public.audit_logs (
  id         uuid         primary key default uuid_generate_v4(),
  actor_id   uuid         references public.profiles (id) on delete set null,
  action     audit_action not null,
  table_name text         not null,
  record_id  uuid,
  diff       jsonb        not null default '{}',
  created_at timestamptz  not null default now()
);


-- ----------------------------------------------------------
-- 2.11  site_settings  (single-row)
-- ----------------------------------------------------------
create table if not exists public.site_settings (
  id            integer     primary key default 1,
  site_name     text        not null default 'Caritas Rwanda',
  tagline       text,
  contact_email text,
  logo_url      text,
  favicon_url   text,
  options       jsonb       not null default '{}',
  updated_at    timestamptz not null default now(),
  updated_by    uuid        references public.profiles (id) on delete set null,
  constraint single_row check (id = 1)
);

insert into public.site_settings (id)
  values (1)
  on conflict (id) do nothing;


-- ----------------------------------------------------------
-- 2.12  section_templates
-- ----------------------------------------------------------
-- Safety: Convert type column if table already exists
do $$ begin
  if (select data_type from information_schema.columns 
      where table_schema = 'public' and table_name = 'section_templates' and column_name = 'type') = 'text' then
    alter table public.section_templates alter column type type section_type using type::section_type;
  end if;
exception when others then null;
end $$;

create table if not exists public.section_templates (
  type            section_type primary key,
  label           text         not null,
  description     text         not null,
  default_content jsonb        not null default '{}',
  icon            text         not null default 'Layers'
);

comment on table public.section_templates is
  'Default content, label, and icon per section type.
   Read by the Add Section modal. Managed by migrations only.';

insert into public.section_templates (type, label, description, icon, default_content) values
  ('text_block',   'Text block',       'A heading and body text with alignment options.',    'AlignLeft',   '{"heading":"New section heading","body":"Add your content here.","alignment":"left"}'),
  ('image_grid',   'Image grid',       'A grid of images with captions.',                   'LayoutGrid',  '{"images":[],"columns":3}'),
  ('testimonial',  'Testimonial',      'A quote with author name and role.',                 'Quote',       '{"quote":"","author":"","role":"","avatar_url":""}'),
  ('cta',          'Call to action',   'Be part of the change: eyebrow, two-line title, two buttons, optional impact stats. Solid colors.', 'Megaphone',   '{"eyebrow":"Make a Difference","heading":"Be Part of","heading_accent":"the Change","body":"","button_text":"Donate Now","button_url":"#donate","secondary_text":"Volunteer with Us","secondary_url":"#","bg_color":"#f0f2f5","stats":[]}'),
  ('partners',     'Partners',         'Our Partners grid: eyebrow, title, subtitle, logo cards (name, URL, link).', 'Handshake',   '{"eyebrow":"Collaboration","title":"Our Partners","subtitle":"","items":[]}'),
  ('news_cards',   'News & stories',   'Magazine layout: section copy plus stories (image, title, excerpt, date, tag, link).', 'Newspaper',   '{"eyebrow":"","heading":"News &","heading_highlight":"Stories","subtitle":"","view_all_url":"/news","view_all_label":"View All News & Stories","articles":[]}'),
  ('contact_info', 'Contact info',     'Let\'s Talk: intro, four info rows, message form (mailto).', 'MapPin',      '{"eyebrow":"Get In Touch","heading_line1":"Let''s Talk &","heading_line2":"Work Together","subtext":"","headquarters_label":"Headquarters","headquarters":"Kigali, Rwanda","phone_label":"Phone","phone":"","email_label":"Email","email":"","hours_label":"Office Hours","office_hours":"","form_title":"Send Us a Message","form_subtitle":""}'),
  ('gallery',      'Gallery',          'A collection of images with an optional caption.',  'Images',      '{"media_ids":[],"caption":""}'),
  ('divider',      'Divider',          'A horizontal rule to separate sections.',           'Minus',       '{"style":"solid"}'),
  ('program_cards', 'Our Programs',   'Homepage program pillars: heading, copy, and four program items.', 'LayoutTemplate', '{"eyebrow":"What We Do","heading":"Our Programs","subtitle":"Making a difference through targeted, community-focused initiatives","programs":[]}'),
  ('map_section',  'Our Location',    'Two Google Maps embeds (street view + HQ) with copy.', 'MapPin', '{"eyebrow":"Find Us","heading":"Our Location on","heading_accent":"G-Map","subtext":"","map_a_title":"Street View","map_a_subtitle":"","map_a_embed_url":"","map_b_title":"Caritas Rwanda HQ","map_b_subtitle":"","map_b_embed_url":""}')
on conflict (type) do update set
  label           = excluded.label,
  description     = excluded.description,
  icon            = excluded.icon,
  default_content = excluded.default_content;


-- ============================================================
-- 3. INDEXES
-- ============================================================

create index if not exists idx_pages_slug           on public.pages (slug);
create index if not exists idx_pages_status         on public.pages (status);
create index if not exists idx_pages_created_by     on public.pages (created_by);
create index if not exists idx_pages_title_trgm     on public.pages using gin (title gin_trgm_ops);

create index if not exists idx_sections_page_id     on public.sections (page_id);
create index if not exists idx_sections_order       on public.sections (page_id, "order");
create index if not exists idx_sections_type        on public.sections (type);
create index if not exists idx_sections_section_key on public.sections (page_id, section_key)
  where section_key is not null;

create index if not exists idx_hero_page_id         on public.hero_content (page_id);

create index if not exists idx_nav_order            on public.nav_links ("order");
create index if not exists idx_nav_parent_id        on public.nav_links (parent_id);

create index if not exists idx_media_uploaded_by    on public.media (uploaded_by);
create index if not exists idx_media_mime           on public.media (mime_type);
create index if not exists idx_media_created        on public.media (created_at desc);
create index if not exists idx_media_filename_trgm  on public.media using gin (filename gin_trgm_ops);

create index if not exists idx_slides_order         on public.slide_items ("order");

create index if not exists idx_donations_campaign   on public.donations (campaign_id);
create index if not exists idx_donations_status     on public.donations (status);
create index if not exists idx_donations_created    on public.donations (created_at desc);

create index if not exists idx_revisions_page_id    on public.page_revisions (page_id);
create index if not exists idx_revisions_created    on public.page_revisions (created_at desc);

create index if not exists idx_audit_actor          on public.audit_logs (actor_id);
create index if not exists idx_audit_table          on public.audit_logs (table_name);
create index if not exists idx_audit_record         on public.audit_logs (record_id);
create index if not exists idx_audit_created        on public.audit_logs (created_at desc);


-- ============================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================

-- ----------------------------------------------------------
-- 4.1  Auto-update updated_at
--      Only created on tables this file owns.
--      Does NOT touch profiles.
-- ----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pages_updated_at         on public.pages;
drop trigger if exists trg_sections_updated_at      on public.sections;
drop trigger if exists trg_hero_updated_at          on public.hero_content;
drop trigger if exists trg_nav_updated_at           on public.nav_links;
drop trigger if exists trg_slide_updated_at         on public.slide_items;
drop trigger if exists trg_campaigns_updated_at     on public.donation_campaigns;
drop trigger if exists trg_settings_updated_at      on public.site_settings;

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
-- 4.2  Auto-set published_at when a page goes live
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

drop trigger if exists trg_page_publish on public.pages;
create trigger trg_page_publish
  before update on public.pages
  for each row execute function public.handle_page_publish();


-- ----------------------------------------------------------
-- 4.3  Snapshot page + hero + sections on publish
-- ----------------------------------------------------------
create or replace function public.snapshot_page_on_publish()
returns trigger language plpgsql security definer as $$
declare
  v_sections     jsonb;
  v_hero_content jsonb;
begin
  if new.status = 'published' and old.status <> 'published' then

    select jsonb_agg(s order by s."order")
    into v_sections
    from public.sections s
    where s.page_id = new.id;

    select to_jsonb(h)
    into v_hero_content
    from public.hero_content h
    where h.page_id = new.id;

    insert into public.page_revisions (page_id, snapshot, created_by)
    values (
      new.id,
      jsonb_build_object(
        'page',         to_jsonb(new),
        'hero_content', v_hero_content,
        'sections',     coalesce(v_sections, '[]'::jsonb)
      ),
      new.created_by
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_snapshot_on_publish on public.pages;
create trigger trg_snapshot_on_publish
  after update on public.pages
  for each row execute function public.snapshot_page_on_publish();


-- ----------------------------------------------------------
-- 4.4  Auto-set section name from template on insert
-- ----------------------------------------------------------
create or replace function public.set_section_name_default()
returns trigger language plpgsql as $$
begin
  if new.name = '' or new.name is null then
    select label into new.name
    from public.section_templates
    where type = new.type;

    if new.name is null then
      new.name = new.type::text;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_section_name_default on public.sections;
create trigger trg_section_name_default
  before insert on public.sections
  for each row execute function public.set_section_name_default();


-- ============================================================
-- 5. HELPER VIEWS
-- ============================================================

create or replace view public.sections_with_meta as
  select
    s.id,
    s.page_id,
    s.name,
    s.type,
    s.content,
    s."order",
    s.visible,
    s.section_key,
    s.created_at,
    s.updated_at,
    t.label       as type_label,
    t.description as type_description,
    t.icon        as type_icon
  from public.sections s
  left join public.section_templates t on t.type::text = s.type::text;

create or replace view public.pages_summary as
  select
    p.id,
    p.title,
    p.slug,
    p.status,
    p.meta,
    p.created_by,
    p.published_at,
    p.created_at,
    p.updated_at,
    count(s.id) filter (where s.visible = true) as visible_section_count,
    count(s.id)                                  as total_section_count
  from public.pages p
  left join public.sections s on s.page_id = p.id
  group by p.id;


-- ============================================================
-- 6. ROW LEVEL SECURITY
--
--  profiles RLS is NOT touched here — your existing policies
--  remain in place exactly as you set them up.
--
--  The two helper functions (is_admin, is_authenticated_staff)
--  read from profiles.role. Update the role values below if
--  your existing setup uses different role names.
-- ============================================================

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
alter table public.section_templates  enable row level security;


-- Helper functions
-- NOTE: These read profiles.role. If your role column uses
-- different values (e.g. 'superadmin' instead of 'admin'),
-- update the strings below to match.
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role::text = 'admin'
  );
$$;

create or replace function public.is_authenticated_staff()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role::text in ('admin', 'editor')
  );
$$;


-- pages
drop policy if exists "pages: public read published" on public.pages;
drop policy if exists "pages: staff read all"        on public.pages;
drop policy if exists "pages: staff insert"          on public.pages;
drop policy if exists "pages: staff update"          on public.pages;
drop policy if exists "pages: admin delete"          on public.pages;

create policy "pages: public read published"
  on public.pages for select to anon
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


-- sections
drop policy if exists "sections: public read visible on published pages" on public.sections;
drop policy if exists "sections: staff read all"                         on public.sections;
drop policy if exists "sections: staff insert"                           on public.sections;
drop policy if exists "sections: staff update"                           on public.sections;
drop policy if exists "sections: admin delete"                           on public.sections;

create policy "sections: public read visible on published pages"
  on public.sections for select to anon
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


-- hero_content
drop policy if exists "hero: public read on published pages" on public.hero_content;
drop policy if exists "hero: staff read all"                 on public.hero_content;
drop policy if exists "hero: staff write"                    on public.hero_content;

create policy "hero: public read on published pages"
  on public.hero_content for select to anon
  using (
    exists (
      select 1 from public.pages p
      where p.id = page_id and p.status = 'published'
    )
  );

create policy "hero: staff read all"
  on public.hero_content for select
  using (public.is_authenticated_staff());

create policy "hero: staff write"
  on public.hero_content for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());


-- nav_links
drop policy if exists "nav: public read visible" on public.nav_links;
drop policy if exists "nav: staff read all"      on public.nav_links;
drop policy if exists "nav: staff write"         on public.nav_links;

create policy "nav: public read visible"
  on public.nav_links for select to anon
  using (visible = true);

create policy "nav: staff read all"
  on public.nav_links for select
  using (public.is_authenticated_staff());

create policy "nav: staff write"
  on public.nav_links for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());


-- media
drop policy if exists "media: public read"              on public.media;
drop policy if exists "media: staff insert"             on public.media;
drop policy if exists "media: uploader or admin update" on public.media;
drop policy if exists "media: admin delete"             on public.media;

create policy "media: public read"
  on public.media for select to anon
  using (true);

create policy "media: staff insert"
  on public.media for insert
  with check (public.is_authenticated_staff());

create policy "media: uploader or admin update"
  on public.media for update
  using (auth.uid() = uploaded_by or public.is_admin());

create policy "media: admin delete"
  on public.media for delete
  using (public.is_admin());


-- slide_items
drop policy if exists "slides: public read visible" on public.slide_items;
drop policy if exists "slides: staff read all"      on public.slide_items;
drop policy if exists "slides: staff write"         on public.slide_items;

create policy "slides: public read visible"
  on public.slide_items for select to anon
  using (visible = true);

create policy "slides: staff read all"
  on public.slide_items for select
  using (public.is_authenticated_staff());

create policy "slides: staff write"
  on public.slide_items for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());


-- donation_campaigns
drop policy if exists "campaigns: public read active" on public.donation_campaigns;
drop policy if exists "campaigns: staff read all"     on public.donation_campaigns;
drop policy if exists "campaigns: admin write"        on public.donation_campaigns;

create policy "campaigns: public read active"
  on public.donation_campaigns for select to anon
  using (active = true);

create policy "campaigns: staff read all"
  on public.donation_campaigns for select
  using (public.is_authenticated_staff());

create policy "campaigns: admin write"
  on public.donation_campaigns for all
  using (public.is_admin())
  with check (public.is_admin());


-- donations
drop policy if exists "donations: admin read" on public.donations;

create policy "donations: admin read"
  on public.donations for select
  using (public.is_admin());


-- page_revisions
drop policy if exists "revisions: staff read"  on public.page_revisions;
drop policy if exists "revisions: admin delete" on public.page_revisions;

create policy "revisions: staff read"
  on public.page_revisions for select
  using (public.is_authenticated_staff());

create policy "revisions: admin delete"
  on public.page_revisions for delete
  using (public.is_admin());


-- audit_logs
drop policy if exists "audit: admin read" on public.audit_logs;

create policy "audit: admin read"
  on public.audit_logs for select
  using (public.is_admin());


-- site_settings
drop policy if exists "settings: public read"  on public.site_settings;
drop policy if exists "settings: staff read"   on public.site_settings;
drop policy if exists "settings: admin update" on public.site_settings;

create policy "settings: public read"
  on public.site_settings for select to anon
  using (true);

create policy "settings: staff read"
  on public.site_settings for select
  using (public.is_authenticated_staff());

create policy "settings: admin update"
  on public.site_settings for update
  using (public.is_admin())
  with check (public.is_admin());


-- section_templates
drop policy if exists "templates: public read" on public.section_templates;
drop policy if exists "templates: staff read"  on public.section_templates;

create policy "templates: public read"
  on public.section_templates for select to anon
  using (true);

create policy "templates: staff read"
  on public.section_templates for select
  using (public.is_authenticated_staff());


-- ============================================================
-- 7. SEED — homepage page + hero_content placeholder
--
--  Creates the homepage row if it doesn't exist yet.
--  Safe to run repeatedly — uses on conflict do nothing.
-- ============================================================

with inserted_page as (
  insert into public.pages (title, slug, status)
  values ('Home', 'home', 'published')
  on conflict (slug) do update set title = excluded.title
  returning id
)
insert into public.hero_content (page_id)
select id from inserted_page
on conflict (page_id) do nothing;

insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'Our Programs',
  'program_cards'::section_type,
  jsonb_build_object(
    'eyebrow', 'What We Do',
    'heading', 'Our Programs',
    'subtitle', 'Making a difference through targeted, community-focused initiatives',
    'programs', '[]'::jsonb
  ),
  1,
  true,
  'home_programs'
from public.pages p
where p.slug = 'home'
on conflict (page_id, section_key) do nothing;


-- ============================================================
-- END OF SCHEMA v3
-- ============================================================