-- Align section_templates.home_about with the live burgundy-card JSON (original-web/index.html).

update public.section_templates
set
  description =
    'Beige band with burgundy card: badges, history copy, quote, milestones, Vision/Mission/Values, stats bar.',
  default_content = jsonb_build_object(
    'badge_est',
    'Est. 1959',
    'badge_location',
    'Kigali, Rwanda',
    'heading_line1',
    'Rooted in Faith,',
    'heading_line2_accent',
    'Built for People',
    'history_label',
    'Our History',
    'paragraph_html',
    jsonb_build_array(
      'Founded in 1959 as <em>Le Secours Catholique Rwandais</em>, Caritas Rwanda is a <strong>faith-driven, nationwide humanitarian organization</strong> committed to restoring dignity, alleviating poverty, and promoting integral human development across every corner of Rwanda — from the hills of Nyaruguru to the streets of Kigali.',
      'As a proud member of <strong>Caritas Internationalis</strong> since 1965, we operate through 9 diocesan networks, reaching the most vulnerable with compassion, justice, and unwavering hope.'
    ),
    'story_cta',
    jsonb_build_object('label', 'Read our story', 'href', '/about'),
    'quote_text',
    'We believe every human being carries inherent dignity that no crisis, poverty, or conflict can ever erase.',
    'quote_attribution',
    'Caritas Rwanda — Core Conviction',
    'milestones',
    jsonb_build_array(
      'First humanitarian response in post-independence Rwanda (1959)',
      'Joined Caritas Internationalis global network in 1965',
      'Led community recovery & reconciliation efforts post-1994',
      'Serving all 9 dioceses across Rwanda today'
    ),
    'pillars',
    jsonb_build_array(
      jsonb_build_object(
        'icon',
        'fa-regular fa-eye',
        'title',
        'Vision',
        'body',
        'A Rwanda where <strong>every person lives with dignity</strong> — free from poverty, injustice, and social exclusion — nurtured by a compassionate, faith-inspired community.',
        'footer',
        'Resilient communities. Self-reliant families. A society bound together by solidarity and hope.'
      ),
      jsonb_build_object(
        'icon',
        'fa-solid fa-bullseye',
        'title',
        'Mission',
        'body',
        'To <strong>assist people in need</strong> and promote their integral human development, drawing on the spirit of Charity expressed through the Word of God and Catholic Social Teaching.',
        'footer',
        'We serve without discrimination — reaching the poorest, most marginalized, and often forgotten members of society.'
      ),
      jsonb_build_object(
        'icon',
        'fa-solid fa-gem',
        'title',
        'Core Values',
        'body',
        'Six principles guide every program, every partnership, and every act of service we carry out across Rwanda:',
        'chips',
        jsonb_build_array(
          'Compassion',
          'Human Dignity',
          'Solidarity',
          'Hope',
          'Subsidiarity',
          'Partnership'
        ),
        'cta_label',
        'Read more',
        'cta_href',
        '/about#values'
      )
    ),
    'stats_bar',
    jsonb_build_object(
      'items',
      jsonb_build_array(
        jsonb_build_object('value', '67+', 'label', 'Years of Service'),
        jsonb_build_object('value', '9', 'label', 'Diocesan Networks'),
        jsonb_build_object('value', '150K+', 'label', 'Lives Touched'),
        jsonb_build_object('value', '59+', 'label', 'Staff & Volunteers')
      ),
      'cta_label',
      'Explore our story',
      'cta_href',
      '/about'
    )
  )
where type = 'home_about';
