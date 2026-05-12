-- Publications CMS: PDFs, newsletters, strategic plan, success stories, recent updates.
-- Website + Dashboard → table `publications`; CMS page slug `publications` with section `publications_library`.

create type public.publication_category as enum (
  'annual_report',
  'newsletter',
  'strategic_plan',
  'success_story',
  'recent_update'
);

create type public.publication_status as enum ('draft', 'published');

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  category public.publication_category not null,
  title text not null,
  slug text not null,
  excerpt text not null default '',
  body text,
  cover_image_url text not null default '',
  cover_image_alt text not null default '',
  file_url text not null default '',
  external_url text not null default '',
  meta_line text not null default '',
  period_label text not null default '',
  tag_label text not null default '',
  tag_icon text not null default '',
  featured boolean not null default false,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  sort_order int not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint publications_slug_unique unique (slug)
);

create index publications_category_status_idx on public.publications (category, status);
create index publications_status_sort_idx on public.publications (status, sort_order, published_at desc nulls last);

create or replace function public.publications_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger publications_updated_at
  before update on public.publications
  for each row execute function public.publications_set_updated_at();

alter table public.publications enable row level security;

create policy "publications_select_published"
  on public.publications
  for select
  using (status = 'published'::public.publication_status);

create policy "publications_staff_all"
  on public.publications
  for all
  using (public.is_authenticated_staff())
  with check (public.is_authenticated_staff());

insert into public.section_templates (type, label, description, icon, default_content)
values (
  'publications_library',
  'Publications library',
  'Annual reports, newsletters, strategic plan, success stories and recent updates — managed under Dashboard → Publications.',
  'BookMarked',
  '{}'::jsonb
)
on conflict (type) do update set
  label = excluded.label,
  description = excluded.description,
  icon = excluded.icon,
  default_content = excluded.default_content;

insert into public.pages (title, slug, status, meta)
select
  'Publications',
  'publications',
  'published'::public.page_status,
  jsonb_build_object(
    'seo_title',
    'Publications & Resources — Caritas Rwanda',
    'seo_description',
    'Annual reports, newsletters, strategic plans, success stories and updates from Caritas Rwanda.'
  )
where not exists (select 1 from public.pages p where p.slug = 'publications');

update public.pages
set
  title = 'Publications',
  status = 'published'::public.page_status,
  meta = jsonb_build_object(
    'seo_title',
    'Publications & Resources — Caritas Rwanda',
    'seo_description',
    'Annual reports, newsletters, strategic plans, success stories and updates from Caritas Rwanda.'
  ),
  updated_at = now()
where slug = 'publications';

insert into public.hero_content (
  page_id,
  heading,
  subheading,
  cta_text,
  cta_url,
  image_url,
  options
)
select
  p.id,
  'Publications &',
  'Annual reports, newsletters, strategic frameworks, and real stories of transformation — transparency and knowledge from Caritas Rwanda.',
  '',
  '',
  '',
  jsonb_strip_nulls(jsonb_build_object(
    'align', 'center',
    'overlay_opacity', 0.55,
    'text_color', '#ffffff',
    'badge_text', 'Knowledge & Transparency',
    'heading_accent', 'Resources'
  ))
from public.pages p
where p.slug = 'publications'
  and not exists (select 1 from public.hero_content h where h.page_id = p.id);

update public.hero_content hc
set
  heading = 'Publications &',
  subheading =
    'Annual reports, newsletters, strategic frameworks, and real stories of transformation — transparency and knowledge from Caritas Rwanda.',
  cta_text = '',
  cta_url = '',
  image_url = '',
  options = jsonb_strip_nulls(jsonb_build_object(
    'align', 'center',
    'overlay_opacity', 0.55,
    'text_color', '#ffffff',
    'badge_text', 'Knowledge & Transparency',
    'heading_accent', 'Resources'
  )),
  updated_at = now()
from public.pages p
where hc.page_id = p.id
  and p.slug = 'publications';

insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'Publications library',
  'publications_library'::public.section_type,
  '{}'::jsonb,
  10,
  true,
  'publications_library'
