-- News landing page as a first-class CMS page (slug `news`): templates, hero_content, sections.
-- Depends on: 20260430130600_news_section_enum_values.sql (enum values committed).
-- Does not reference news_page_settings — those defaults are inlined so this runs even if
-- 20260430120000_news_articles_and_settings.sql is applied later or on another env.

insert into public.section_templates (type, label, description, icon, default_content)
values
  (
    'news_article_feed',
    'Article listing',
    'Search, category filters, featured story, and the story grid — powered by entries under Dashboard → News.',
    'LayoutList',
    '{}'::jsonb
  ),
  (
    'news_footer',
    'News footer strip',
    'Title and short paragraph at the bottom of the News page (formerly the newsletter aside).',
    'Mail',
    jsonb_build_object(
      'title', 'Stay connected',
      'body', 'Follow Caritas Rwanda for programme news and humanitarian updates across all dioceses.'
    )
  )
on conflict (type) do update set
  label = excluded.label,
  description = excluded.description,
  icon = excluded.icon,
  default_content = excluded.default_content;
insert into public.pages (title, slug, status, meta)
select
  'News',
  'news',
  'published'::public.page_status,
  jsonb_build_object(
    'seo_title',
    'News & Updates — Caritas Rwanda',
    'seo_description',
    'Latest news, stories and updates from Caritas Rwanda — serving communities across all dioceses.'
  )
where not exists (select 1 from public.pages p where p.slug = 'news');
update public.pages
set
  title = 'News',
  status = 'published'::public.page_status,
  meta = jsonb_build_object(
    'seo_title',
    'News & Updates — Caritas Rwanda',
    'seo_description',
    'Latest news, stories and updates from Caritas Rwanda — serving communities across all dioceses.'
  ),
  updated_at = now()
where slug = 'news';
insert into public.hero_content (
  page_id,
  heading,
  subheading,
  cta_text,
  cta_url,
  image_url,
  options
)
select
  p.id,
  'News &',
  'Stories of impact, programme launches, and community voices from across Rwanda''s diocesan Caritas networks.',
  '',
  '',
  '',
  jsonb_strip_nulls(jsonb_build_object(
    'align', 'center',
    'overlay_opacity', 0.5,
    'text_color', '#ffffff',
    'badge_text', 'Latest from Caritas Rwanda',
    'heading_accent', 'Updates'
  ))
from public.pages p
where p.slug = 'news'
  and not exists (select 1 from public.hero_content h where h.page_id = p.id);
update public.hero_content hc
set
  heading = 'News &',
  subheading =
    'Stories of impact, programme launches, and community voices from across Rwanda''s diocesan Caritas networks.',
  cta_text = '',
  cta_url = '',
  image_url = '',
  options = jsonb_strip_nulls(jsonb_build_object(
    'align', 'center',
    'overlay_opacity', 0.5,
    'text_color', '#ffffff',
    'badge_text', 'Latest from Caritas Rwanda',
    'heading_accent', 'Updates'
  )),
  updated_at = now()
from public.pages p
where hc.page_id = p.id
  and p.slug = 'news';
insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'Article listing',
  'news_article_feed'::public.section_type,
  '{}'::jsonb,
  10,
  true,
  'news_feed'
from public.pages p
where p.slug = 'news'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'news_feed'
  );
insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'Stay connected strip',
  'news_footer'::public.section_type,
  jsonb_build_object(
    'title', 'Stay connected',
    'body', 'Follow Caritas Rwanda for programme news and humanitarian updates across all dioceses.'
  ),
  20,
  true,
  'news_newsletter'
from public.pages p
where p.slug = 'news'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'news_newsletter'
  );
