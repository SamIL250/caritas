-- Display captions for images in the media library and rich text content.
ALTER TABLE public.media
  ADD COLUMN IF NOT EXISTS caption text;

COMMENT ON COLUMN public.media.caption IS
  'Human-readable caption shown below images in articles, news, and testimonies.';
