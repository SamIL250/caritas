-- How the public donate modal collects a gift.
-- One row. Online card checkout stays off until staff turn it on.
-- While it is off, donors see the message, email, phone, and MTN MoMo code below.

CREATE TABLE IF NOT EXISTS public.donation_giving_settings (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  online_payments_enabled  boolean NOT NULL DEFAULT false,
  title                    text NOT NULL DEFAULT 'How to give',
  message                  text NOT NULL DEFAULT 'Online payments are not open yet. Please contact us, or send your donation with MTN Mobile Money using the details below. Mention which cause your gift is for.',
  contact_email            text NOT NULL DEFAULT 'info@caritasrwanda.org',
  contact_phone            text NOT NULL DEFAULT '(+250) 252 574 344',
  mtn_code                 text NOT NULL DEFAULT '',
  updated_at               timestamptz NOT NULL DEFAULT now(),
  updated_by               uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.donation_giving_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read donation_giving_settings" ON public.donation_giving_settings;
CREATE POLICY "Public read donation_giving_settings"
  ON public.donation_giving_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth manage donation_giving_settings" ON public.donation_giving_settings;
CREATE POLICY "Auth manage donation_giving_settings"
  ON public.donation_giving_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

INSERT INTO public.donation_giving_settings (
  online_payments_enabled, title, message, contact_email, contact_phone, mtn_code
)
SELECT
  false,
  'How to give',
  'Online payments are not open yet. Please contact us, or send your donation with MTN Mobile Money using the details below. Mention which cause your gift is for.',
  'info@caritasrwanda.org',
  '(+250) 252 574 344',
  ''
WHERE NOT EXISTS (SELECT 1 FROM public.donation_giving_settings);
