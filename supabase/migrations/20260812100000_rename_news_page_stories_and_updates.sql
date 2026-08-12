-- Rename CMS page "News" → "Stories and Updates" (keep slug `/news` for stable URLs).
-- Align hero copy + default background with the public landing page.

update public.pages
set
  title = 'Stories and Updates',
  meta = coalesce(meta, '{}'::jsonb) || jsonb_build_object(
    'seo_title', 'Stories and Updates — Caritas Rwanda',
    'seo_description',
    'Latest stories and updates from Caritas Rwanda — serving communities across all dioceses.'
  ),
  updated_at = now()
where slug = 'news';

update public.hero_content hc
set
  heading = 'Stories and',
  options = coalesce(hc.options, '{}'::jsonb) || jsonb_build_object(
    'heading_accent', 'Updates',
    'badge_text', coalesce(nullif(trim(hc.options->>'badge_text'), ''), 'Latest from Caritas Rwanda')
  ),
  image_url = case
    when coalesce(trim(hc.image_url), '') = '' then '/img/slide4.webp'
    else hc.image_url
  end,
  updated_at = now()
from public.pages p
where hc.page_id = p.id
  and p.slug = 'news';

-- Keep legacy settings table in sync when present.
update public.news_page_settings
set
  hero_headline_prefix = 'Stories and',
  hero_headline_accent = 'Updates',
  hero_image_url = case
    when coalesce(trim(hero_image_url), '') = '' then '/img/slide4.webp'
    else hero_image_url
  end,
  updated_at = now()
where id = 1;
