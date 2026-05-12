-- New section_type labels for About-era blocks. Must commit before INSERTs that cast to section_type (Postgres restriction).
-- See: 20260429146000_add_about_section_templates.sql

alter type public.section_type add value if not exists 'stats_banner';
alter type public.section_type add value if not exists 'featured_quote';
alter type public.section_type add value if not exists 'timeline';
alter type public.section_type add value if not exists 'pillar_cards';
alter type public.section_type add value if not exists 'values_grid';
alter type public.section_type add value if not exists 'network_section';
alter type public.section_type add value if not exists 'leadership_grid';
