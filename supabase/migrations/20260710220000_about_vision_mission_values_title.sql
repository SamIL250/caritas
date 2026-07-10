-- Rename About mission section title: Mission, Vision & Values → Vision, Mission & Values

update public.sections s
set
  content = jsonb_set(
    s.content,
    '{title}',
    '"Vision, Mission & Values"'::jsonb,
    true
  ),
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.content->>'title' = 'Mission, Vision & Values';
