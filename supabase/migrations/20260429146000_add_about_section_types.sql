-- Depends on 20260429145999_add_about_section_enum_values.sql (committed enum values).

insert into public.section_templates (type, label, description, icon, default_content)
values
  (
    'stats_banner',
    'Key stats strip',
    'Full-width dark band with impact numbers (headline row under the hero).',
    'BarChart3',
    jsonb_build_object(
      'items',
      jsonb_build_array(
        jsonb_build_object('number_core', '66', 'number_suffix', '+', 'label', 'Years of Service'),
        jsonb_build_object('number_core', '7', 'number_suffix', 'M+', 'label', 'People Served'),
        jsonb_build_object('number_core', '10', 'number_suffix', '', 'label', 'Diocesan Caritas')
      )
    )
  ),
  (
    'featured_quote',
    'Featured quote (chairperson)',
    'Photo or placeholder, long-form quote, and attribution line.',
    'Quote',
    jsonb_build_object(
      'name',
      '',
      'subtitle',
      '',
      'quote',
      '',
      'meta',
      '',
      'photo_url',
      ''
    )
  ),
  (
    'timeline',
    'History timeline',
    'Alternating vertical timeline with year markers and cards.',
    'History',
    jsonb_build_object(
      'eyebrow',
      'Our History',
      'eyebrow_icon',
      'fa-clock-rotate-left',
      'title',
      'Milestones',
      'subtitle',
      '',
      'anchor_id',
      'history',
      'items',
      '[]'::jsonb
    )
  ),
  (
    'pillar_cards',
    'Mission / vision / pillars',
    'Up to three highlight cards (mission, vision, values summary).',
    'LayoutTemplate',
    jsonb_build_object(
      'eyebrow',
      'Who We Are',
      'eyebrow_icon',
      'fa-bullseye',
      'title',
      'Mission, Vision & Values',
      'subtitle',
      '',
      'anchor_id',
      'mission',
      'pillars',
      '[]'::jsonb
    )
  ),
  (
    'values_grid',
    'Values grid',
    'Icon grid of core values (pills).',
    'Star',
    jsonb_build_object(
      'eyebrow',
      'Core Values',
      'eyebrow_icon',
      'fa-star',
      'title',
      'What We Stand For',
      'subtitle',
      '',
      'anchor_id',
      'values',
      'items',
      '[]'::jsonb
    )
  ),
  (
    'network_section',
    'Network & dioceses',
    'Stat cards plus diocese grid.',
    'Globe2',
    jsonb_build_object(
      'eyebrow',
      'Our Network',
      'eyebrow_icon',
      'fa-network-wired',
      'title',
      'Reaching Every Corner of Rwanda',
      'subtitle',
      '',
      'anchor_id',
      'network',
      'stats',
      '[]'::jsonb,
      'dioceses',
      '[]'::jsonb
    )
  ),
  (
    'leadership_grid',
    'Leadership succession',
    'Optional groups (e.g. chairpersons, secretaries) with year cards.',
    'Users',
    jsonb_build_object(
      'eyebrow',
      'Leadership',
      'eyebrow_icon',
      'fa-user-tie',
      'title',
      'Our Leadership Succession',
      'subtitle',
      '',
      'anchor_id',
      'leadership',
      'groups',
      '[]'::jsonb
    )
  )
on conflict (type) do update set
  label = excluded.label,
  description = excluded.description,
  icon = excluded.icon,
  default_content = excluded.default_content;
