-- Anonymous visitors cannot SELECT donations rows; expose aggregate totals per published campaign only.

create or replace function public.community_campaign_public_fundraising_stats(p_campaign_id uuid)
returns table (raised_amount bigint, donor_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(sum(d.amount), 0)::bigint as raised_amount,
    count(*)::bigint as donor_count
  from public.donations d
  where d.status = 'succeeded'::public.donation_status
    and d.community_campaign_id = p_campaign_id
    and exists (
      select 1
      from public.community_campaigns c
      where c.id = p_campaign_id
        and c.status = 'published'::public.community_campaign_status
    );
$$;

comment on function public.community_campaign_public_fundraising_stats(uuid) is
  'Sum of succeeded donation amounts and donation row count for a published community campaign; callable without donations SELECT.';

revoke all on function public.community_campaign_public_fundraising_stats(uuid) from public;
grant execute on function public.community_campaign_public_fundraising_stats(uuid) to anon, authenticated;
