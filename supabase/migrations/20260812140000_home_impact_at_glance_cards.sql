-- Ensure homepage has Impact at a Glance (photo cards section).
-- Copies content from metrics page when present; otherwise uses defaults.

DO $$
DECLARE
  home_id uuid;
  metrics_id uuid;
  src_content jsonb;
  prog_order integer;
  next_order integer;
BEGIN
  SELECT id INTO home_id FROM pages WHERE slug = 'home' LIMIT 1;
  IF home_id IS NULL THEN
    RAISE WARNING 'Home page not found — skipping impact_at_glance home seed';
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM sections
    WHERE page_id = home_id AND type = 'impact_at_glance'
  ) THEN
    RAISE NOTICE 'Home already has impact_at_glance — skipping';
    RETURN;
  END IF;

  SELECT id INTO metrics_id FROM pages WHERE slug = 'metrics' LIMIT 1;
  IF metrics_id IS NOT NULL THEN
    SELECT content INTO src_content
    FROM sections
    WHERE page_id = metrics_id AND type = 'impact_at_glance'
    LIMIT 1;
  END IF;

  IF src_content IS NULL THEN
    src_content := '{
      "label": "Impact at a Glance",
      "title": "Caritas Rwanda by the",
      "title_accent": "Numbers",
      "body": "A transparent look at our reach across programmes — healthcare, social welfare, development, and administration across Rwanda.",
      "kpis": [
        { "value": "500K+", "label": "Beneficiaries Reached Annually", "color": "#ff9a6c", "size": "xl", "image_url": "/img/slide1.webp" },
        { "value": "9", "label": "Diocesan Caritas Offices Nationwide", "color": "#4ade80", "size": "lg", "image_url": "/img/slide2.webp" },
        { "value": "50+", "label": "Active Programmes", "color": "#60a5fa", "size": "sm", "image_url": "/img/slide3.webp" },
        { "value": "12+", "label": "Global Partners", "color": "#c084fc", "size": "lg", "image_url": "/img/slide4.webp" }
      ],
      "programs": [
        {
          "tab_key": "health", "tab_label": "Health & ECD", "tab_icon": "fa-heart-pulse",
          "name": "Health & ECD", "description": "Early Childhood Development & community health",
          "icon": "fa-heart-pulse", "accent_color": "#8c2208", "slug": "health",
          "image_url": "/img/health.JPG.webp",
          "stats": [
            { "value": "15,000+", "label": "Children Reached" },
            { "value": "7", "label": "Dioceses Active" }
          ]
        },
        {
          "tab_key": "social", "tab_label": "Social Welfare", "tab_icon": "fa-people-roof",
          "name": "Social Welfare", "description": "Savings groups, family support & community care",
          "icon": "fa-people-roof", "accent_color": "#8c2208", "slug": "social-welfare",
          "image_url": "/img/slide2.webp",
          "stats": [
            { "value": "4,500+", "label": "Households" },
            { "value": "35%", "label": "Income Growth" }
          ]
        },
        {
          "tab_key": "development", "tab_label": "Development", "tab_icon": "fa-seedling",
          "name": "Development", "description": "Livelihoods, agriculture & youth entrepreneurship",
          "icon": "fa-seedling", "accent_color": "#8c2208", "slug": "development",
          "image_url": "/img/slide3.webp",
          "stats": [
            { "value": "3,500+", "label": "Households" },
            { "value": "24", "label": "PSPs Graduated" }
          ]
        },
        {
          "tab_key": "admin", "tab_label": "Administration", "tab_icon": "fa-building-columns",
          "name": "Administration & Finance", "description": "Governance, capacity building & resource management",
          "icon": "fa-building-columns", "accent_color": "#8c2208", "slug": "finance-administration",
          "image_url": "/img/slide1.webp",
          "stats": [
            { "value": "9", "label": "Dioceses Aligned" },
            { "value": "100%", "label": "Audit Compliance" }
          ]
        }
      ]
    }'::jsonb;
  ELSE
    -- Ensure intro body exists for the new band layout
    IF src_content->>'body' IS NULL OR btrim(src_content->>'body') = '' THEN
      src_content := src_content || jsonb_build_object(
        'body',
        'A transparent look at our reach across programmes — healthcare, social welfare, development, and administration across Rwanda.'
      );
    END IF;
  END IF;

  SELECT "order" INTO prog_order
  FROM sections
  WHERE page_id = home_id AND type = 'program_cards'
  LIMIT 1;

  SELECT COALESCE(MAX("order"), 50) + 10 INTO next_order
  FROM sections
  WHERE page_id = home_id;

  INSERT INTO sections (page_id, name, type, content, "order", visible, section_key)
  VALUES (
    home_id,
    'Impact at a Glance',
    'impact_at_glance',
    src_content,
    CASE WHEN prog_order IS NOT NULL THEN prog_order + 5 ELSE next_order END,
    true,
    'impact_at_glance'
  );

  RAISE NOTICE 'Seeded impact_at_glance on home page';
END $$;
