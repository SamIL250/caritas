-- New enum labels cannot be used in the same transaction as ALTER TYPE ADD VALUE (SQLSTATE 55P04).
-- Keep this migration separate so it commits before 20260511233000_diocese_map_section.sql runs.

alter type public.section_type add value if not exists 'diocese_map_section';
