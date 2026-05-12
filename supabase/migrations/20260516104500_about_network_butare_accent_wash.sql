-- Ensure Butare diocese tile has terracotta wash (matches reference card 03).

update public.sections s
set
  content = jsonb_set(s.content, '{dioceses,2,accent_wash}', 'true'::jsonb, true),
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_network'
  and jsonb_array_length(coalesce(s.content->'dioceses', '[]'::jsonb)) > 2;
