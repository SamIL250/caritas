-- Adds program_cards to section_type and the section_templates row.
-- NOTE: ADD VALUE must run as a top-level statement — not inside a DO/plpgsql
-- block (Postgres will reject it). Use ADD VALUE IF NOT EXISTS on PG 15+.

alter type public.section_type add value if not exists 'program_cards';
insert into public.section_templates (type, label, description, icon, default_content)
values (
  'program_cards',
  'Our Programs',
  'Four-column programs grid: imagery, text, and links (homepage "Our Programs").',
  'LayoutTemplate',
  '{
    "eyebrow": "What We Do",
    "heading": "Our Programs",
    "subtitle": "Making a difference through targeted, community-focused initiatives",
    "programs": []
  }'::jsonb
)
on conflict (type) do update set
  label = excluded.label,
  description = excluded.description,
  icon = excluded.icon,
  default_content = excluded.default_content;
