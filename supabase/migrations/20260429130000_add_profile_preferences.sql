-- Per-user UI preferences (dashboard): notifications, layout, etc.
alter table public.profiles
  add column if not exists preferences jsonb not null default '{}'::jsonb;
comment on column public.profiles.preferences is
  'User preferences for the CMS, e.g. { "emailNotifications": true, "compactCmsLayout": false }';
