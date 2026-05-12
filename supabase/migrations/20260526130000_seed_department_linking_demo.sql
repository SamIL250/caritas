-- Demo seed data for testing department / pillar linking (news, publications, programs).
-- Slugs are prefixed with `demo-dept-` so they do not collide with legacy CMS seeds.
-- Safe to re-apply: INSERT ... ON CONFLICT (slug) DO NOTHING on each table.

--------------------------------------------------------------------------------
-- News (mixed pillars + one international row with NULL department_id)
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
SELECT
  'Demo · Village health screenings reach 2,000 families',
  'demo-dept-news-health-screenings',
  'Seed story for Health pillar filters and related-content RPC.',
  'health'::public.news_article_category,
  pc.id,
  false,
  'https://caritasrwanda.org/wp-content/uploads/2026/01/WhatsApp-Image-2025-12-21-at-18.53.37-scaled.jpeg',
  'Health outreach demo',
  '',
  'published'::public.news_article_status,
  now() - interval '11 days',
  8510
FROM public.program_categories pc
WHERE pc.slug = 'health'
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
SELECT
  'Demo · Cooperative storage boosts farmer incomes',
  'demo-dept-news-dev-cooperative-storage',
  'Seed story for Development pillar.',
  'development'::public.news_article_category,
  pc.id,
  false,
  'https://caritasrwanda.org/wp-content/uploads/2026/02/162A7632-scaled.jpg',
  'Development demo',
  '',
  'published'::public.news_article_status,
  now() - interval '12 days',
  8520
FROM public.program_categories pc
WHERE pc.slug = 'development'
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
SELECT
  'Demo · Social protection enrolment drive',
  'demo-dept-news-social-protection-drive',
  'Seed story for Social Welfare pillar.',
  'social'::public.news_article_category,
  pc.id,
  false,
  'https://caritasrwanda.org/wp-content/uploads/2026/01/162A7245-scaled.jpg',
  'Social welfare demo',
  '',
  'published'::public.news_article_status,
  now() - interval '13 days',
  8530
FROM public.program_categories pc
WHERE pc.slug = 'social-welfare'
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
SELECT
  'Demo · Finance transparency workshop for diocesan teams',
  'demo-dept-news-finance-transparency-workshop',
  'Seed story for Finance & Administration pillar.',
  'organizational'::public.news_article_category,
  pc.id,
  false,
  'https://caritasrwanda.org/wp-content/uploads/2026/03/162A8733-scaled.jpg',
  'Finance demo',
  '',
  'published'::public.news_article_status,
  now() - interval '14 days',
  8540
FROM public.program_categories pc
WHERE pc.slug = 'finance-administration'
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
  'Demo · Regional Caritas coordination note',
  'demo-dept-news-international-no-dept',
  'International-category seed with no pillar assignment (department_id NULL).',
  'international'::public.news_article_category,
  NULL,
  false,
  'https://caritasrwanda.org/wp-content/uploads/2026/03/162A7732-scaled.jpg',
  'International demo',
  '',
  'published'::public.news_article_status,
  now() - interval '15 days',
  8550
)
ON CONFLICT (slug) DO NOTHING;

--------------------------------------------------------------------------------
-- Publications: success stories + recent update (aligned with RPC defaults)
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
  'Demo success story · Nutrition circles for mothers',
  'demo-dept-success-story-nutrition-circles',
  'Rich-text success story linked to Health for pillar testing.',
  '<p>Placeholder body: mothers meet weekly to learn complementary feeding and hygiene.</p>',
  'https://caritasrwanda.org/wp-content/uploads/2026/01/162A7077-scaled.jpg',
  'Nutrition circles',
  '',
  '',
  'Seed · Success Story',
  '',
  'Health',
  'fa-solid fa-heart-pulse',
  false,
  'published'::public.publication_status,
  now() - interval '4 days',
  9510,
  '{}'::jsonb
FROM public.publication_categories cat
CROSS JOIN public.program_categories pc
WHERE cat.slug = 'success_story'
  AND pc.slug = 'health'
ON CONFLICT (slug) DO NOTHING;

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
  'Demo success story · Youth apprentices graduate',
  'demo-dept-success-story-youth-apprentices',
  'Success story under Development pillar.',
  '<p>Placeholder body: vocational track graduates receive toolkits and coaching.</p>',
  'https://caritasrwanda.org/wp-content/uploads/2026/03/162A9069-scaled.jpg',
  'Youth apprenticeship',
  '',
  '',
  'Seed · Success Story',
  '',
  'Development',
  'fa-solid fa-seedling',
  false,
  'published'::public.publication_status,
  now() - interval '6 days',
  9520,
  '{}'::jsonb
