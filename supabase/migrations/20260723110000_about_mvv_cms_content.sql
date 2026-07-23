-- Align About page Vision/Mission/Values CMS content with the public MissionVisionValuesSection.

update public.sections s
set
  name = 'Vision & mission',
  content = jsonb_build_object(
    'title', 'Vision, Mission & Values',
    'anchor_id', 'mission',
    'statements', jsonb_build_array(
      jsonb_build_object(
        'variant', 'vision',
        'label', 'Our Vision',
        'body', 'A Rwanda where every person — regardless of background, status, or circumstance — lives with full **dignity, equal rights**, and the opportunity to flourish in body, mind, and spirit through inclusive, non-discriminatory interventions.'
      ),
      jsonb_build_object(
        'variant', 'mission',
        'label', 'Our Mission',
        'body', 'To assist people in need and promote their **integral human development**, drawing on Charity as per the Word of God — reaching the poor, sick, elderly, refugees, people with disabilities, and all vulnerable communities across Rwanda.'
      )
    )
  ),
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.type = 'pillar_cards'::public.section_type;

update public.sections s
set
  name = 'Core values',
  content = jsonb_set(
    jsonb_set(
      coalesce(s.content, '{}'::jsonb),
      '{eyebrow}',
      '"Core Values"'::jsonb,
      true
    ),
    '{title}',
    '"Principles We Live By"'::jsonb,
    true
  ) || jsonb_build_object(
    'eyebrow_icon', 'fa-star',
    'anchor_id', 'values',
    'items', jsonb_build_array(
      jsonb_build_object('icon', 'fa-megaphone', 'name', 'Advocacy', 'desc', 'Speaking up for the vulnerable and voiceless'),
      jsonb_build_object('icon', 'fa-heart', 'name', 'Compassion', 'desc', 'Meeting suffering with sincere care and empathy'),
      jsonb_build_object('icon', 'fa-scale-balanced', 'name', 'Equity', 'desc', 'Ensuring fair access and equal opportunity for all'),
      jsonb_build_object('icon', 'fa-leaf', 'name', 'Environment Protection', 'desc', 'Safeguarding creation for future generations'),
      jsonb_build_object('icon', 'fa-sun', 'name', 'Hope', 'desc', 'Inspiring confidence in a brighter tomorrow'),
      jsonb_build_object('icon', 'fa-person-rays', 'name', 'Human Dignity', 'desc', 'Honouring the sacred worth of every person'),
      jsonb_build_object('icon', 'fa-gavel', 'name', 'Justice', 'desc', 'Upholding rights, fairness, and moral integrity'),
      jsonb_build_object('icon', 'fa-hand-holding-heart', 'name', 'Service', 'desc', 'Giving selflessly to those who need it most'),
      jsonb_build_object('icon', 'fa-handshake', 'name', 'Solidarity', 'desc', 'Standing united across all communities'),
      jsonb_build_object('icon', 'fa-shield-halved', 'name', 'Stewardship & Accountability', 'desc', 'Managing every resource with full transparency'),
      jsonb_build_object('icon', 'fa-people-group', 'name', 'Subsidiarity & Partnership', 'desc', 'Empowering local action through collaboration')
    )
  ),
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and s.page_id = p.id
  and s.type = 'values_grid'::public.section_type;
