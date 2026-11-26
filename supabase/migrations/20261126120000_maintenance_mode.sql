-- Public maintenance screen.
-- One row, same access pattern as cookie_consent_settings:
-- anyone can read it, signed-in staff can edit it.
-- Seeded disabled so the live site stays up until an editor turns it on.

CREATE TABLE IF NOT EXISTS public.maintenance_settings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled        boolean NOT NULL DEFAULT false,
  eyebrow        text NOT NULL DEFAULT 'We''ll be back soon',
  title          text NOT NULL DEFAULT 'This website is under maintenance',
  message        text NOT NULL DEFAULT 'We are making a few improvements so Caritas Rwanda can serve you better. The site will be live again shortly.',
  contact_label  text NOT NULL DEFAULT 'Need to reach us?',
  contact_email  text NOT NULL DEFAULT 'info@caritasrwanda.org',
  updated_at     timestamptz NOT NULL DEFAULT now(),
  updated_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.maintenance_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read maintenance_settings" ON public.maintenance_settings;
CREATE POLICY "Public read maintenance_settings"
  ON public.maintenance_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth manage maintenance_settings" ON public.maintenance_settings;
CREATE POLICY "Auth manage maintenance_settings"
  ON public.maintenance_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

INSERT INTO public.maintenance_settings (
  enabled, eyebrow, title, message, contact_label, contact_email
)
SELECT
  false,
  'We''ll be back soon',
  'This website is under maintenance',
  'We are making a few improvements so Caritas Rwanda can serve you better. The site will be live again shortly.',
  'Need to reach us?',
  'info@caritasrwanda.org'
WHERE NOT EXISTS (SELECT 1 FROM public.maintenance_settings);
