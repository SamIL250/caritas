-- Homepage compliance notice.
-- One row. Anyone can read it. Signed-in staff can edit it.
-- Seeded on, with the zero-tolerance poster.

CREATE TABLE IF NOT EXISTS public.compliance_notice_settings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled        boolean NOT NULL DEFAULT true,
  title          text NOT NULL DEFAULT 'Zero tolerance',
  image_url      text NOT NULL DEFAULT '/img/compliance-zero-tolerance.webp',
  image_alt      text NOT NULL DEFAULT 'Caritas Rwanda zero tolerance against sexual exploitation and abuse, fraud, abuse of authority, corruption, misuse of assets, and harassment.',
  report_label   text NOT NULL DEFAULT 'You can report your concerns directly through',
  contact_email  text NOT NULL DEFAULT 'inspector@caritasrwanda.org',
  contact_phone  text NOT NULL DEFAULT '+250 793 455 552',
  info_label     text NOT NULL DEFAULT 'Need more information',
  info_url       text NOT NULL DEFAULT 'https://caritasrwanda.org/home/policies/',
  updated_at     timestamptz NOT NULL DEFAULT now(),
  updated_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.compliance_notice_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read compliance_notice_settings" ON public.compliance_notice_settings;
CREATE POLICY "Public read compliance_notice_settings"
  ON public.compliance_notice_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth manage compliance_notice_settings" ON public.compliance_notice_settings;
CREATE POLICY "Auth manage compliance_notice_settings"
  ON public.compliance_notice_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

INSERT INTO public.compliance_notice_settings (
  enabled, title, image_url, image_alt, report_label, contact_email, contact_phone, info_label, info_url
)
SELECT
  true,
  'Zero tolerance',
  '/img/compliance-zero-tolerance.webp',
  'Caritas Rwanda zero tolerance against sexual exploitation and abuse, fraud, abuse of authority, corruption, misuse of assets, and harassment.',
  'You can report your concerns directly through',
  'inspector@caritasrwanda.org',
  '+250 793 455 552',
  'Need more information',
  'https://caritasrwanda.org/home/policies/'
WHERE NOT EXISTS (SELECT 1 FROM public.compliance_notice_settings);
