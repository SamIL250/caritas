-- Depends on 20260501180000_add_home_about_section_type.sql (enum value committed in a prior migration).

insert into public.section_templates (type, label, description, icon, default_content)
values (
  'home_about',
  'Home — About story',
  'Faith headline, journey timeline, stats, image stack, and CTAs (homepage about section).',
  'Landmark',
  jsonb_build_object(
    'meta_est', 'Est. 1959',
    'meta_sep', '·',
    'meta_location', 'Kigali, Rwanda',
    'tagline_line1', 'Rooted in Faith,',
    'tagline_line2', 'Built for People',
    'title_dek',
    'A national Catholic charity serving communities with compassion, transparency, and respect for every person we walk alongside.',
    'intro_pill', 'Faith-driven & Community-led',
    'lead_start', 'Caritas Rwanda is a ',
    'lead_strong', 'faith-driven humanitarian organization',
    'lead_end',
    ' committed to restoring human dignity, alleviating poverty, and promoting integral development across every corner of Rwanda.',
    'timeline',
    jsonb_build_array(
      jsonb_build_object(
        'year', '1959 — Founded',
        'text',
        'Born from the Catholic Church''s response to humanitarian hardship, we began as <em>Le Secours Catholique Rwandais</em> — a call to serve the poor without discrimination.'
      ),
      jsonb_build_object(
        'year', 'Nationwide Growth',
        'text',
        'Over six decades we grew into a network spanning every diocese — from the hills of Nyaruguru to the streets of Kigali — guided by the Gospel''s call to love our neighbour.'
      ),
      jsonb_build_object(
        'year', 'Today',
        'text',
        'Through conflict, genocide, recovery, and renaissance, Caritas Rwanda has stood firm — serving, rebuilding, and reconciling communities with hope.'
      )
    ),
    'stats',
    jsonb_build_array(
      jsonb_build_object('value', '67+', 'label', 'Years of Service', 'icon', 'calendar-check'),
      jsonb_build_object('value', '8K', 'label', 'Volunteers', 'icon', 'hand-helping'),
      jsonb_build_object('value', '150K+', 'label', 'Beneficiaries', 'icon', 'users'),
      jsonb_build_object('value', '9', 'label', 'Dioceses', 'icon', 'church')
    ),
    'primary_cta', jsonb_build_object('label', 'Learn More About Us', 'href', '/about'),
    'secondary_cta', jsonb_build_object('label', 'Our Programs', 'href', '#programs'),
    'images',
    jsonb_build_array(
      jsonb_build_object('url', '/img/slide1.png', 'alt', 'Caritas Rwanda community work'),
      jsonb_build_object('url', '/img/slide2.jpg', 'alt', 'Caritas Rwanda volunteers'),
      jsonb_build_object('url', '/img/slide3.jpg', 'alt', 'Caritas Rwanda health program'),
      jsonb_build_object('url', '/img/slide4.jpg', 'alt', 'Caritas Rwanda development')
    ),
    'badge_title', '67+ Years',
    'badge_subtitle', 'of serving Rwanda'
  )
)
on conflict (type) do update set
  label = excluded.label,
  description = excluded.description,
  icon = excluded.icon,
  default_content = excluded.default_content;

insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'Home — About',
  'home_about'::public.section_type,
  st.default_content,
  0,
  true,
  'home_about'
from public.pages p
cross join lateral (
  select default_content from public.section_templates where type = 'home_about' limit 1
) st
where p.slug = 'home'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'home_about'
  );
