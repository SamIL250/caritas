-- Publications: language classification for filtering on the public site.
-- Defaults used in the app: en, fr, rw, es — custom codes allowed.

ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en';

ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS language_label text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.publications.language IS
  'ISO-ish language code (en, fr, rw, es, or custom).';

COMMENT ON COLUMN public.publications.language_label IS
  'Optional display label for custom languages; empty uses built-in / Intl label.';

CREATE INDEX IF NOT EXISTS publications_language_status_idx
  ON public.publications (language, status);
