-- Recurring donation subscriptions + Terms of Use policy page

CREATE TABLE IF NOT EXISTS donation_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text,
  stripe_checkout_session_id text,
  community_campaign_id uuid REFERENCES community_campaigns(id) ON DELETE SET NULL,
  campaign_name text,
  donor_email text,
  donor_name text,
  donor_type text NOT NULL DEFAULT 'individual',
  organization_name text,
  organization_contact_name text,
  donor_phone text,
  donor_address text,
  donor_message text,
  amount integer NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'RWF',
  interval text NOT NULL DEFAULT 'month',
  interval_count integer NOT NULL DEFAULT 1 CHECK (interval_count >= 1),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('incomplete', 'active', 'paused', 'past_due', 'canceled', 'unpaid', 'incomplete_expired')),
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  current_period_end timestamptz,
  canceled_at timestamptz,
  paused_at timestamptz,
  last_donation_id uuid REFERENCES donations(id) ON DELETE SET NULL,
  stripe_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS donation_subscriptions_status_idx
  ON donation_subscriptions (status);

CREATE INDEX IF NOT EXISTS donation_subscriptions_email_idx
  ON donation_subscriptions (donor_email);

CREATE INDEX IF NOT EXISTS donation_subscriptions_campaign_idx
  ON donation_subscriptions (community_campaign_id);

ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS donation_subscription_id uuid REFERENCES donation_subscriptions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS donations_subscription_id_idx
  ON donations (donation_subscription_id);

ALTER TABLE donation_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read donation_subscriptions" ON donation_subscriptions;
CREATE POLICY "Staff read donation_subscriptions"
  ON donation_subscriptions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff manage donation_subscriptions" ON donation_subscriptions;
CREATE POLICY "Staff manage donation_subscriptions"
  ON donation_subscriptions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public Terms page (footer already links to /terms)
INSERT INTO policy_pages (slug, title, content) VALUES
(
  'terms',
  'Terms and Conditions',
  $html$
  <h2>Introduction</h2>
  <p>These Terms and Conditions govern your use of the Caritas Rwanda website and donation services. By making a donation or using this site, you agree to these terms.</p>
  <h2>Donations</h2>
  <p>Donations are voluntary contributions to support Caritas Rwanda programmes. One-time and recurring (monthly) gifts may be offered. Recurring gifts continue until you cancel or pause them, or until an optional commitment period ends.</p>
  <h2>Payment processing</h2>
  <p>Card payments are processed securely by Stripe. Bank transfer and mobile money pledges are confirmed by our team before being marked as received.</p>
  <h2>Recurring gifts</h2>
  <p>If you choose a monthly or other recurring donation, you authorise Caritas Rwanda (via Stripe) to charge the selected amount on the agreed schedule. You may request pause or cancellation by contacting us, and staff can manage subscriptions in the dashboard.</p>
  <h2>Privacy</h2>
  <p>Personal data collected for donations is handled according to our <a href="/privacy-policy">Privacy Policy</a>.</p>
  <h2>Contact</h2>
  <p>Questions about these terms: <strong>info@caritasrwanda.org</strong>.</p>
  $html$
)
ON CONFLICT (slug) DO NOTHING;
