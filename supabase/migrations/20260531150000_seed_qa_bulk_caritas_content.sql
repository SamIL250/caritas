-- Bulk QA seed: news, programs, publications — idempotent (`qa-bulk-` slugs).
-- Copy is **synthetic** for testing filters, related-content RPC, and program detail layouts.
-- Program names echo **publicly described** Caritas Rwanda focus areas (not official copy).
-- Images: https://picsum.photos (deterministic seeds) for stable loading in dev/staging.

--------------------------------------------------------------------------------
-- News (mixed pillars + international without department)
--------------------------------------------------------------------------------

INSERT INTO public.news_articles (
  title,
  slug,
  excerpt,
  category,
  department_id,
  featured,
  image_url,
  image_alt,
  external_url,
  status,
  published_at,
  sort_order
)
SELECT v.title,
       v.slug,
       v.excerpt,
       v.cat::public.news_article_category,
       pc.id,
       v.featured,
       v.image_url,
       v.image_alt,
       coalesce(v.external_url, ''),
       'published'::public.news_article_status,
       now() - (v.days_ago || ' days')::interval,
       v.sort_order
FROM (VALUES
  -- Health pillar
  (
    'QA · Community health volunteers expand home visits',
    'qa-bulk-news-health-home-visits',
    'Training and supervision for CHWs supporting maternal and child health follow-up.',
    'health',
    'health',
    false,
    'https://picsum.photos/seed/qa-cr-health-1/1100/620',
    'Community health volunteer visit',
    '',
    10500,
    1
  ),
  (
    'QA · First 1,000 days: nutrition screening days',
    'qa-bulk-news-health-1000-days',
    'Mobile screening for acute malnutrition and referral to nearby health posts.',
    'health',
    'health',
    true,
    'https://picsum.photos/seed/qa-cr-health-2/1100/620',
    'Nutrition screening',
    '',
    10490,
    3
  ),
  (
    'QA · WASH repairs at rural water points',
    'qa-bulk-news-health-wash-repairs',
    'Pipe repairs, hand-washing points near schools, and local water committee refresh.',
    'health',
    'health',
    false,
    'https://picsum.photos/seed/qa-cr-health-3/1100/620',
    'Water point maintenance',
    '',
    10480,
    5
  ),
  (
    'QA · Church-owned health facilities coordination note',
    'qa-bulk-news-health-med-coordination',
    'National coordination meeting on standards, medicines, and referral pathways.',
    'health',
    'health',
    false,
    'https://picsum.photos/seed/qa-cr-health-4/1100/620',
    'Health coordination',
    'https://caritasrwanda.org/',
    10470,
    7
  ),
  (
    'QA · ECD play materials for early learning corners',
    'qa-bulk-news-health-ecd-play',
    'Lightweight kits for parish-based early learning corners and caregiver coaching.',
    'health',
    'health',
    false,
    'https://picsum.photos/seed/qa-cr-health-5/1100/620',
    'ECD learning materials',
    '',
    10460,
    9
  ),
  -- Development pillar
  (
    'QA · Farmer field schools on climate-smart practices',
    'qa-bulk-news-dev-field-schools',
    'Seasonal learning plots, soil conservation demos, and savings-group linkages.',
    'development',
    'development',
    true,
    'https://picsum.photos/seed/qa-cr-dev-1/1100/620',
    'Farmer field school',
    '',
    10450,
    2
  ),
  (
    'QA · Cooperative aggregation for maize surplus',
    'qa-bulk-news-dev-maize-cooperative',
    'Bulk sales training, quality checks, and simple storage hygiene.',
    'development',
    'development',
    false,
    'https://picsum.photos/seed/qa-cr-dev-2/1100/620',
    'Agricultural cooperative',
    '',
    10440,
    6
  ),
  (
    'QA · Youth apprenticeship placements open',
    'qa-bulk-news-dev-youth-apprentice',
    'Mentors in masonry, tailoring, and light mechanics for out-of-school youth.',
    'development',
    'development',
    false,
    'https://picsum.photos/seed/qa-cr-dev-3/1100/620',
    'Youth apprenticeship',
    '',
    10430,
    10
  ),
  (
    'QA · Market day pop-up for women-led MSMEs',
    'qa-bulk-news-dev-msme-market',
    'Access to stalls, weighing tools, and basic bookkeeping refresher.',
    'development',
    'development',
    false,
    'https://picsum.photos/seed/qa-cr-dev-4/1100/620',
    'Market vendors',
    '',
    10420,
    12
  ),
  -- Social welfare pillar
  (
    'QA · Shelter support after heavy rains',
    'qa-bulk-news-social-shelter-rains',
    'Emergency shelter materials and follow-up with diocesan social teams.',
    'social',
    'social-welfare',
    false,
    'https://picsum.photos/seed/qa-cr-sw-1/1100/620',
    'Emergency shelter support',
    '',
    10410,
    8
  ),
  (
    'QA · Disability inclusion in parish outreach',
    'qa-bulk-news-social-disability-inclusion',
    'Ramps, referral cards, and accompaniment to health and legal services.',
    'social',
    'social-welfare',
    false,
    'https://picsum.photos/seed/qa-cr-sw-2/1100/620',
    'Inclusive outreach',
    '',
    10400,
    11
  ),
  (
    'QA · Orphans and vulnerable children catch-up groups',
    'qa-bulk-news-social-ovc-catchup',
    'After-school literacy and life-skills circles with volunteer tutors.',
    'social',
    'social-welfare',
    true,
    'https://picsum.photos/seed/qa-cr-sw-3/1100/620',
    'Children learning group',
    '',
    10390,
    4
  ),
  (
    'QA · Winterization kits distribution plan',
    'qa-bulk-news-social-winterization',
    'Blankets, soap, and dignity kits staged for highland parishes.',
    'social',
    'social-welfare',
    false,
    'https://picsum.photos/seed/qa-cr-sw-4/1100/620',
    'Relief supplies',
    '',
    10380,
    13
  ),
  -- Finance & administration pillar
  (
    'QA · Diocesan finance desks workshop',
    'qa-bulk-news-org-finance-desks',
    'Voucher trails, procurement notes, and donor reporting templates.',
    'organizational',
    'finance-administration',
    false,
    'https://picsum.photos/seed/qa-cr-fin-1/1100/620',
    'Finance training',
    '',
    10370,
    14
  ),
  (
    'QA · Audit readiness checklist rollout',
    'qa-bulk-news-org-audit-readiness',
    'Shared checklist for grants, partner visits, and asset registers.',
    'organizational',
    'finance-administration',
    false,
    'https://picsum.photos/seed/qa-cr-fin-2/1100/620',
    'Audit preparation',
    '',
    10360,
    15
  ),
  (
    'QA · Volunteer timekeeping pilot',
    'qa-bulk-news-org-volunteer-hours',
    'Simple monthly tallies for parish Caritas volunteers and stipend tracking.',
    'organizational',
    'finance-administration',
    false,
    'https://picsum.photos/seed/qa-cr-fin-3/1100/620',
    'Volunteer records',
    '',
    10350,
    16
  )
) AS v(title, slug, excerpt, cat, pillar_slug, featured, image_url, image_alt, external_url, sort_order, days_ago)
JOIN public.program_categories pc ON pc.slug = v.pillar_slug
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.news_articles (
  title,
  slug,
  excerpt,
  category,
  department_id,
  featured,
  image_url,
  image_alt,
  external_url,
  status,
  published_at,
  sort_order
)
VALUES (
  'QA · Caritas Africa peer exchange (no pillar)',
  'qa-bulk-news-international-peer-exchange',
  'Regional learning visit — story kept on international lane without department_id.',
  'international'::public.news_article_category,
  NULL,
  false,
  'https://picsum.photos/seed/qa-cr-intl-1/1100/620',
  'Regional exchange',
  '',
  'published'::public.news_article_status,
  now() - interval '45 days',
  10340
),
(
  'QA · Humanitarian principles refresher webinar',
  'qa-bulk-news-international-principles-webinar',
  'Cross-cutting webinar; optional null department for filter edge cases.',
  'international'::public.news_article_category,
  NULL,
  false,
  'https://picsum.photos/seed/qa-cr-intl-2/1100/620',
  'Webinar',
  '',
  'published'::public.news_article_status,
  now() - interval '50 days',
  10330
)
ON CONFLICT (slug) DO NOTHING;