from public.pages p
where p.slug = 'publications'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'publications_library'
  );

-- Seed content (adapted from original-web/publications.html)
insert into public.publications (
  category, title, slug, excerpt, cover_image_url, cover_image_alt,
  file_url, external_url, meta_line, period_label, tag_label, tag_icon,
  featured, status, published_at, sort_order
) values
(
  'strategic_plan'::public.publication_category,
  'Plan Stratégique Caritas Rwanda 2025 – 2030',
  'strategic-plan-caritas-rwanda-2025-2030',
  'The comprehensive strategic framework guiding direction, priorities and programmatic focus for 2025–2030.',
  'https://caritasrwanda.org/wp-content/uploads/2025/03/plan-strategic.jpg',
  'Strategic Plan 2025-2030 cover',
  'https://caritasrwanda.org/wp-content/uploads/2025/03/SPlan-Caritas-Rwanda-FNL-2530-20032025-Final-compressed.pdf',
  '',
  'PDF · English / French',
  '2025–2030',
  'Strategic Plan',
  'fa-solid fa-map',
  true,
  'published'::public.publication_status,
  '2025-03-20T12:00:00Z'::timestamptz,
  5
),
(
  'annual_report'::public.publication_category,
  'Caritas Rwanda Annual Report 2025',
  'annual-report-2025',
  'Year-end report on programmes and impact.',
  'https://caritasrwanda.org/wp-content/uploads/2026/03/Cover-Annual-report-2025-Caritas-Rwanda-200x200.png',
  '2025 Annual Report cover',
  'https://caritasrwanda.org/wp-content/uploads/2026/03/Caritas-Rwanda-2025-annual-report-2032026-1.pdf',
  '',
  'PDF',
  '2025',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2026-03-20T12:00:00Z'::timestamptz,
  10
),
(
  'annual_report'::public.publication_category,
  'Caritas Rwanda Annual Report 2024',
  'annual-report-2024',
  'Approved annual report.',
  'https://caritasrwanda.org/wp-content/uploads/2025/03/report2024-200x200.jpg',
  '2024 Annual Report cover',
  'https://caritasrwanda.org/wp-content/uploads/2025/03/Annual-report-fnl-2024-Approved-2-compressed.pdf',
  '',
  'PDF',
  '2024',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2025-03-01T12:00:00Z'::timestamptz,
  20
),
(
  'annual_report'::public.publication_category,
  'Caritas Rwanda Annual Report 2023',
  'annual-report-2023',
  'Annual performance and finances.',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/Screenshot-2025-02-27-131442-200x200.png',
  '2023 Annual Report cover',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/Caritas-Rwanda-2023-Report.pdf',
  '',
  'PDF',
  '2023',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2025-02-27T12:00:00Z'::timestamptz,
  30
),
(
  'annual_report'::public.publication_category,
  'Caritas Rwanda Annual Report 2022',
  'annual-report-2022',
  'Annual report.',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/Picture-report-2022-200x200.png',
  '2022 Annual Report cover',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/Caritas-Rwanda-Annual-Report-2022.pdf',
  '',
  'PDF',
  '2022',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2025-02-15T12:00:00Z'::timestamptz,
  40
),
(
  'annual_report'::public.publication_category,
  'Caritas Rwanda Annual Report 2021',
  'annual-report-2021',
  'Annual report with work plan context.',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/Picture-report-2021-200x200.png',
  '2021 Annual Report cover',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/Rapport-2021-Work-Plan-2022.pdf',
  '',
  'PDF',
  '2021',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2025-02-10T12:00:00Z'::timestamptz,
  50
),
(
  'annual_report'::public.publication_category,
  'Caritas Rwanda Annual Report 2020',
  'annual-report-2020',
  'Annual report.',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/Picture-report-2020-200x200.png',
  '2020 Annual Report cover',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/Caritas-Rwanda-Report-2020.pdf',
  '',
  'PDF',
  '2020',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2025-02-08T12:00:00Z'::timestamptz,
  60
),
(
  'annual_report'::public.publication_category,
  'Caritas Rwanda Rapport Annuel 2019',
  'annual-report-2019',
  'Annual report (French title).',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/Picture-report-2019-200x200.png',
  '2019 Annual Report cover',
  'https://caritasrwanda.org/wp-content/uploads/2022/08/Caritas-Rwanda-Rapport-Annuel-2019_0.pdf',
  '',
  'PDF',
  '2019',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2022-08-01T12:00:00Z'::timestamptz,
  70
),
(
  'annual_report'::public.publication_category,
  'Graduation Project Year-End Performance Report',
  'graduation-project-year-end-2022',
  'Graduation programme performance.',
  'https://caritasrwanda.org/wp-content/uploads/2022/09/pdf_placeholder-200x200.jpeg',
  'Graduation Project Report',
  'https://caritasrwanda.org/wp-content/uploads/2023/03/Graduation-Project-2022-Year-End-Performance-Report.pdf',
  '',
  'PDF',
  '2022',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2023-03-01T12:00:00Z'::timestamptz,
  80
);

