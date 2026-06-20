-- ═══════════════════════════════════════════════════════════
-- IMPACT AT A GLANCE — Section template and seed
-- ═══════════════════════════════════════════════════════════

-- ─── 1. Section template ───────────────────────────────────
INSERT INTO section_templates (type, label, description, icon, default_content)
VALUES (
  'impact_at_glance',
  'Impact at a Glance',
  'Bubble banner with KPI numbers plus Read More dropdown linking to program detail tabs.',
  'BarChart3',
  '{
    "label": "Impact at a Glance",
    "title": "Caritas Rwanda by the",
    "title_accent": "Numbers",
    "kpis": [
      { "value": "500K+",  "label": "Beneficiaries Reached Annually", "color": "#ff9a6c", "size": "xl" },
      { "value": "9",      "label": "Diocesan Caritas Offices Nationwide", "color": "#4ade80", "size": "lg" },
      { "value": "50+",    "label": "Active Programmes",              "color": "#60a5fa", "size": "sm" },
      { "value": "12+",    "label": "Global Partners",                "color": "#c084fc", "size": "lg" },
      { "value": "120K+",  "label": "Families Supported",             "color": "#fbbf24", "size": "sm" }
    ],
    "programs": [
      {
        "tab_key": "health", "tab_label": "Health & ECD", "tab_icon": "fa-heart-pulse",
        "name": "Health & ECD", "description": "Early Childhood Development & community health",
        "icon": "fa-heart-pulse", "accent_color": "#dc2626", "slug": "health",
        "stats": [
          { "value": "15,000+", "label": "Children Reached" },
          { "value": "7",       "label": "Dioceses Active"  },
          { "value": "340+",    "label": "ECD Centres"      }
        ]
      },
      {
        "tab_key": "social", "tab_label": "Social Welfare", "tab_icon": "fa-people-roof",
        "name": "Social Welfare", "description": "Savings groups, family support & community care",
        "icon": "fa-people-roof", "accent_color": "#2563eb", "slug": "social-welfare",
        "stats": [
          { "value": "4,500+", "label": "Households"    },
          { "value": "35%",    "label": "Income Growth" },
          { "value": "12M+",   "label": "RWF Saved"     }
        ]
      },
      {
        "tab_key": "development", "tab_label": "Development", "tab_icon": "fa-seedling",
        "name": "Development", "description": "Livelihoods, agriculture & youth entrepreneurship",
        "icon": "fa-seedling", "accent_color": "#16a34a", "slug": "development",
        "stats": [
          { "value": "3,500+", "label": "Households"       },
          { "value": "24",     "label": "PSPs Graduated"   },
          { "value": "5",      "label": "Districts Covered" }
        ]
      },
      {
        "tab_key": "admin", "tab_label": "Administration", "tab_icon": "fa-building-columns",
        "name": "Administration & Finance", "description": "Governance, capacity building & resource management",
        "icon": "fa-building-columns", "accent_color": "#7c3aed", "slug": "finance-administration",
        "stats": [
          { "value": "9",    "label": "Dioceses Aligned"  },
          { "value": "29th", "label": "General Assembly"  },
          { "value": "100%", "label": "Audit Compliance"  }
        ]
      }
    ]
  }'::jsonb
)
ON CONFLICT (type) DO UPDATE SET
  label           = excluded.label,
  description     = excluded.description,
  icon            = excluded.icon,
  default_content = excluded.default_content;

-- ─── 2. Seed the impact_at_glance section for the metrics page ──
DO $$
DECLARE
  pid uuid;
BEGIN
  SELECT id INTO pid FROM pages WHERE slug = 'metrics';
  IF pid IS NULL THEN
    RAISE WARNING 'Metrics page not found — skipping impact_at_glance seed';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM sections WHERE page_id = pid AND section_key = 'impact_at_glance') THEN
    UPDATE sections SET
      content = jsonb_build_object(
        'label', 'Impact at a Glance',
        'title', 'Caritas Rwanda by the',
        'title_accent', 'Numbers',
        'kpis', jsonb_build_array(
          jsonb_build_object('value', '500K+',  'label', 'Beneficiaries Reached Annually',   'color', '#ff9a6c', 'size', 'xl'),
          jsonb_build_object('value', '9',      'label', 'Diocesan Caritas Offices Nationwide', 'color', '#4ade80', 'size', 'lg'),
          jsonb_build_object('value', '50+',    'label', 'Active Programmes',                'color', '#60a5fa', 'size', 'sm'),
          jsonb_build_object('value', '12+',    'label', 'Global Partners',                  'color', '#c084fc', 'size', 'lg'),
          jsonb_build_object('value', '120K+',  'label', 'Families Supported',               'color', '#fbbf24', 'size', 'sm')
        ),
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
      ),
      name = 'Impact at a Glance'
    WHERE page_id = pid AND section_key = 'impact_at_glance';
  ELSE
    INSERT INTO sections (page_id, name, type, content, "order", visible, section_key)
    VALUES (
      pid,
      'Impact at a Glance',
      'impact_at_glance',
      jsonb_build_object(
        'label', 'Impact at a Glance',
        'title', 'Caritas Rwanda by the',
        'title_accent', 'Numbers',
        'kpis', jsonb_build_array(
          jsonb_build_object('value', '500K+',  'label', 'Beneficiaries Reached Annually',   'color', '#ff9a6c', 'size', 'xl'),
          jsonb_build_object('value', '9',      'label', 'Diocesan Caritas Offices Nationwide', 'color', '#4ade80', 'size', 'lg'),
          jsonb_build_object('value', '50+',    'label', 'Active Programmes',                'color', '#60a5fa', 'size', 'sm'),
          jsonb_build_object('value', '12+',    'label', 'Global Partners',                  'color', '#c084fc', 'size', 'lg'),
          jsonb_build_object('value', '120K+',  'label', 'Families Supported',               'color', '#fbbf24', 'size', 'sm')
        ),
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
      ),
      0,
      true,
      'impact_at_glance'
    );
  END IF;
END$$;
