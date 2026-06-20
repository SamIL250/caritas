-- ═══════════════════════════════════════════════════════════
-- IMPACT AT A GLANCE — Seed programs into existing section
-- ═══════════════════════════════════════════════════════════

-- Add programs to the impact_at_glance section content for the metrics page
DO $$
DECLARE
  pid uuid;
  existing jsonb;
  prog jsonb;
BEGIN
  SELECT id INTO pid FROM pages WHERE slug = 'metrics';
  IF pid IS NULL THEN
    RAISE WARNING 'Metrics page not found — skipping';
    RETURN;
  END IF;

  SELECT content INTO existing
  FROM sections
  WHERE page_id = pid AND section_key = 'impact_at_glance';

  IF existing IS NULL THEN
    RAISE WARNING 'impact_at_glance section not found — skipping';
    RETURN;
  END IF;

  -- Only seed if programs is missing or empty
  IF existing->'programs' IS NULL OR existing->'programs' = '[]'::jsonb THEN
    existing := jsonb_set(existing, '{programs}', jsonb_build_array(
      jsonb_build_object(
        'tab_key', 'health', 'tab_label', 'Health & ECD', 'tab_icon', 'fa-heart-pulse',
        'name', 'Health & ECD', 'description', 'Early Childhood Development & community health',
        'icon', 'fa-heart-pulse', 'accent_color', '#dc2626', 'slug', 'health',
        'stats', jsonb_build_array(
          jsonb_build_object('value', '15,000+', 'label', 'Children Reached'),
          jsonb_build_object('value', '7',       'label', 'Dioceses Active'),
          jsonb_build_object('value', '340+',    'label', 'ECD Centres')
        )
      ),
      jsonb_build_object(
        'tab_key', 'social', 'tab_label', 'Social Welfare', 'tab_icon', 'fa-people-roof',
        'name', 'Social Welfare', 'description', 'Savings groups, family support & community care',
        'icon', 'fa-people-roof', 'accent_color', '#2563eb', 'slug', 'social-welfare',
        'stats', jsonb_build_array(
          jsonb_build_object('value', '4,500+', 'label', 'Households'),
          jsonb_build_object('value', '35%',    'label', 'Income Growth'),
          jsonb_build_object('value', '12M+',   'label', 'RWF Saved')
        )
      ),
      jsonb_build_object(
        'tab_key', 'development', 'tab_label', 'Development', 'tab_icon', 'fa-seedling',
        'name', 'Development', 'description', 'Livelihoods, agriculture & youth entrepreneurship',
        'icon', 'fa-seedling', 'accent_color', '#16a34a', 'slug', 'development',
        'stats', jsonb_build_array(
          jsonb_build_object('value', '3,500+', 'label', 'Households'),
          jsonb_build_object('value', '24',     'label', 'PSPs Graduated'),
          jsonb_build_object('value', '5',      'label', 'Districts Covered')
        )
      ),
      jsonb_build_object(
        'tab_key', 'admin', 'tab_label', 'Administration', 'tab_icon', 'fa-building-columns',
        'name', 'Administration & Finance', 'description', 'Governance, capacity building & resource management',
        'icon', 'fa-building-columns', 'accent_color', '#7c3aed', 'slug', 'finance-administration',
        'stats', jsonb_build_array(
          jsonb_build_object('value', '9',    'label', 'Dioceses Aligned'),
          jsonb_build_object('value', '29th', 'label', 'General Assembly'),
          jsonb_build_object('value', '100%', 'label', 'Audit Compliance')
        )
      )
    ));

    UPDATE sections SET content = existing, updated_at = now()
    WHERE page_id = pid AND section_key = 'impact_at_glance';

    RAISE NOTICE 'Seeded programs into impact_at_glance section';
  ELSE
    RAISE NOTICE 'Programs already exist in impact_at_glance section — skipping';
  END IF;
END$$;

-- Also update the section template default_content
UPDATE section_templates SET
  default_content = default_content || jsonb_build_object(
    'programs', jsonb_build_array(
      jsonb_build_object(
        'tab_key', 'health', 'tab_label', 'Health & ECD', 'tab_icon', 'fa-heart-pulse',
        'name', 'Health & ECD', 'description', 'Early Childhood Development & community health',
        'icon', 'fa-heart-pulse', 'accent_color', '#dc2626', 'slug', 'health',
        'stats', jsonb_build_array(
          jsonb_build_object('value', '15,000+', 'label', 'Children Reached'),
          jsonb_build_object('value', '7',       'label', 'Dioceses Active'),
          jsonb_build_object('value', '340+',    'label', 'ECD Centres')
        )
      ),
      jsonb_build_object(
        'tab_key', 'social', 'tab_label', 'Social Welfare', 'tab_icon', 'fa-people-roof',
        'name', 'Social Welfare', 'description', 'Savings groups, family support & community care',
        'icon', 'fa-people-roof', 'accent_color', '#2563eb', 'slug', 'social-welfare',
        'stats', jsonb_build_array(
          jsonb_build_object('value', '4,500+', 'label', 'Households'),
          jsonb_build_object('value', '35%',    'label', 'Income Growth'),
          jsonb_build_object('value', '12M+',   'label', 'RWF Saved')
        )
      ),
      jsonb_build_object(
        'tab_key', 'development', 'tab_label', 'Development', 'tab_icon', 'fa-seedling',
        'name', 'Development', 'description', 'Livelihoods, agriculture & youth entrepreneurship',
        'icon', 'fa-seedling', 'accent_color', '#16a34a', 'slug', 'development',
        'stats', jsonb_build_array(
          jsonb_build_object('value', '3,500+', 'label', 'Households'),
          jsonb_build_object('value', '24',     'label', 'PSPs Graduated'),
          jsonb_build_object('value', '5',      'label', 'Districts Covered')
        )
      ),
      jsonb_build_object(
        'tab_key', 'admin', 'tab_label', 'Administration', 'tab_icon', 'fa-building-columns',
        'name', 'Administration & Finance', 'description', 'Governance, capacity building & resource management',
        'icon', 'fa-building-columns', 'accent_color', '#7c3aed', 'slug', 'finance-administration',
        'stats', jsonb_build_array(
          jsonb_build_object('value', '9',    'label', 'Dioceses Aligned'),
          jsonb_build_object('value', '29th', 'label', 'General Assembly'),
          jsonb_build_object('value', '100%', 'label', 'Audit Compliance')
        )
      )
    )
  )
WHERE type = 'impact_at_glance';