--------------------------------------------------------------------------------
-- Programs (rich bodies for “full story” / related hub testing)
--------------------------------------------------------------------------------

INSERT INTO public.programs (
  category_id,
  title,
  slug,
  excerpt,
  body,
  cover_image_url,
  cover_image_alt,
  external_url,
  tag_label,
  tag_icon,
  featured,
  status,
  published_at,
  sort_order
)
SELECT
  pc.id,
  v.title,
  v.slug,
  v.excerpt,
  v.body,
  v.cover_url,
  v.cover_alt,
  '',
  v.tag_label,
  v.tag_icon,
  v.featured,
  'published'::public.program_status,
  now() - (v.days_ago || ' days')::interval,
  v.sort_order
FROM (VALUES
  (
    'health',
    'QA · Gikuriro-style nutrition and ECD windows',
    'qa-bulk-prog-gikuriro-nutrition-ecd',
    'Community-led nutrition screening, caregiver groups, and ECD play corners — QA synthetic description.',
    '<p>This <strong>QA programme page</strong> exercises rich text, lists, and the program detail layout. Public Caritas Rwanda work includes nutrition and early childhood programming; this body is <em>not</em> an official project description.</p><h2>What we simulate testing</h2><ul><li>Paragraph flow and heading hierarchy</li><li>Related content grouped by pillar</li><li>News deep links and publication anchors</li></ul><p>Second paragraph to stretch the “full story” expander and typography against the campaign-style two-column grid.</p>',
    'https://picsum.photos/seed/qa-pr-health-1/1200/750',
    'Nutrition and ECD programme',
    'Nutrition',
    'fa-solid fa-bowl-food',
    true,
    10600,
    2
  ),
  (
    'health',
    'QA · Community health and WASH accompaniment',
    'qa-bulk-prog-wash-accompaniment',
    'QA synthetic programme: hygiene promotion, water committees, and referral to facilities.',
    '<p>Testing <strong>sanitizeStaffRichText</strong> output with blockquote:</p><blockquote>Local volunteers coordinate small repairs and report breakdowns to the district water point focal.</blockquote><p>Follow-up lists:</p><ol><li>Committee training</li><li>Post-repair monitoring</li><li>School hand-washing corners</li></ol>',
    'https://picsum.photos/seed/qa-pr-health-2/1200/750',
    'WASH programme imagery',
    'WASH',
    'fa-solid fa-droplet',
    false,
    10610,
    5
  ),
  (
    'health',
    'QA · Parish ECD learning corners rollout',
    'qa-bulk-prog-parish-ecd-corners',
    'QA synthetic ECD corners with toy kits and caregiver coaching — inspired by common ECD approaches.',
    '<p>Short programme story for <em>related programs</em> lists under the Health pillar.</p>',
    'https://picsum.photos/seed/qa-pr-health-3/1200/750',
    'ECD corner',
    'ECD',
    'fa-solid fa-child-reaching',
    false,
    10620,
    9
  ),
  (
    'development',
    'QA · Livelihoods and cooperative strengthening',
    'qa-bulk-prog-livelihoods-coops',
    'QA synthetic agriculture and cooperative programme: storage, grading, and market linkages.',
    '<p>Development pillar body with <a href="https://caritasrwanda.org" rel="nofollow">sample external link</a> for QA.</p><h2>Cooperative tracks</h2><ul><li>Post-harvest loss reduction</li><li>Group savings touchpoints</li><li>Simple cooperative governance</li></ul>',
    'https://picsum.photos/seed/qa-pr-dev-1/1200/750',
    'Cooperative agriculture',
    'Livelihoods',
    'fa-solid fa-tractor',
    true,
    10630,
    3
  ),
  (
    'development',
    'QA · Youth skills and apprenticeship bridges',
    'qa-bulk-prog-youth-apprenticeship',
    'QA synthetic youth programme: mentorship, toolkits, and post-training follow-up.',
    '<p>Youth pillar content for grids and filters.</p>',
    'https://picsum.photos/seed/qa-pr-dev-2/1200/750',
    'Youth skills',
    'Youth',
    'fa-solid fa-hammer',
    false,
    10640,
    7
  ),
  (
    'development',
    'QA · Climate-smart field demonstrations',
    'qa-bulk-prog-climate-demos',
    'QA synthetic demos: terraces, cover crops, and seasonal planning with extension partners.',
    '<p>Paragraph for climate-smart testing.</p>',
    'https://picsum.photos/seed/qa-pr-dev-3/1200/750',
    'Field demonstration',
    'Climate-smart',
    'fa-solid fa-cloud-sun',
    false,
    10650,
    11
  ),
  (
    'social-welfare',
    'QA · Social protection and emergency response windows',
    'qa-bulk-prog-social-protection-emergency',
    'QA synthetic social welfare programme: shelter materials, vulnerability mapping, referrals.',
    '<p>Social welfare <strong>full story</strong> block.</p><blockquote>Parish teams prioritize elderly-headed households and persons with disabilities for accompaniment.</blockquote>',
    'https://picsum.photos/seed/qa-pr-sw-1/1200/750',
    'Emergency social support',
    'Protection',
    'fa-solid fa-hand-holding-heart',
    false,
    10660,
    4
  ),
  (
    'social-welfare',
    'QA · OVC education catch-up circles',
    'qa-bulk-prog-ovc-catchup',
    'QA synthetic OVC programme: literacy circles, life skills, and caregiver evenings.',
    '<p>Catch-up programme body.</p>',
    'https://picsum.photos/seed/qa-pr-sw-2/1200/750',
    'Children study circle',
    'OVC',
    'fa-solid fa-book-open-reader',
    true,
    10670,
    6
  ),
  (
    'finance-administration',
    'QA · Financial stewardship and reporting hygiene',
    'qa-bulk-prog-finance-stewardship',
    'QA synthetic governance programme: transparent books, donor reports, and asset registers.',
    '<p>Finance pillar programme for related hub and <em>publications</em> cross-links.</p><ul><li>Voucher filing</li><li>Grant folders</li><li>Partner visit packs</li></ul>',
    'https://picsum.photos/seed/qa-pr-fin-1/1200/750',
    'Finance stewardship',
    'Stewardship',
    'fa-solid fa-file-invoice-dollar',
    false,
    10680,
    8
  ),
  (
    'finance-administration',
    'QA · Diocesan Caritas desk capacity building',
    'qa-bulk-prog-diocesan-desk-capacity',
    'QA synthetic capacity building for parish desks: archiving, procurement steps, HR notes.',
    '<p>Short body for second finance programme.</p>',
    'https://picsum.photos/seed/qa-pr-fin-2/1200/750',
    'Desk capacity',
    'Capacity',
    'fa-solid fa-building-columns',
    false,
    10690,
    12
  )
) AS v(pillar_slug, title, slug, excerpt, body, cover_url, cover_alt, tag_label, tag_icon, featured, sort_order, days_ago)
JOIN public.program_categories pc ON pc.slug = v.pillar_slug
ON CONFLICT (slug) DO NOTHING;

