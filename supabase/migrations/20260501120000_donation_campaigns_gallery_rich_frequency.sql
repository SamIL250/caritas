-- Campaign gallery, rich HTML description, fundraising window, and recurring options for donations.

alter table public.donation_campaigns
  add column if not exists description_html text,
  add column if not exists gallery_images jsonb not null default '[]'::jsonb,
  add column if not exists fundraising_end_at timestamptz,
  add column if not exists frequency_one_time boolean not null default true,
  add column if not exists frequency_weekly boolean not null default false,
  add column if not exists frequency_monthly boolean not null default false,
  add column if not exists frequency_every_n_months smallint null
    check (frequency_every_n_months is null or frequency_every_n_months >= 1),
  add column if not exists frequency_every_n_years smallint null
    check (frequency_every_n_years is null or frequency_every_n_years >= 1),
  add column if not exists recurring_commitment_months smallint null
    check (recurring_commitment_months is null or recurring_commitment_months >= 1);
comment on column public.donation_campaigns.description_html is 'Staff-edited HTML (TipTap). Plain description remains for legacy snippets.';
comment on column public.donation_campaigns.gallery_images is 'JSON array of { "url": string, "alt"?: string, "sort_order"?: number }.';
comment on column public.donation_campaigns.fundraising_end_at is 'Optional public deadline after which the campaign should not accept new donations.';
comment on column public.donation_campaigns.recurring_commitment_months is 'If set, recurring Checkout subscriptions cancel after this many months from signup.';
alter table public.donations
  add column if not exists donor_message text;
comment on column public.donations.donor_message is 'Optional note left by the donor; mirrored in Stripe metadata.';
