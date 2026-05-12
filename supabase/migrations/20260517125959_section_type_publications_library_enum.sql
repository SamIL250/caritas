-- Postgres requires new enum labels to be committed before use in later statements.
-- Inserts referencing `publications_library` live in 20260517130000_publications.sql.

alter type public.section_type add value if not exists 'publications_library';
