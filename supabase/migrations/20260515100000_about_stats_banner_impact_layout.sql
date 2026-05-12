-- About page Key stats: use impact layout to match original-web/index.html OUR RESOURCES section.

update public.sections s
set
  content = jsonb_set(coalesce(s.content, '{}'::jsonb), '{layout}', '"impact"', true),
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_stats';