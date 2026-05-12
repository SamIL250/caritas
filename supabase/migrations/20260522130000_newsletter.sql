-- Newsletter subscribers (footer) + broadcast audit log + staff tooling.

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text generated always as (lower(trim(email))) stored,
  unsubscribe_token text not null,
  status text not null default 'active'
    constraint newsletter_subscribers_status_chk check (status in ('active', 'unsubscribed')),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_len check (
    char_length(trim(email)) >= 5 and char_length(email) <= 320
  ),
  constraint newsletter_subscribers_token_len check (
    char_length(unsubscribe_token) >= 32 and char_length(unsubscribe_token) <= 128
  )
);

create unique index newsletter_subscribers_email_normalized_uidx
  on public.newsletter_subscribers (email_normalized);

create unique index newsletter_subscribers_unsubscribe_token_uidx
  on public.newsletter_subscribers (unsubscribe_token);

create index newsletter_subscribers_status_created_idx
  on public.newsletter_subscribers (status, created_at desc);

comment on table public.newsletter_subscribers is
  'Public newsletter sign-ups from the website footer; staff sends broadcasts via dashboard.';

create or replace function public.newsletter_subscribers_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger newsletter_subscribers_updated_at
  before update on public.newsletter_subscribers
  for each row execute function public.newsletter_subscribers_set_updated_at();

alter table public.newsletter_subscribers enable row level security;

-- Staff full access (dashboard lists, exports).
create policy "newsletter_subscribers_staff_all"
  on public.newsletter_subscribers
  for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());

-- Public subscribe only via RPC (handles insert + resubscribe safely).
create or replace function public.newsletter_subscribe(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  norm text := lower(trim(p_email));
  tok text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  row_id uuid;
  existed boolean := false;
begin
  if norm is null or length(norm) < 5 or length(norm) > 320 or norm !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_email');
  end if;

  select id into row_id from public.newsletter_subscribers where email_normalized = norm limit 1;

  if row_id is not null then
    existed := true;
    update public.newsletter_subscribers
    set
      email = norm,
      unsubscribe_token = tok,
      status = 'active',
      unsubscribed_at = null,
      updated_at = now()
    where id = row_id;
  else
    insert into public.newsletter_subscribers (email, unsubscribe_token, status)
    values (norm, tok, 'active')
    returning id into row_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'subscriber_id', row_id,
    'unsubscribe_token', tok,
    'reactivated', existed
  );
exception when unique_violation then
  return jsonb_build_object('ok', false, 'error', 'conflict');
end;
$$;

revoke all on function public.newsletter_subscribe(text) from public;
grant execute on function public.newsletter_subscribe(text) to anon, authenticated;

create table public.newsletter_broadcasts (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  html_body text not null,
  text_body text not null default '',
  recipient_count integer not null default 0,
  batches_sent integer not null default 0,
  failed_recipients integer not null default 0,
  sent_at timestamptz not null default now(),
  sent_by uuid references auth.users (id) on delete set null,
  constraint newsletter_broadcasts_subject_len check (
    char_length(trim(subject)) >= 1 and char_length(subject) <= 400
  ),
  constraint newsletter_broadcasts_html_len check (char_length(html_body) <= 500000),
  constraint newsletter_broadcasts_counts_chk check (
    recipient_count >= 0 and batches_sent >= 0 and failed_recipients >= 0
  )
);

create index newsletter_broadcasts_sent_at_idx
  on public.newsletter_broadcasts (sent_at desc);

comment on table public.newsletter_broadcasts is
  'Audit trail when staff sends a newsletter from the dashboard.';

alter table public.newsletter_broadcasts enable row level security;

create policy "newsletter_broadcasts_staff_select"
  on public.newsletter_broadcasts
  for select
  using (public.is_authenticated_staff());

create policy "newsletter_broadcasts_staff_insert"
  on public.newsletter_broadcasts
  for insert
  with check (public.is_authenticated_staff());

-- One-click unsubscribe from email links (no staff login).
create or replace function public.newsletter_unsubscribe(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  tok text := nullif(trim(p_token), '');
begin
  if tok is null or length(tok) > 128 then
    return false;
  end if;

  update public.newsletter_subscribers
  set
    status = 'unsubscribed',
    unsubscribed_at = coalesce(unsubscribed_at, now()),
    updated_at = now()
  where unsubscribe_token = tok
    and status = 'active';

  return found;
end;
$$;

revoke all on function public.newsletter_unsubscribe(text) from public;
grant execute on function public.newsletter_unsubscribe(text) to anon, authenticated;
