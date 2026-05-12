-- Adds the video_gallery enum value to public.section_type.
-- Lives in its own migration because ALTER TYPE … ADD VALUE cannot be used in
-- the same transaction it runs in (SQLSTATE 55P04). The section_templates +
-- home seed live in 20260524120100_video_gallery_template_and_seed.sql.

alter type public.section_type add value if not exists 'video_gallery';
