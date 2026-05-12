-- INSERT policy referenced community_campaign_comments inside WITH CHECK; Postgres re-applies
-- SELECT policies on that subquery → infinite recursion. Validate parent via SECURITY DEFINER instead.

create or replace function public.community_campaign_reply_parent_ok(p_parent_id uuid, p_campaign_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_parent_id is null
  or exists (
    select 1
    from public.community_campaign_comments p
    where p.id = p_parent_id
      and p.campaign_id = p_campaign_id
      and p.status = 'approved'::public.community_campaign_comment_status
  );
$$;

revoke all on function public.community_campaign_reply_parent_ok(uuid, uuid) from public;
grant execute on function public.community_campaign_reply_parent_ok(uuid, uuid) to anon, authenticated;

drop policy if exists "community_campaign_comments_insert_pending" on public.community_campaign_comments;

create policy "community_campaign_comments_insert_pending"
  on public.community_campaign_comments for insert
  with check (
    status = 'pending'::public.community_campaign_comment_status
    and moderated_at is null
    and moderated_by is null
    and exists (
      select 1 from public.community_campaigns c
      where c.id = campaign_id
        and c.status = 'published'::public.community_campaign_status
    )
    and public.community_campaign_reply_parent_ok(parent_id, campaign_id)
  );
