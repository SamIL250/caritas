-- Old WordPress upload links are blocked on the new site.
-- These publication files now live on Cloudinary, except the January 2023
-- newsletter, which is larger than the Cloudinary account allows and is
-- stored in public storage instead. Public Cloudinary PDF links are blocked
-- on the free plan, so the site downloads those through
-- /publications/[slug]/file.

update public.publications as p
set file_url = v.file_url
from (
  values
    (
      'strategic-plan-caritas-rwanda-2025-2030',
      'https://res.cloudinary.com/dddufhdak/image/upload/caritas_publications/strategic-plan-2025-2030.pdf'
    ),
    (
      'annual-report-2019',
      'https://res.cloudinary.com/dddufhdak/image/upload/v1795701562/caritas_publications/annual-report-2019.pdf'
    ),
    (
      'annual-report-2020',
      'https://res.cloudinary.com/dddufhdak/image/upload/v1795701539/caritas_publications/annual-report-2020.pdf'
    ),
    (
      'annual-report-2021',
      'https://res.cloudinary.com/dddufhdak/image/upload/v1795701520/caritas_publications/annual-report-2021.pdf'
    ),
    (
      'annual-report-2022',
      'https://res.cloudinary.com/dddufhdak/image/upload/v1795701500/caritas_publications/annual-report-2022.pdf'
    ),
    (
      'annual-report-2023',
      'https://res.cloudinary.com/dddufhdak/image/upload/v1795701482/caritas_publications/annual-report-2023.pdf'
    ),
    (
      'annual-report-2024',
      'https://res.cloudinary.com/dddufhdak/image/upload/v1795701455/caritas_publications/annual-report-2024.pdf'
    ),
    (
      'graduation-project-year-end-2022',
      'https://res.cloudinary.com/dddufhdak/image/upload/v1795701670/caritas_publications/graduation-project-year-end-2022.pdf'
    ),
    (
      'newsletter-q2-2024',
      'https://res.cloudinary.com/dddufhdak/image/upload/v1795701832/caritas_publications/newsletter-q2-2024.pdf'
    ),
    (
      'newsletter-q3-2024',
      'https://res.cloudinary.com/dddufhdak/image/upload/v1795701794/caritas_publications/newsletter-q4-2024.pdf'
    ),
    (
      'newsletter-q4-2024',
      'https://res.cloudinary.com/dddufhdak/image/upload/v1795701794/caritas_publications/newsletter-q4-2024.pdf'
    ),
    (
      'newsletter-q4-2025',
      'https://res.cloudinary.com/dddufhdak/image/upload/v1795701689/caritas_publications/newsletter-q4-2025.pdf'
    ),
    (
      'newsletter-q1-2023-vol2',
      'https://cxegiairrptsbaogkmqf.supabase.co/storage/v1/object/public/public_media/publications/newsletter-q1-2023-vol2.pdf'
    )
) as v(slug, file_url)
where p.slug = v.slug
  and p.file_url is distinct from v.file_url;
