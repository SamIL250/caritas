-- Seed full program_cards content (four tabs with images, copy, and bullet lists).
-- Only fills sections/templates where programs is missing or empty.

update public.section_templates
set default_content = default_content
  || jsonb_build_object(
    'heading', 'Our Programs',
    'subtitle', 'Making a difference through Social Welfare, Health, and Development interventions with safe Finance and Administration services.',
    'programs', jsonb_build_array(
      jsonb_build_object(
        'tab_label', E'Social\nWelfare',
        'title', 'Social Welfare',
        'description', 'Community mobilization, support and advocacy for the most vulnerable people — providing safety nets, emergency assistance, and dignity-restoring support systems for Rwanda''s most vulnerable families and communities.',
        'bullets', jsonb_build_array(
          'Community support & social protection',
          'Emergency humanitarian response',
          'Social advocacy & inclusion programs'
        ),
        'icon', 'fa-solid fa-people-roof',
        'link_url', '/programs#social-welfare',
        'image_url', '/img/bg_1.webp'
      ),
      jsonb_build_object(
        'tab_label', 'Health',
        'title', 'Health',
        'description', 'Healthcare services, medical support, and health education for communities in need — improving maternal and child health outcomes, community nutrition, and healthcare access across all nine dioceses.',
        'bullets', jsonb_build_array(
          'Maternal & child healthcare',
          'Community health outreach programs',
          'Nutrition, wellness & disease prevention'
        ),
        'icon', 'fa-solid fa-heart-pulse',
        'link_url', '/programs#health',
        'image_url', '/img/health.webp'
      ),
      jsonb_build_object(
        'tab_label', 'Development',
        'title', 'Development',
        'description', 'Sustainable development programs focused on education, agriculture, and economic empowerment — building long-term resilience through vocational training, microfinance, and community-led initiatives.',
        'bullets', jsonb_build_array(
          'Vocational training & skills development',
          'Sustainable livelihoods & agriculture',
          'Microfinance & economic empowerment'
        ),
        'icon', 'fa-solid fa-seedling',
        'link_url', '/programs#development',
        'image_url', '/img/bg_2.webp'
      ),
      jsonb_build_object(
        'tab_label', E'Admin &\nFinance',
        'title', 'Administration & Finance',
        'description', 'Organizational management, financial oversight, and operational excellence — ensuring transparent governance, sound financial stewardship, and accountability that sustains Caritas Rwanda''s mission across Rwanda.',
        'bullets', jsonb_build_array(
          'Transparent governance & oversight',
          'Financial stewardship & reporting',
          'Operational accountability & compliance'
        ),
        'icon', 'fa-solid fa-building-columns',
        'link_url', '/programs#finance-administration',
        'image_url', '/img/slide5.webp'
      )
    )
  )
where type = 'program_cards';

update public.sections
set content = content
  || jsonb_build_object(
    'programs', (
      select default_content -> 'programs'
      from public.section_templates
      where type = 'program_cards'
      limit 1
    )
  )
where section_key = 'home_programs'
  and exists (
    select 1 from public.pages p
    where p.id = sections.page_id and p.slug = 'home'
  )
  and (
    content -> 'programs' is null
    or jsonb_typeof(content -> 'programs') <> 'array'
    or jsonb_array_length(content -> 'programs') = 0
  );
