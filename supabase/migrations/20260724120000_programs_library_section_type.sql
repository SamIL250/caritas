-- Adds programs_library to section_type.
-- Must be a separate migration from inserts that use the new value (SQLSTATE 55P04).

alter type public.section_type add value if not exists 'programs_library';
