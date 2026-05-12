-- About page: default stats_banner to strip layout; optional leadership title refresh; featured_quote tone default.
-- Safe for environments where editors already customized section JSON.

update public.sections s
set
  content = coalesce(s.content, '{}'::jsonb) || jsonb_build_object('layout', 'strip'),
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_stats'
  and not coalesce(s.content, '{}'::jsonb) ? 'layout';

update public.sections s
set
  content =
    jsonb_set(
      jsonb_set(
        coalesce(s.content, '{}'::jsonb),
        '{title}',
        to_jsonb('A Legacy of Faithful Service'::text)
      ),
      '{subtitle}',
      to_jsonb(
        'Guided by visionary leaders since 1959 — faithful shepherds who have steered Caritas Rwanda through decades of challenge, growth, and transformation.'::text
      )
    ),
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_leadership'
  and coalesce(s.content->>'title', '') in ('Our Leadership Succession', '');

update public.sections s
set
  content = coalesce(s.content, '{}'::jsonb) || jsonb_build_object('tone', 'dark'),
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_chair_quote'
  and not coalesce(s.content, '{}'::jsonb) ? 'tone';
