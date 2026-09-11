-- Add year_order to About history timeline (past→present by default).
-- Safe if the section already has year_order set from the editor.

update public.sections s
set
  content = jsonb_set(
    coalesce(s.content, '{}'::jsonb),
    '{year_order}',
    to_jsonb(
      coalesce(
        nullif(s.content->>'year_order', ''),
        'past_to_present'
      )
    ),
    true
  ),
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.section_key = 'about_timeline';