insert into public.publications (
  category, title, slug, excerpt, cover_image_url, cover_image_alt,
  file_url, external_url, meta_line, period_label, tag_label, tag_icon,
  featured, status, published_at, sort_order
) values
(
  'newsletter'::public.publication_category,
  'Caritas Rwanda Newsletter Q4 2025',
  'newsletter-q4-2025',
  'Quarterly newsletter Oct–Dec 2025.',
  'https://caritasrwanda.org/wp-content/uploads/2026/02/Copy-of-Newsletter-October-December-2025-1.png',
  'Newsletter Oct–Dec 2025',
  'https://caritasrwanda.org/wp-content/uploads/2026/02/Newsletter-October-December-2025.pdf',
  '',
  'PDF',
  'Oct – Dec 2025',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2026-02-01T12:00:00Z'::timestamptz,
  100
),
(
  'newsletter'::public.publication_category,
  'Caritas Rwanda Newsletter Q3 2025',
  'newsletter-q3-2025',
  'Quarterly newsletter Jul–Sep 2025.',
  'https://caritasrwanda.org/wp-content/uploads/2026/02/Cover-Newsletter-July-September-2025.png',
  'Newsletter Jul–Sep 2025',
  'https://caritasrwanda.org/wp-content/uploads/2026/02/July-September-2025-Newsletter.pdf',
  '',
  'PDF',
  'Jul – Sep 2025',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2026-02-01T12:00:00Z'::timestamptz,
  110
),
(
  'newsletter'::public.publication_category,
  'Caritas Rwanda Newsletter Q2 2025',
  'newsletter-q2-2025',
  'Quarterly newsletter Apr–Jun 2025.',
  'https://caritasrwanda.org/wp-content/uploads/2026/02/Cover-Newsletter-April-June-2025.png',
  'Newsletter Apr–Jun 2025',
  'https://caritasrwanda.org/wp-content/uploads/2026/02/Newsletter-April-June-2025.pdf',
  '',
  'PDF',
  'Apr – Jun 2025',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2026-02-01T12:00:00Z'::timestamptz,
  120
),
(
  'newsletter'::public.publication_category,
  'Caritas Rwanda Newsletter Q1 2025',
  'newsletter-q1-2025',
  'Quarterly newsletter Jan–Mar 2025.',
  'https://caritasrwanda.org/wp-content/uploads/2025/06/Copy-of-January-March-2025-Newsletter.jpg',
  'Newsletter Jan–Mar 2025',
  'https://caritasrwanda.org/wp-content/uploads/2026/02/Newsletter-April-June-2025-OK.pdf',
  '',
  'PDF',
  'Jan – Mar 2025',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2026-02-01T12:00:00Z'::timestamptz,
  130
),
(
  'newsletter'::public.publication_category,
  'Caritas Rwanda Newsletter Q4 2024',
  'newsletter-q4-2024',
  'Quarterly newsletter Oct–Dec 2024.',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/Cover-page-October-December-2024-Newsletter.png',
  'Newsletter Q4 2024',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/October-December-2024-Newsletter-Final.pdf',
  '',
  'PDF',
  'Oct – Dec 2024',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2025-02-01T12:00:00Z'::timestamptz,
  140
),
(
  'newsletter'::public.publication_category,
  'Caritas Rwanda Newsletter Q3 2024',
  'newsletter-q3-2024',
  'Quarterly newsletter Jul–Sep 2024.',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/Cover-page-Newsletter-July-September-2024.png',
  'Newsletter Q3 2024',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/October-December-2024-Newsletter-Final.pdf',
  '',
  'PDF',
  'Jul – Sep 2024',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2025-02-01T12:00:00Z'::timestamptz,
  150
),
(
  'newsletter'::public.publication_category,
  'Caritas Rwanda Newsletter Q2 2024',
  'newsletter-q2-2024',
  'Quarterly newsletter Apr–Jun 2024.',
  'https://caritasrwanda.org/wp-content/uploads/2024/10/Screenshot-2024-10-28-080333.png',
  'Newsletter Q2 2024',
  'https://caritasrwanda.org/wp-content/uploads/2024/10/Newsletter-April-June-2024-OK.pdf',
  '',
  'PDF',
  'Apr – Jun 2024',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2024-10-28T12:00:00Z'::timestamptz,
  160
),
(
  'newsletter'::public.publication_category,
  'Caritas Rwanda Newsletter Q1 2024',
  'newsletter-q1-2024',
  'Quarterly newsletter Jan–Mar 2024.',
  'https://caritasrwanda.org/wp-content/uploads/2024/05/Newsletter-January-March-2024.jpg',
  'Newsletter Q1 2024',
  'https://caritasrwanda.org/wp-content/uploads/2024/05/Newsletter-January-March-2024-OK.pdf',
  '',
  'PDF',
  'Jan – Mar 2024',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2024-05-01T12:00:00Z'::timestamptz,
  170
),
(
  'newsletter'::public.publication_category,
  'Caritas Rwanda Newsletter Q1 2023 Vol. 2',
  'newsletter-q1-2023-vol2',
  'Quarterly newsletter Jan–Mar 2023.',
  'https://caritasrwanda.org/wp-content/uploads/2023/05/newsletter-vol2-1.jpg',
  'Newsletter Q1 2023',
  'https://caritasrwanda.org/wp-content/uploads/2023/05/Caritas-Rwanda-Newsletter-January-March-2023.pdf',
  '',
  'PDF',
  'Jan – Mar 2023',
  '',
  '',
  false,
  'published'::public.publication_status,
  '2023-05-01T12:00:00Z'::timestamptz,
  180
);

