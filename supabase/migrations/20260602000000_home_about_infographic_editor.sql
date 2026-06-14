-- Home about infographic: update template default content and seed the home page section.
-- Replaces the old burgundy-card VMC layout with the radial infographic editor data.

update public.section_templates
set
  description = 'Radial infographic: heading, subtitle, mission, values, vision tagline.',
  default_content = jsonb_build_object(
    'title', 'About Us',
    'subtitle', 'Caritas Rwanda Interventions Scale Through Its Network',
    'missionText', 'To assist people in needs and promote their integral human development, drawing on the Charity as per the Word of God.',
    'values', jsonb_build_array(
      'Advocacy',
      'Compassion',
      'Environment Protection',
      'Equity',
      'Hope',
      'Human Dignity',
      'Justice',
      'Service',
      'Solidarity',
      'Stewardship and Accountability',
      'Subsidiarity and Partnership'
    ),
    'visionText', 'Promoting Human<br />Dignity for All'
  )
where type = 'home_about';

-- Update the seeded home page section content to match the new structure
update public.sections
set content = (
  select default_content
  from public.section_templates
  where type = 'home_about'
  limit 1
)
where section_key = 'home_about'
  and exists (
    select 1 from public.pages p
    where p.id = sections.page_id and p.slug = 'home'
  );
