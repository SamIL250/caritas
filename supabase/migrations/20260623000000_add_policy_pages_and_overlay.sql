-- ═══════════════════════════════════════════════════════════
-- POLICY PAGES table + cookie consent overlay option
-- ═══════════════════════════════════════════════════════════

-- 1. Add show_overlay to cookie_consent_settings
ALTER TABLE cookie_consent_settings
  ADD COLUMN IF NOT EXISTS show_overlay bool NOT NULL DEFAULT true;

-- 2. Create policy_pages table
CREATE TABLE IF NOT EXISTS policy_pages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  title       text NOT NULL,
  content     text NOT NULL DEFAULT '',
  updated_at  timestamptz DEFAULT now(),
  updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE policy_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read policy_pages"
  ON policy_pages FOR SELECT USING (true);

CREATE POLICY "Auth manage policy_pages"
  ON policy_pages FOR ALL USING (auth.role() = 'authenticated');

-- 3. Seed default policy pages
INSERT INTO policy_pages (slug, title, content) VALUES
('privacy-policy', 'Privacy Policy', '<h2>Introduction</h2><p>Caritas Rwanda respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p><h2>Information We Collect</h2><p>We may collect personal information that you voluntarily provide to us when you:</p><ul><li>Fill out a contact or donation form</li><li>Subscribe to our newsletter</li><li>Apply as a volunteer</li><li>Register for events</li></ul><p>This information may include your name, email address, phone number, and any other details you provide.</p><h2>How We Use Your Information</h2><p>We use the information we collect to:</p><ul><li>Respond to your inquiries and requests</li><li>Process donations and provide receipts</li><li>Send newsletters and updates (with your consent)</li><li>Improve our website and services</li><li>Comply with legal obligations</li></ul><h2>Data Protection</h2><p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p><h2>Your Rights</h2><p>You have the right to:</p><ul><li>Access your personal data</li><li>Request correction of inaccurate data</li><li>Request deletion of your data</li><li>Withdraw consent at any time</li><li>Lodge a complaint with a supervisory authority</li></ul><h2>Contact Us</h2><p>If you have any questions about this Privacy Policy, please contact us at <strong>info@caritasrwanda.org</strong> or visit our head office in Kigali, Rwanda.</p>'),
('cookie-policy', 'Cookie Policy', '<h2>What Are Cookies</h2><p>Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.</p><h2>How We Use Cookies</h2><p>We use cookies for the following purposes:</p><ul><li><strong>Necessary Cookies:</strong> Essential for the website to function properly. They enable basic features like page navigation and access to secure areas.</li><li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website by collecting and reporting information anonymously.</li><li><strong>Marketing Cookies:</strong> Used to track visitors across websites to display relevant advertisements.</li></ul><h2>Managing Cookies</h2><p>You can control and manage cookies in your browser settings. You can choose to accept or reject cookies, or set your browser to notify you when a cookie is set. Please note that disabling certain cookies may affect the functionality of our website.</p><h2>Third-Party Cookies</h2><p>We may use third-party services such as Google Analytics and social media platforms that set their own cookies. These third parties have their own privacy policies governing the use of your information.</p><h2>Updates to This Policy</h2><p>We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.</p><h2>Contact</h2><p>For any questions regarding our use of cookies, please contact us at <strong>info@caritasrwanda.org</strong>.</p>')
ON CONFLICT (slug) DO NOTHING;
