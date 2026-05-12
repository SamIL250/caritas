-- Adds an "Our Programs" (program_cards) row for the home page (editable in Pages → Home).
-- Depends on: section_type including 'program_cards'.

-- Idempotent without ON CONFLICT (page_id, section_key): remote DB may lack that unique index.
insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'Our Programs',
  'program_cards'::public.section_type,
  jsonb_build_object(
    'eyebrow', 'What We Do',
    'heading', 'Our Programs',
    'subtitle', 'Making a difference through targeted, community-focused initiatives',
    'programs', '[]'::jsonb
  ),
  1,
  true,
  'home_programs'
from public.pages p
where p.slug = 'home'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'home_programs'
  );
