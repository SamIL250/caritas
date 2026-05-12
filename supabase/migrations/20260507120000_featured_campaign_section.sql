-- Homepage section driven by community_campaigns.featured_on_home (managed under Dashboard → Campaigns).
--
-- Enum note (PostgreSQL): a value added with ALTER TYPE ... ADD VALUE cannot be used in the same
-- migration transaction (SQLSTATE 55P04). The section_templates INSERT lives in the next migration.

alter type public.section_type add value if not exists 'featured_campaign';

alter table public.community_campaigns
  add column if not exists featured_on_home boolean not null default false;

comment on column public.community_campaigns.featured_on_home is
  'When true, this campaign supplies the Featured Campaign block on the home page (published rows only). At most one row should be true.';

create unique index if not exists community_campaigns_one_featured_home_idx
  on public.community_campaigns (featured_on_home)
  where featured_on_home = true;
