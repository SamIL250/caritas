-- Run this in the Supabase SQL Editor if you see:
--   invalid input value for enum section_type: "program_cards"
-- (The enum value was missing because ALTER TYPE cannot run inside a DO block in Postgres.)

-- Postgres 15+ (Supabase: use this)
alter type public.section_type add value if not exists 'program_cards';

-- If the line above errors on "IF NOT EXISTS", your Postgres is older — use:
-- alter type public.section_type add value 'program_cards';
-- (If it already exists, you'll get a harmless error; then retry adding the section in the app.)
