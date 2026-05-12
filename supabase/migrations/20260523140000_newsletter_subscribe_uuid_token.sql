-- Replace gen_random_bytes (requires pgcrypto) with core gen_random_uuid() for unsubscribe tokens.

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
