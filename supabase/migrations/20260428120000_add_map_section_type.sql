-- Our Location: add enum (must be own migration; new enum values are not usable
-- in the same transaction as ALTER TYPE ... ADD VALUE — see Postgres 55P04).
alter type public.section_type add value if not exists 'map_section';
