-- News articles CMS + singleton page chrome (hero / newsletter).

create type news_article_category as enum (
  'development',
  'health',
  'organizational',
  'international',
  'social'
);
create type news_article_status as enum ('draft', 'published');
create table public.news_page_settings (
  id smallint primary key default 1,
  constraint news_page_settings_single_row check (id = 1),
  hero_eyebrow text not null default 'Latest from Caritas Rwanda',
  hero_headline_prefix text not null default 'News &',
  hero_headline_accent text not null default 'Updates',
  hero_intro text not null default 'Stories of impact, programme launches, and community voices from across Rwanda''s diocesan Caritas networks.',
  hero_image_url text,
  newsletter_title text not null default 'Stay connected',
  newsletter_body text not null default 'Follow Caritas Rwanda for programme news and humanitarian updates across all dioceses.',
  updated_at timestamptz not null default now()
);
insert into public.news_page_settings (id) values (1);
create table public.news_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  excerpt text not null default '',
  body text,
  category news_article_category not null default 'development',
  featured boolean not null default false,
  image_url text not null,
  image_alt text not null default '',
  external_url text not null default '',
  status news_article_status not null default 'draft',
  published_at timestamptz,
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_articles_slug_unique unique (slug)
);
create index news_articles_status_published_at_idx on public.news_articles (status, published_at desc);
create index news_articles_featured_sort_idx on public.news_articles (featured desc, sort_order asc);
create or replace function public.news_articles_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
create trigger news_articles_updated_at
  before update on public.news_articles
  for each row execute function public.news_articles_set_updated_at();
create or replace function public.news_page_settings_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
create trigger news_page_settings_updated_at
  before update on public.news_page_settings
  for each row execute function public.news_page_settings_set_updated_at();
alter table public.news_articles enable row level security;
alter table public.news_page_settings enable row level security;
-- Anonymous + everyone: published stories only (public site uses anon key)
create policy "news_articles_select_published"
  on public.news_articles
  for select
  using (status = 'published'::news_article_status);
-- Authenticated CMS users: full access (drafts etc.)
create policy "news_articles_staff_all"
  on public.news_articles
  for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());
create policy "news_page_settings_select_public"
  on public.news_page_settings
  for select
  using (true);
create policy "news_page_settings_staff_write"
  on public.news_page_settings
  for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());
