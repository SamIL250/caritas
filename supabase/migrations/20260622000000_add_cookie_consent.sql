-- ═══════════════════════════════════════════════════════════
-- COOKIE CONSENT SETTINGS — table, RLS and seed
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS cookie_consent_settings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled         bool NOT NULL DEFAULT true,
  banner_title    text NOT NULL DEFAULT 'We Value Your Privacy',
  banner_description text NOT NULL DEFAULT 'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can choose which types of cookies to allow.',
  accept_label    text NOT NULL DEFAULT 'Accept All',
  deny_label      text NOT NULL DEFAULT 'Deny All',
  customize_label text NOT NULL DEFAULT 'Customize',
  privacy_page_url text NOT NULL DEFAULT '/privacy-policy',
  cookie_policy_page_url text NOT NULL DEFAULT '/cookie-policy',
  position        text NOT NULL DEFAULT 'bottom' CHECK (position IN ('bottom', 'top', 'bottom-left', 'bottom-right')),
  theme           text NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  consent_expiry_days int NOT NULL DEFAULT 365,
  necessary_cookies jsonb NOT NULL DEFAULT '[]'::jsonb,
  analytics_cookies jsonb NOT NULL DEFAULT '[]'::jsonb,
  marketing_cookies jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at      timestamptz DEFAULT now(),
  updated_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE cookie_consent_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cookie_consent_settings"
  ON cookie_consent_settings FOR SELECT USING (true);

CREATE POLICY "Auth manage cookie_consent_settings"
  ON cookie_consent_settings FOR ALL USING (auth.role() = 'authenticated');

-- Seed default row
INSERT INTO cookie_consent_settings (
  banner_title, banner_description, accept_label, deny_label, customize_label,
  privacy_page_url, cookie_policy_page_url, position, theme, consent_expiry_days,
  necessary_cookies, analytics_cookies, marketing_cookies
) VALUES (
  'We Value Your Privacy',
  'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can choose which types of cookies to allow.',
  'Accept All',
  'Deny All',
  'Customize',
  '/privacy-policy',
  '/cookie-policy',
  'bottom',
  'dark',
  365,
  jsonb_build_array(
    jsonb_build_object('id', 'session', 'name', 'Session Cookies', 'description', 'Required for basic site functionality and authentication.'),
    jsonb_build_object('id', 'csrf', 'name', 'CSRF Tokens', 'description', 'Protects against cross-site request forgery attacks.')
  ),
  jsonb_build_array(
    jsonb_build_object('id', 'ga', 'name', 'Google Analytics', 'description', 'Helps us understand how visitors interact with our site.'),
    jsonb_build_object('id', 'hotjar', 'name', 'Hotjar', 'description', 'Provides heatmaps and session recordings to improve usability.')
  ),
  jsonb_build_array(
    jsonb_build_object('id', 'ads', 'name', 'Advertising Cookies', 'description', 'Used to deliver relevant advertisements and track campaign performance.'),
    jsonb_build_object('id', 'social', 'name', 'Social Media Cookies', 'description', 'Enables sharing content across social platforms.')
  )
)
ON CONFLICT DO NOTHING;