insert into public.publications (
  category, title, slug, excerpt, cover_image_url, cover_image_alt,
  file_url, external_url, meta_line, period_label, tag_label, tag_icon,
  featured, status, published_at, sort_order
) values
(
  'recent_update'::public.publication_category,
  'Awareness on Caritas Spirit at Saint Joseph Major Seminary of Rutongo',
  'recent-awareness-caritas-spirit-rutongo',
  'Outreach session for seminary community.',
  'https://caritasrwanda.org/wp-content/uploads/2026/04/162A9350-scaled.jpg',
  'Awareness at seminary',
  '',
  'https://caritasrwanda.org/awareness-on-caritas-sirit-at-saint-joseph-major-seminary-of-rutongo-by-caritas-rwanda/',
  'Article',
  'Apr 24, 2026',
  'Outreach',
  '',
  false,
  'published'::public.publication_status,
  '2026-04-24T12:00:00Z'::timestamptz,
  200
),
(
  'recent_update'::public.publication_category,
  'From Field Agents to Private Service Providers (PSPs)',
  'recent-field-agents-psps',
  'Graduation milestone in Gera Ku Ntego youth project.',
  'https://caritasrwanda.org/wp-content/uploads/2026/03/162A9069-scaled.jpg',
  'Field agents graduation',
  '',
  'https://caritasrwanda.org/from-field-agents-to-private-service-providers-psps/',
  'Article',
  'Mar 30, 2026',
  'Development',
  '',
  false,
  'published'::public.publication_status,
  '2026-03-30T12:00:00Z'::timestamptz,
  210
),
(
  'recent_update'::public.publication_category,
  '2026 General Assembly of Caritas Rwanda',
  'recent-general-assembly-2026',
  'Review of 2025 achievements and 2026 priorities.',
  'https://caritasrwanda.org/wp-content/uploads/2026/03/162A8733-scaled.jpg',
  'General Assembly',
  '',
  'https://caritasrwanda.org/2026-general-assembly-of-caritas-rwanda/',
  'Article',
  'Mar 30, 2026',
  'Governance',
  '',
  false,
  'published'::public.publication_status,
  '2026-03-30T12:00:00Z'::timestamptz,
  220
),
(
  'recent_update'::public.publication_category,
  'Caritas Humanitarian Conference in Kigali',
  'recent-humanitarian-conference-kigali',
  'Caritas Internationalis humanitarian conference.',
  'https://caritasrwanda.org/wp-content/uploads/2026/03/162A7732-scaled.jpg',
  'Conference',
  '',
  'https://caritasrwanda.org/caritas-humanitarian-conference-in-kigali/',
  'Article',
  'Mar 9, 2026',
  'Conference',
  '',
  false,
  'published'::public.publication_status,
  '2026-03-09T12:00:00Z'::timestamptz,
  230
),
(
  'recent_update'::public.publication_category,
  'Tunga Project Officially Launched in Kirehe District',
  'recent-tunga-kirehe',
  'Three-year project with Slovenian MFA support.',
  'https://caritasrwanda.org/wp-content/uploads/2026/02/162A7632-scaled.jpg',
  'Tunga launch',
  '',
  'https://caritasrwanda.org/tunga-project-officially-launched-in-kirehe-district/',
  'Article',
  'Feb 17, 2026',
  'Programs',
  '',
  false,
  'published'::public.publication_status,
  '2026-02-17T12:00:00Z'::timestamptz,
  240
),
(
  'recent_update'::public.publication_category,
  '2025 Achievements Review & 2026 Planning Meeting',
  'recent-review-2025-planning-2026',
  'Diocesan Caritas partners alignment meeting.',
  'https://caritasrwanda.org/wp-content/uploads/2026/02/162A7529-scaled.jpg',
  'Review meeting',
  '',
  'https://caritasrwanda.org/caritas-rwanda-and-diocesan-caritas-met-to-review-2025-achievements-and-plan-for-2026/',
  'Article',
  'Feb 3, 2026',
  'Planning',
  '',
  false,
  'published'::public.publication_status,
  '2026-02-03T12:00:00Z'::timestamptz,
  250
);

