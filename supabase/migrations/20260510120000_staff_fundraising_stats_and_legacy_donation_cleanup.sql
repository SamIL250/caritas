-- Staff-visible aggregates for any community campaign status (draft/published).
-- Public RPC still requires published status for anonymous callers.

create or replace function public.community_campaign_staff_fundraising_stats(p_campaign_id uuid)
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
    and d.community_campaign_id = p_campaign_id;
$$;

comment on function public.community_campaign_staff_fundraising_stats(uuid) is
  'Succeeded donation totals per community campaign for dashboard editors (no publish gate).';

revoke all on function public.community_campaign_staff_fundraising_stats(uuid) from public;
grant execute on function public.community_campaign_staff_fundraising_stats(uuid) to authenticated;

-- Remove legacy donation_campaigns-linked rows so KPIs match community campaign cards.
-- Keeps rows with both FKs null (e.g. general one-off gifts).
delete from public.donations
where community_campaign_id is null
  and campaign_id is not null;