FROM public.publication_categories cat
CROSS JOIN public.program_categories pc
WHERE cat.slug = 'success_story'
  AND pc.slug = 'development'
ON CONFLICT (slug) DO NOTHING;

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
  'Demo success story · Emergency shelter network',
  'demo-dept-success-story-shelter-network',
  'Success story under Social Welfare pillar.',
  '<p>Placeholder body: diocesan partners expand temporary shelter capacity.</p>',
  'https://caritasrwanda.org/wp-content/uploads/2026/02/162A7529-scaled.jpg',
  'Shelter programme',
  '',
  '',
  'Seed · Success Story',
  '',
  'Social Welfare',
  'fa-solid fa-people-roof',
  false,
  'published'::public.publication_status,
  now() - interval '7 days',
  9530,
  '{}'::jsonb
FROM public.publication_categories cat
CROSS JOIN public.program_categories pc
WHERE cat.slug = 'success_story'
  AND pc.slug = 'social-welfare'
ON CONFLICT (slug) DO NOTHING;

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
  'Demo recent update · External partner briefing',
  'demo-dept-recent-update-partner-briefing',
  'Short external-link style publication for Recent Updates.',
  NULL,
  '',
  '',
  '',
  'https://caritasrwanda.org/',
  'Seed · Recent Update',
  '',
  'Development',
  'fa-solid fa-rss',
  false,
  'published'::public.publication_status,
  now() - interval '2 days',
  9540,
  '{}'::jsonb
FROM public.publication_categories cat
CROSS JOIN public.program_categories pc
WHERE cat.slug = 'recent_update'
  AND pc.slug = 'development'
ON CONFLICT (slug) DO NOTHING;

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
  'Demo annual highlight · Finance stewardship note',
  'demo-dept-annual-report-sidebar-note',
  'PDF-style publication with Finance pillar (not in default RPC slug list — visible on /publications).',
  NULL,
  'https://caritasrwanda.org/wp-content/uploads/2025/03/plan-strategic.jpg',
  'Report cover placeholder',
  '',
  '',
  'PDF · Demo seed',
  'FY demo',
  'Finance & Administration',
  'fa-solid fa-chart-bar',
  false,
  'published'::public.publication_status,
  now() - interval '20 days',
  9550,
  '{}'::jsonb
FROM public.publication_categories cat
CROSS JOIN public.program_categories pc
WHERE cat.slug = 'annual_report'
  AND pc.slug = 'finance-administration'
ON CONFLICT (slug) DO NOTHING;

--------------------------------------------------------------------------------
-- Programs (same pillar axis — feeds get_department_related_content)
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
  'Demo program · ECD learning corners',
  'demo-dept-program-ecd-learning-corners',
  'Published program article tied to Health pillar.',
  '<p>Demo programme body for related listings.</p>',
  'https://caritasrwanda.org/wp-content/uploads/2026/01/162A7077-scaled.jpg',
  'ECD demo',
  '',
  '',
  '',
  false,
  'published'::public.program_status,
  now() - interval '3 days',
  9610
FROM public.program_categories pc
WHERE pc.slug = 'health'
ON CONFLICT (slug) DO NOTHING;

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
  'Demo program · Irrigation cooperatives',
  'demo-dept-program-irrigation-cooperatives',
  'Published program article tied to Development pillar.',
  '<p>Demo programme body.</p>',
  'https://caritasrwanda.org/wp-content/uploads/2026/02/162A7632-scaled.jpg',
  'Irrigation demo',
  '',
  '',
  '',
  false,
  'published'::public.program_status,
  now() - interval '5 days',
  9620
FROM public.program_categories pc
WHERE pc.slug = 'development'
ON CONFLICT (slug) DO NOTHING;

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
  'Demo program · Safeguarding refresher',
  'demo-dept-program-safeguarding-refresher',
  'Published program article tied to Finance & Administration pillar.',
  '<p>Demo programme body.</p>',
  'https://caritasrwanda.org/wp-content/uploads/2026/03/162A8733-scaled.jpg',
  'Safeguarding demo',
  '',
  '',
  '',
  false,
  'published'::public.program_status,
  now() - interval '8 days',
  9630
FROM public.program_categories pc
WHERE pc.slug = 'finance-administration'
ON CONFLICT (slug) DO NOTHING;