insert into public.publications (
  category, title, slug, excerpt, cover_image_url, cover_image_alt,
  file_url, external_url, meta_line, period_label, tag_label, tag_icon,
  featured, status, published_at, sort_order
) values
(
  'success_story'::public.publication_category,
  'From Small Savings to Big Dreams: Tuzamuranye Youth Group',
  'story-tuzamuranye-youth-group',
  '27 young people from Ngoma District transforming lives through savings groups.',
  'https://caritasrwanda.org/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-16-at-07.16.52-1-800x533.jpeg',
  'Tuzamuranye Youth Group',
  '',
  'https://caritasrwanda.org/country/from-small-savings-to-big-dreams-the-success-story-of-tuzamuranye-youth-group/',
  'Story',
  '',
  'Livelihoods',
  'fa-solid fa-seedling',
  false,
  'published'::public.publication_status,
  '2026-04-16T12:00:00Z'::timestamptz,
  300
),
(
  'success_story'::public.publication_category,
  'SILC Groups Improve Economic Growth & Child Nutrition',
  'story-silc-groups-nutrition',
  'Parents investing in poultry to feed children and boost incomes.',
  'https://caritasrwanda.org/wp-content/uploads/2025/06/162A1384-800x533.jpg',
  'SILC groups',
  '',
  'https://caritasrwanda.org/country/silc-groups-improve-economic-growth-for-members-and-nutrition-in-ecds/',
  'Story',
  '',
  'Economic Growth',
  'fa-solid fa-chart-line',
  false,
  'published'::public.publication_status,
  '2025-06-01T12:00:00Z'::timestamptz,
  310
),
(
  'success_story'::public.publication_category,
  'From Farming for Living to Potential Farmers'' Buyer',
  'story-farming-to-buyer',
  'Young Burundian refugee entrepreneur in agriculture trading.',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/162A7578-800x533.jpg',
  'Farmer buyer story',
  '',
  'https://caritasrwanda.org/country/from-farming-for-living-to-potential-farmers-buyer/',
  'Story',
  '',
  'Agriculture',
  'fa-solid fa-tractor',
  false,
  'published'::public.publication_status,
  '2025-02-20T12:00:00Z'::timestamptz,
  320
),
(
  'success_story'::public.publication_category,
  'Her Life Was Transformed Thanks to SILC Group''s Internal Loan',
  'story-silc-internal-loan-rusizi',
  'Single mother from Rusizi district.',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/162A9664-A-800x533.jpg',
  'SILC loan story',
  '',
  'https://caritasrwanda.org/country/her-life-was-transformed-thanks-to-the-silc-groups-internal-loan/',
  'Story',
  '',
  'Social Welfare',
  'fa-solid fa-hand-holding-heart',
  false,
  'published'::public.publication_status,
  '2025-02-18T12:00:00Z'::timestamptz,
  330
),
(
  'success_story'::public.publication_category,
  'Agriculture Training Drives Business Success — Innocent Musoni',
  'story-ag-training-innocent-musoni',
  'Good Agricultural Practices training success.',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/162A4488-800x533.jpg',
  'Agriculture training',
  '',
  'https://caritasrwanda.org/',
  'Story',
  '',
  'Agriculture',
  'fa-solid fa-seedling',
  false,
  'published'::public.publication_status,
  '2025-02-10T12:00:00Z'::timestamptz,
  340
),
(
  'success_story'::public.publication_category,
  'Small-Scale Tailoring Transitioning into Cross-Border Business',
  'story-tailoring-cross-border',
  'Congolese refugee expanding tailoring enterprise.',
  'https://caritasrwanda.org/wp-content/uploads/2025/02/162A7181-800x533.jpg',
  'Tailoring',
  '',
  'https://caritasrwanda.org/',
  'Story',
  '',
  'Livelihoods',
  'fa-solid fa-scissors',
  false,
  'published'::public.publication_status,
  '2025-02-08T12:00:00Z'::timestamptz,
  350
),
(
  'success_story'::public.publication_category,
  'Training and Cash Grant Changed His Life — Samuel Hagirimana',
  'story-samuel-hagirimana-graduation',
  'Graduation Project beneficiary.',
  'https://caritasrwanda.org/wp-content/uploads/2024/01/162A4763-A-800x533.jpg',
  'Samuel story',
  '',
  'https://caritasrwanda.org/',
  'Story',
  '',
  'Education',
  'fa-solid fa-graduation-cap',
  false,
  'published'::public.publication_status,
  '2024-01-15T12:00:00Z'::timestamptz,
  360
),
(
  'success_story'::public.publication_category,
  'Gatsibo: Growing Cayenne Pepper Changed His Life',
  'story-cayenne-pepper-gatsibo',
  'Jean de Dieu Habarukize pepper farming in Gatsibo.',
  'https://caritasrwanda.org/wp-content/uploads/2023/02/Jean-De-Dieu-pepper-800x533.jpg',
  'Pepper farming',
  '',
  'https://caritasrwanda.org/',
  'Story',
  '',
  'Agriculture',
  'fa-solid fa-tractor',
  false,
  'published'::public.publication_status,
  '2023-02-01T12:00:00Z'::timestamptz,
  370
);
