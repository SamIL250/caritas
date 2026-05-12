-- Structured donor profile fields for both individual and organization donation flows.

alter table public.donations
  add column if not exists donor_type text not null default 'individual',
  add column if not exists organization_name text,
  add column if not exists organization_contact_name text,
  add column if not exists donor_phone text,
  add column if not exists donor_address text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'donations_donor_type_check'
      and conrelid = 'public.donations'::regclass
  ) then
    alter table public.donations
      add constraint donations_donor_type_check
      check (donor_type in ('individual', 'organization'));
  end if;
end $$;

comment on column public.donations.donor_type is
  'Donor classification captured at checkout: individual | organization.';
comment on column public.donations.organization_name is
  'Organization legal/display name when donor_type = organization.';
comment on column public.donations.organization_contact_name is
  'Primary person representing the organization for this donation.';
comment on column public.donations.donor_phone is
  'Optional donor phone number supplied during donation.';
comment on column public.donations.donor_address is
  'Optional donor address supplied during donation.';

create index if not exists donations_donor_type_idx on public.donations (donor_type);
