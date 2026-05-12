-- Volunteer applications (Get Involved): public submissions → staff review → optional acceptance/rejection emails via app layer.

alter table public.community_campaigns
  add column if not exists volunteering_enabled boolean not null default true;

comment on column public.community_campaigns.volunteering_enabled is
  'When true and campaign is published, listed in the volunteer signup modal under Get Involved.';

create type public.volunteer_application_status as enum ('pending', 'accepted', 'rejected');

create table public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  status public.volunteer_application_status not null default 'pending'::public.volunteer_application_status,
  preferred_campaign_id uuid references public.community_campaigns (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null default '',
  city text not null default '',
  motivation text not null default '',
  skills_experience text not null default '',
  availability text not null default '',
  languages text not null default '',
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  assigned_campaign_id uuid references public.community_campaigns (id) on delete set null,
  assigned_role_label text not null default '',
  staff_notes text not null default '',
  rejection_reason text not null default '',
  acceptance_email_sent_at timestamptz,
  rejection_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint volunteer_applications_email_len check (char_length(trim(email)) >= 5 and char_length(email) <= 320),
  constraint volunteer_applications_name_len check (char_length(trim(full_name)) >= 2 and char_length(full_name) <= 200),
  constraint volunteer_applications_phone_len check (char_length(phone) <= 80),
  constraint volunteer_applications_motivation_len check (char_length(motivation) <= 8000),
  constraint volunteer_applications_skills_len check (char_length(skills_experience) <= 8000),
  constraint volunteer_applications_availability_len check (char_length(availability) <= 4000),
  constraint volunteer_applications_staff_notes_len check (char_length(staff_notes) <= 4000),
  constraint volunteer_applications_rejection_len check (char_length(rejection_reason) <= 4000),
  constraint volunteer_applications_role_len check (char_length(assigned_role_label) <= 200)
);

create index volunteer_applications_status_created_idx
  on public.volunteer_applications (status, created_at desc);

create index volunteer_applications_preferred_campaign_idx
  on public.volunteer_applications (preferred_campaign_id);

create or replace function public.volunteer_applications_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger volunteer_applications_updated_at
  before update on public.volunteer_applications
  for each row execute function public.volunteer_applications_set_updated_at();

alter table public.volunteer_applications enable row level security;

-- Anonymous visitors may submit pending rows only (columns enforced loosely — trust server action + future hook hardening).
create policy "volunteer_applications_public_insert_pending"
  on public.volunteer_applications
  for insert
  to anon, authenticated
  with check (
    status = 'pending'::public.volunteer_application_status
    and reviewed_at is null
    and reviewed_by is null
    and acceptance_email_sent_at is null
    and rejection_email_sent_at is null
  );

-- Staff: full access (includes SELECT for dashboard).
create policy "volunteer_applications_staff_all"
  on public.volunteer_applications
  for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());
