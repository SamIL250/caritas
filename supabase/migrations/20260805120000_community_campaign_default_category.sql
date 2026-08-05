-- Default fallback category for campaigns when their assigned category is deleted.
insert into public.community_campaign_categories (slug, name, sort_order)
values ('general', 'General', 0)
on conflict (slug) do nothing;
