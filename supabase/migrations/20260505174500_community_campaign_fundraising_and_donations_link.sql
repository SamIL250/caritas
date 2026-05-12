-- Fundraising fields live on community_campaigns (single campaign entity).
-- donations.community_campaign_id links succeeded payments to that entity.

alter table public.community_campaigns
  add column if not exists donations_enabled boolean not null default false;

alter table public.community_campaigns
  add column if not exists preset_amounts jsonb not null default '[1000, 5000, 10000, 50000]'::jsonb;

alter table public.community_campaigns
  add column if not exists goal_amount bigint;

alter table public.community_campaigns
  add column if not exists currency text not null default 'RWF';

alter table public.community_campaigns
  add column if not exists frequency_one_time boolean not null default true;

alter table public.community_campaigns
  add column if not exists frequency_weekly boolean not null default false;

alter table public.community_campaigns
  add column if not exists frequency_monthly boolean not null default false;

alter table public.community_campaigns
  add column if not exists frequency_every_n_months integer;

alter table public.community_campaigns
  add column if not exists frequency_every_n_years integer;

alter table public.community_campaigns
  add column if not exists recurring_commitment_months integer;

alter table public.community_campaigns
  add column if not exists gallery_images jsonb not null default '[]'::jsonb;

alter table public.community_campaigns
  add column if not exists fundraising_end_at timestamptz;

alter table public.community_campaigns
  add column if not exists donation_modal_description_html text;

comment on column public.community_campaigns.donations_enabled is
  'When true and status is published, listed in donation modal & donations dashboard.';
comment on column public.community_campaigns.donation_modal_description_html is
  'Optional HTML for donation modal; falls back to full story body when empty.';

alter table public.donations
  add column if not exists community_campaign_id uuid references public.community_campaigns (id) on delete set null;

create index if not exists donations_community_campaign_id_idx
  on public.donations (community_campaign_id);