-- Seed rows (adapted from CMS seed content)
insert into public.news_articles (
  title, slug, excerpt, category, featured, image_url, image_alt, external_url,
  status, published_at, sort_order
)
values
(
  'Caritas Humanitarian Conference in Kigali',
  'caritas-humanitarian-conference-kigali',
  'From 3 to 5 March 2026, leaders from across the Caritas Internationalis Confederation gathered in Kigali for the Humanitarian Conference 2026, held under the theme: "Rooted in Compassion, Rising to the Challenge: Caritas Humanitarian Action in a Changing World."',
  'international', true,
  'https://caritasrwanda.org/wp-content/uploads/2026/03/162A7732-scaled.jpg',
  'Caritas Humanitarian Conference in Kigali',
  'https://caritasrwanda.org/caritas-humanitarian-conference-in-kigali/',
  'published', '2026-03-09T12:00:00Z'::timestamptz, 10
),
(
  'From Field Agents to Private Service Providers (PSPs)',
  'field-agents-private-service-providers',
  '24 field agents from the Gera Ku Ntego Youth Project in Rwamagana and Kayonza districts have officially graduated as Private Service Providers — a significant milestone in their entrepreneurship journey.',
  'development', false,
  'https://caritasrwanda.org/wp-content/uploads/2026/03/162A9069-scaled.jpg',
  'From Field Agents to Private Service Providers',
  'https://caritasrwanda.org/from-field-agents-to-private-service-providers-psps/',
  'published', '2026-03-30T12:00:00Z'::timestamptz, 20
),
(
  '2026 General Assembly of Caritas Rwanda',
  '2026-general-assembly-caritas-rwanda',
  'The 29th General Assembly of Caritas Rwanda was held at Centre Saint Vincent Pallotti-Gikondo from March 23–24, 2026. The assembly reviewed 2025 achievements and set priorities for 2026.',
  'organizational', false,
  'https://caritasrwanda.org/wp-content/uploads/2026/03/162A8733-scaled.jpg',
  '2026 General Assembly',
  'https://caritasrwanda.org/2026-general-assembly-of-caritas-rwanda/',
  'published', '2026-03-30T12:00:00Z'::timestamptz, 30
),
(
  'Tunga Project Officially Launched in Kirehe District',
  'tunga-project-launched-kirehe',
  'In partnership with Kirehe District, Caritas Rwanda and Caritas Kibungo launched the three-year Tunga Project, funded by the Slovenian Ministry of Foreign Affairs, to enhance conditions for 3,500 vulnerable households.',
  'development', false,
  'https://caritasrwanda.org/wp-content/uploads/2026/02/162A7632-scaled.jpg',
  'Tunga Project Kirehe',
  'https://caritasrwanda.org/tunga-project-officially-launched-in-kirehe-district/',
  'published', '2026-02-17T12:00:00Z'::timestamptz, 40
),
(
  'Caritas Rwanda and Diocesan Caritas Review 2025 Achievements',
  'review-2025-diocesan-caritas',
  'Caritas Rwanda brought together all Diocesan Caritas partners to review accomplishments of 2025 and align strategic priorities for the year ahead, reinforcing collective commitment to the most vulnerable.',
  'organizational', false,
  'https://caritasrwanda.org/wp-content/uploads/2026/02/162A7529-scaled.jpg',
  'Review Meeting 2025',
  'https://caritasrwanda.org/caritas-rwanda-and-diocesan-caritas-met-to-review-2025-achievements-and-plan-for-2026/',
  'published', '2026-02-03T12:00:00Z'::timestamptz, 50
),
(
  'Male Engagement in ECD Helps Children Thrive in Complete Families',
  'male-engagement-ecd-thrive',
  'In Gatsibo District, the "Papa Rumuri" initiative launched by Caritas Rwanda with Plan International Rwanda has significantly improved children''s wellbeing by enabling fathers to take active roles in early childcare.',
  'health', false,
  'https://caritasrwanda.org/wp-content/uploads/2026/01/WhatsApp-Image-2025-12-21-at-18.53.37-scaled.jpeg',
  'Male Engagement ECD',
  'https://caritasrwanda.org/male-engagement-in-early-childhood-development-helps-children-thrive-in-complete-families/',
  'published', '2026-01-09T12:00:00Z'::timestamptz, 60
),
(
  'Savings Groups Empower Parents to Care for Children in HBECD',
  'savings-groups-hbecd',
  'Savings and lending groups supported by the ECD Project are empowering parents financially, enabling them to provide better care for their children enrolled in home-based early childhood development centres.',
  'social', false,
  'https://caritasrwanda.org/wp-content/uploads/2026/01/162A7245-scaled.jpg',
  'Savings Groups ECD',
  'https://caritasrwanda.org/savings-groups-supported-by-the-ecd-project-empower-parents-to-care-for-their-children-in-hbecd/',
  'published', '2026-01-08T12:00:00Z'::timestamptz, 70
),
(
  'Nyaruguru ECDs Known for Good Service with Caritas Rwanda & Plan International',
  'nyaruguru-ecd-good-service',
  'Early Childhood Development centres in Nyaruguru District, supported by Caritas Rwanda and Plan International Rwanda, have earned recognition for their outstanding quality of care and community-centred approach.',
  'health', false,
  'https://caritasrwanda.org/wp-content/uploads/2026/01/162A7077-scaled.jpg',
  'Nyaruguru ECD',
  'https://caritasrwanda.org/nyaruguru-early-childhood-development-centres-known-for-good-service-with-caritas-rwanda-and-plan-international/',
  'published', '2026-01-07T12:00:00Z'::timestamptz, 80
);