--------------------------------------------------------------------------------
-- Publications: success stories, recent updates, newsletters
--------------------------------------------------------------------------------

INSERT INTO public.publications (
  category_id,
  department_id,
  title,
  slug,
  excerpt,
  body,
  cover_image_url,
  cover_image_alt,
  file_url,
  external_url,
  meta_line,
  period_label,
  tag_label,
  tag_icon,
  featured,
  status,
  published_at,
  sort_order,
  custom_fields
)
SELECT
  cat.id,
  pc.id,
  v.title,
  v.slug,
  v.excerpt,
  v.body,
  v.cover_url,
  v.cover_alt,
  coalesce(v.file_url, ''),
  coalesce(v.external_url, ''),
  v.meta_line,
  v.period_label,
  v.tag_label,
  v.tag_icon,
  false,
  'published'::public.publication_status,
  now() - (v.days_ago || ' days')::interval,
  v.sort_order,
  '{}'::jsonb
FROM (VALUES
  -- success_story
  (
    'success_story',
    'health',
    'QA success story · Mother support group turnover',
    'qa-bulk-pub-success-mother-group',
    'Synthetic success story tied to Health — peer learning and growth monitoring.',
    '<p>Success story <strong>body</strong> for publications layout and RPC grouping.</p>',
    'https://picsum.photos/seed/qa-pub-ss-h1/1000/680',
    'Mothers group',
    '',
    '',
    'QA · Success story',
    '2026',
    'Health',
    'fa-solid fa-star',
    10700,
    3
  ),
  (
    'success_story',
    'development',
    'QA success story · Cooperative first bulk sale',
    'qa-bulk-pub-success-cooperative-sale',
    'Synthetic milestone: first graded bulk sale and reinvestment in storage.',
    '<p>Development success story paragraph.</p>',
    'https://picsum.photos/seed/qa-pub-ss-d1/1000/680',
    'Harvest bags',
    '',
    '',
    'QA · Success story',
    '2026',
    'Development',
    'fa-solid fa-star',
    10710,
    5
  ),
  (
    'success_story',
    'social-welfare',
    'QA success story · Temporary shelter extension',
    'qa-bulk-pub-success-shelter-extension',
    'Synthetic outcome: safer roofing and drainage for affected households.',
    '<p>Social welfare success story.</p>',
    'https://picsum.photos/seed/qa-pub-ss-s1/1000/680',
    'Shelter repair',
    '',
    '',
    'QA · Success story',
    '2026',
    'Social Welfare',
    'fa-solid fa-star',
    10720,
    7
  ),
  (
    'success_story',
    'finance-administration',
    'QA success story · Clean audit trail at parish desk',
    'qa-bulk-pub-success-audit-trail',
    'Synthetic: improved filing and voucher discipline before partner review.',
    '<p>Finance success story body.</p>',
    'https://picsum.photos/seed/qa-pub-ss-f1/1000/680',
    'Filing desk',
    '',
    '',
    'QA · Success story',
    '2026',
    'Finance',
    'fa-solid fa-star',
    10730,
    9
  ),
  -- recent_update (some with external)
  (
    'recent_update',
    'health',
    'QA update · Partner article on community clinics',
    'qa-bulk-pub-update-health-partner',
    'Short update pointing to external read — tests external URL resolution.',
    NULL,
    'https://picsum.photos/seed/qa-pub-ru-h/900/500',
    'Partner update cover',
    '',
    'https://caritasrwanda.org/',
    'QA · Recent update',
    '',
    'Health',
    'fa-solid fa-rss',
    10740,
    1
  ),
  (
    'recent_update',
    'development',
    'QA update · District ag fair invitation',
    'qa-bulk-pub-update-dev-fair',
    'Synthetic invite blurb for fair booth and cooperative display.',
    NULL,
    'https://picsum.photos/seed/qa-pub-ru-d/900/500',
    'Fair invitation cover',
    '',
    '',
    'QA · Recent update',
    '',
    'Development',
    'fa-solid fa-rss',
    10750,
    2
  ),
  (
    'recent_update',
    'social-welfare',
    'QA update · Cold season advisory',
    'qa-bulk-pub-update-sw-advisory',
    'Synthetic advisory on layering kits and referral hotlines.',
    NULL,
    'https://picsum.photos/seed/qa-pub-ru-sw/900/500',
    'Advisory cover',
    '',
    '',
    'QA · Recent update',
    '',
    'Social Welfare',
    'fa-solid fa-rss',
    10760,
    4
  ),
  (
    'recent_update',
    'finance-administration',
    'QA update · Reporting calendar reminder',
    'qa-bulk-pub-update-fin-calendar',
    'Synthetic reminder for quarterly narrative and finance templates.',
    NULL,
    'https://picsum.photos/seed/qa-pub-ru-f/900/500',
    'Reporting calendar cover',
    '',
    '',
    'QA · Recent update',
    'Q1',
    'Finance',
    'fa-solid fa-rss',
    10770,
    6
  ),
  -- newsletter (PDF-style — placeholder file URL for QA downloads)
  (
    'newsletter',
    'health',
    'QA newsletter · Health desk quarterly PDF',
    'qa-bulk-pub-newsletter-health-q1',
    'Placeholder quarterly bulletin for Health pillar testing.',
    NULL,
    'https://picsum.photos/seed/qa-pub-nl-h/900/1200',
    'Newsletter cover',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    '',
    'QA · Newsletter',
    'Q1 demo',
    'Health desk',
    'fa-solid fa-newspaper',
    10780,
    8
  ),
  (
    'newsletter',
    'development',
    'QA newsletter · Livelihoods bulletin',
    'qa-bulk-pub-newsletter-dev-bulletin',
    'Placeholder PDF bulletin for Development pillar.',
    NULL,
    'https://picsum.photos/seed/qa-pub-nl-d/900/1200',
    'Bulletin cover',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    '',
    'QA · Newsletter',
    'March demo',
    'Livelihoods',
    'fa-solid fa-newspaper',
    10790,
    10
  ),
  (
    'newsletter',
    'social-welfare',
    'QA newsletter · Social mission wrap-up',
    'qa-bulk-pub-newsletter-sw-wrap',
    'Placeholder wrap-up PDF for Social Welfare.',
    NULL,
    'https://picsum.photos/seed/qa-pub-nl-s/900/1200',
    'Wrap-up cover',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    '',
    'QA · Newsletter',
    'Feb demo',
    'Social Welfare',
    'fa-solid fa-newspaper',
    10800,
    11
  )
) AS v(
  cat_slug,
  pillar_slug,
  title,
  slug,
  excerpt,
  body,
  cover_url,
  cover_alt,
  file_url,
  external_url,
  meta_line,
  period_label,
  tag_label,
  tag_icon,
  sort_order,
  days_ago
)
JOIN public.publication_categories cat ON cat.slug = v.cat_slug
JOIN public.program_categories pc ON pc.slug = v.pillar_slug
ON CONFLICT (slug) DO NOTHING;

--------------------------------------------------------------------------------
-- Newsletter subscribers (dashboard broadcast / CSV testing)
--------------------------------------------------------------------------------

INSERT INTO public.newsletter_subscribers (email, unsubscribe_token, status)
SELECT
  v.email,
  replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  'active'
FROM (VALUES
  ('qa-bulk-subscriber-01@example.test'),
  ('qa-bulk-subscriber-02@example.test'),
  ('qa-bulk-subscriber-03@example.test'),
  ('qa-bulk-subscriber-04@example.test'),
  ('qa-bulk-subscriber-05@example.test'),
  ('qa-bulk-subscriber-06@example.test'),
  ('qa-bulk-subscriber-07@example.test'),
  ('qa-bulk-subscriber-08@example.test')
) AS v(email)
ON CONFLICT (email_normalized) DO NOTHING;

INSERT INTO public.newsletter_subscribers (email, unsubscribe_token, status, unsubscribed_at)
SELECT
  'qa-bulk-unsub-01@example.test',
  replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  'unsubscribed',
  now() - interval '2 days'
WHERE NOT EXISTS (
  SELECT 1 FROM public.newsletter_subscribers s
  WHERE s.email_normalized = 'qa-bulk-unsub-01@example.test'
);
