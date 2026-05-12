-- Public contact form submissions + staff replies (email via app layer).

create type public.contact_message_status as enum ('new', 'read', 'replied', 'archived');

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  status public.contact_message_status not null default 'new'::public.contact_message_status,
  full_name text not null,
  email text not null,
  phone text not null default '',
  organization text not null default '',
  topic text not null,
  message_body text not null,
  staff_notes text not null default '',
  read_at timestamptz,
  read_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_messages_name_len check (char_length(trim(full_name)) >= 2 and char_length(full_name) <= 200),
  constraint contact_messages_email_len check (char_length(trim(email)) >= 5 and char_length(email) <= 320),
  constraint contact_messages_phone_len check (char_length(phone) <= 120),
  constraint contact_messages_org_len check (char_length(organization) <= 300),
  constraint contact_messages_topic_len check (char_length(trim(topic)) >= 2 and char_length(topic) <= 120),
  constraint contact_messages_body_len check (char_length(trim(message_body)) >= 10 and char_length(message_body) <= 16000),
  constraint contact_messages_staff_notes_len check (char_length(staff_notes) <= 8000)
);

create index contact_messages_status_created_idx
  on public.contact_messages (status, created_at desc);

create index contact_messages_created_idx
  on public.contact_messages (created_at desc);

comment on table public.contact_messages is
  'Website contact form messages; staff reply via dashboard using SMTP.';

create or replace function public.contact_messages_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contact_messages_updated_at
  before update on public.contact_messages
  for each row execute function public.contact_messages_set_updated_at();

alter table public.contact_messages enable row level security;

create policy "contact_messages_staff_all"
  on public.contact_messages
  for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());

create policy "contact_messages_public_insert_new"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (
    status = 'new'::public.contact_message_status
    and read_at is null
    and read_by is null
    and staff_notes = ''
  );

create table public.contact_message_replies (
  id uuid primary key default gen_random_uuid(),
  contact_message_id uuid not null references public.contact_messages (id) on delete cascade,
  body_text text not null,
  sent_by uuid references auth.users (id) on delete set null,
  sent_at timestamptz not null default now(),
  constraint contact_message_replies_body_len check (
    char_length(trim(body_text)) >= 1 and char_length(body_text) <= 16000
  )
);

create index contact_message_replies_message_idx
  on public.contact_message_replies (contact_message_id, sent_at asc);

comment on table public.contact_message_replies is
  'Staff outbound email replies logged for the contact inbox.';

alter table public.contact_message_replies enable row level security;

create policy "contact_message_replies_staff_all"
  on public.contact_message_replies
  for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());
