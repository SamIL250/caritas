-- Postgres requires new enum labels to be committed before use in later statements.
-- Inserts referencing `faq_section` live in 20260602015100_faq_section_template_and_seed.sql.

alter type public.section_type add value if not exists 'faq_section';
