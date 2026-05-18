-- ═══════════════════════════════════════════════════════════
-- METRICS PAGE — Full migration
-- Tables: metrics_kpis, metrics_stat_cards, metrics_sections
-- Seeds:  pages row, hero_content, all default data
-- ═══════════════════════════════════════════════════════════

-- ─── 1. Section type enum values ───────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'metrics_kpis'
    AND enumtypid = 'section_type'::regtype) THEN
    ALTER TYPE section_type ADD VALUE 'metrics_kpis';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'metrics_stat_cards'
    AND enumtypid = 'section_type'::regtype) THEN
    ALTER TYPE section_type ADD VALUE 'metrics_stat_cards';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'metrics_program'
    AND enumtypid = 'section_type'::regtype) THEN
    ALTER TYPE section_type ADD VALUE 'metrics_program';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'metrics_reach'
    AND enumtypid = 'section_type'::regtype) THEN
    ALTER TYPE section_type ADD VALUE 'metrics_reach';
  END IF;
END$$;

-- ─── 2. metrics_kpis table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS metrics_kpis (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id     uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  icon        text NOT NULL DEFAULT 'fa-chart-bar',
  value       text NOT NULL,
  label       text NOT NULL,
  color       text NOT NULL DEFAULT '#ff9a6c',
  sort_order  int  NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE metrics_kpis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read metrics_kpis"  ON metrics_kpis FOR SELECT USING (true);
CREATE POLICY "Auth manage metrics_kpis"  ON metrics_kpis FOR ALL USING (auth.role() = 'authenticated');

-- ─── 3. metrics_stat_cards table ───────────────────────────
CREATE TABLE IF NOT EXISTS metrics_stat_cards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id     uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  icon        text NOT NULL DEFAULT 'fa-building-columns',
  icon_color  text NOT NULL DEFAULT '#911313',
  icon_bg     text NOT NULL DEFAULT 'rgba(145,19,19,0.08)',
  value       text NOT NULL,
  label       text NOT NULL,
  sub_label   text,
  sort_order  int  NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE metrics_stat_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read metrics_stat_cards"  ON metrics_stat_cards FOR SELECT USING (true);
CREATE POLICY "Auth manage metrics_stat_cards"  ON metrics_stat_cards FOR ALL USING (auth.role() = 'authenticated');

-- ─── 4. metrics_sections table (tabs) ──────────────────────
-- Each row = one tab. content JSONB stores tab-specific data.
CREATE TABLE IF NOT EXISTS metrics_sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id     uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  tab_key     text NOT NULL,
  tab_label   text NOT NULL,
  tab_icon    text NOT NULL DEFAULT 'fa-chart-bar',
  sort_order  int  NOT NULL DEFAULT 0,
  visible     bool NOT NULL DEFAULT true,
  content     jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  UNIQUE (page_id, tab_key)
);
ALTER TABLE metrics_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read metrics_sections"  ON metrics_sections FOR SELECT USING (true);
CREATE POLICY "Auth manage metrics_sections"  ON metrics_sections FOR ALL USING (auth.role() = 'authenticated');

-- ─── 5. pages row ──────────────────────────────────────────
INSERT INTO pages (id, title, slug, status, meta)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Impact Metrics',
  'metrics',
  'published',
  '{
    "seo_title": "Impact Metrics — Caritas Rwanda",
    "seo_description": "A transparent, data-driven overview of Caritas Rwanda''s reach, outcomes, and ongoing projects across all nine dioceses and four programme pillars."
  }'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ─── 6. hero_content ───────────────────────────────────────
INSERT INTO hero_content (page_id, heading, subheading, image_url, options)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Impact Metrics & Programme Data',
  'A transparent, data-driven overview of Caritas Rwanda''s reach, outcomes, and ongoing projects across all nine dioceses and four programme pillars.',
  '/img/slide3.jpg',
  '{
    "badge_text": "Data & Transparency",
    "heading_accent": "& Programme Data",
    "updated_label": "Last updated: May 2026 · Data: 2025 – 2026"
  }'::jsonb
)
ON CONFLICT DO NOTHING;

-- ─── 7. KPI cards ──────────────────────────────────────────
DO $$
DECLARE pid uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN
  INSERT INTO metrics_kpis (page_id, icon, value, label, color, sort_order) VALUES
    (pid, 'fa-people-group',       '500K+',  'Beneficiaries Reached Annually',  '#ff9a6c', 1),
    (pid, 'fa-church',             '9',      'Diocesan Caritas Offices Nationwide', '#4ade80', 2),
    (pid, 'fa-layer-group',        '50+',    'Active Programmes',               '#60a5fa', 3),
    (pid, 'fa-handshake',          '12+',    'Global Partners',                 '#c084fc', 4),
    (pid, 'fa-house-chimney-user', '120K+',  'Families Supported',              '#fbbf24', 5),
    (pid, 'fa-map-location-dot',   '30+',    'Districts Covered',               '#f87171', 6),
    (pid, 'fa-person-digging',     '1,200+', 'Community Volunteers',            '#34d399', 7),
    (pid, 'fa-calendar-days',      '66+',    'Years of Service',                '#fb923c', 8)
  ON CONFLICT DO NOTHING;
END$$;

-- ─── 8. Org stat cards ─────────────────────────────────────
DO $$
DECLARE pid uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN
  INSERT INTO metrics_stat_cards (page_id, icon, icon_color, icon_bg, value, label, sub_label, sort_order) VALUES
    (pid, 'fa-calendar-check',   '#911313', 'rgba(145,19,19,0.08)',  '1959',           'Year Founded',            'By Catholic Bishops of Rwanda', 1),
    (pid, 'fa-church',           '#16a34a', 'rgba(22,163,74,0.08)',  '9',              'Diocesan Caritas',        'Partner Offices Nationwide',    2),
    (pid, 'fa-layer-group',      '#2563eb', 'rgba(37,99,235,0.08)',  '4',              'Programme Pillars',       'Health · Welfare · Dev · Admin', 3),
    (pid, 'fa-globe-africa',     '#7c3aed', 'rgba(124,58,237,0.08)', 'Caritas',        'Internationalis Member',  'Global confederation since 1964', 4),
    (pid, 'fa-file-lines',       '#d97706', 'rgba(217,119,6,0.08)',  '2023–27',        'Current Strategic Plan',  '5-year framework',              5),
    (pid, 'fa-scale-balanced',   '#0ea5e9', 'rgba(14,165,233,0.08)', 'Legal',          'Status: National NGO',    'Registered in Rwanda',          6)
  ON CONFLICT DO NOTHING;
END$$;

-- ─── 9. Tab sections ───────────────────────────────────────
DO $$
DECLARE pid uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN

-- Tab 1: Overview
INSERT INTO metrics_sections (page_id, tab_key, tab_label, tab_icon, sort_order, content) VALUES
(pid, 'overview', 'Organisation Overview', 'fa-building-columns', 1,
'{
  "heading": "Organisation Overview",
  "subheading": "Key facts about Caritas Rwanda''s structure, reach and history",
  "highlights": [
    { "value": "500K+", "label": "Beneficiaries Reached", "color": "#911313" },
    { "value": "120K+", "label": "Families Supported",     "color": "#16a34a" },
    { "value": "1,200+","label": "Community Volunteers",   "color": "#2563eb" },
    { "value": "66+",   "label": "Years of Service",       "color": "#d97706" }
  ]
}'::jsonb)
ON CONFLICT (page_id, tab_key) DO NOTHING;

-- Tab 2: Health & ECD
INSERT INTO metrics_sections (page_id, tab_key, tab_label, tab_icon, sort_order, content) VALUES
(pid, 'health', 'Health & ECD', 'fa-heart-pulse', 2,
'{
  "name": "Health & ECD",
  "description": "Early Childhood Development & community health",
  "icon": "fa-heart-pulse",
  "icon_color": "#dc2626",
  "icon_bg": "rgba(220,38,38,0.09)",
  "accent_color": "#dc2626",
  "stats": [
    { "value": "15,000+", "label": "Children Reached" },
    { "value": "7",       "label": "Dioceses Active"  },
    { "value": "340+",    "label": "ECD Centres"      }
  ],
  "progress_bars": [
    { "label": "Father Engagement (Papa Rumuri)", "percent": 78 },
    { "label": "Child Nutrition Improvement",     "percent": 65 },
    { "label": "Facilitator Attendance Rate",     "percent": 95 }
  ],
  "callout": "The Papa Rumuri programme engages fathers directly in early childhood care, achieving 78% active participation — significantly above the national average."
}'::jsonb)
ON CONFLICT (page_id, tab_key) DO NOTHING;

-- Tab 3: Social Welfare
INSERT INTO metrics_sections (page_id, tab_key, tab_label, tab_icon, sort_order, content) VALUES
(pid, 'social', 'Social Welfare', 'fa-people-roof', 3,
'{
  "name": "Social Welfare",
  "description": "Savings groups, family support & community care",
  "icon": "fa-people-roof",
  "icon_color": "#2563eb",
  "icon_bg": "rgba(37,99,235,0.09)",
  "accent_color": "#2563eb",
  "stats": [
    { "value": "4,500+", "label": "Households"    },
    { "value": "35%",    "label": "Income Growth" },
    { "value": "12M+",   "label": "RWF Saved"     }
  ],
  "progress_bars": [
    { "label": "Household Income Increase",    "percent": 35 },
    { "label": "Healthcare Access Rate",       "percent": 71 },
    { "label": "Child Dietary Diversity Score","percent": 55 }
  ],
  "callout": "Solidarity savings groups have mobilised over 12 million RWF in community savings, improving financial resilience across participating households."
}'::jsonb)
ON CONFLICT (page_id, tab_key) DO NOTHING;

-- Tab 4: Development
INSERT INTO metrics_sections (page_id, tab_key, tab_label, tab_icon, sort_order, content) VALUES
(pid, 'development', 'Development', 'fa-seedling', 4,
'{
  "name": "Development",
  "description": "Livelihoods, agriculture & youth entrepreneurship",
  "icon": "fa-seedling",
  "icon_color": "#16a34a",
  "icon_bg": "rgba(22,163,74,0.09)",
  "accent_color": "#16a34a",
  "stats": [
    { "value": "3,500+", "label": "Households"       },
    { "value": "24",     "label": "PSPs Graduated"   },
    { "value": "5",      "label": "Districts Covered" }
  ],
  "progress_bars": [
    { "label": "Agricultural Yield Improvement", "percent": 42 },
    { "label": "Youth PSP Placement Rate",       "percent": 88 },
    { "label": "Food Security Improvement",      "percent": 60 }
  ],
  "callout": "The Professional Service Provider (PSP) model has placed 88% of graduates into sustainable livelihoods, with marked improvements in food security and household income."
}'::jsonb)
ON CONFLICT (page_id, tab_key) DO NOTHING;

-- Tab 5: Administration
INSERT INTO metrics_sections (page_id, tab_key, tab_label, tab_icon, sort_order, content) VALUES
(pid, 'admin', 'Administration', 'fa-building-columns', 5,
'{
  "name": "Administration & Finance",
  "description": "Governance, capacity building & resource management",
  "icon": "fa-building-columns",
  "icon_color": "#7c3aed",
  "icon_bg": "rgba(124,58,237,0.09)",
  "accent_color": "#7c3aed",
  "stats": [
    { "value": "9",    "label": "Dioceses Aligned"  },
    { "value": "29th", "label": "General Assembly"  },
    { "value": "100%", "label": "Audit Compliance"  }
  ],
  "progress_bars": [
    { "label": "Diocesan Reporting Compliance",       "percent": 100 },
    { "label": "Staff Capacity Building Coverage",    "percent": 85  },
    { "label": "Strategic Plan Milestones On-Track",  "percent": 72  }
  ],
  "callout": "All 9 diocesan Caritas offices achieved 100% reporting compliance in 2025, a milestone reflecting strengthened governance and financial transparency."
}'::jsonb)
ON CONFLICT (page_id, tab_key) DO NOTHING;

-- Tab 6: Geographic Reach
INSERT INTO metrics_sections (page_id, tab_key, tab_label, tab_icon, sort_order, content) VALUES
(pid, 'reach', 'Geographic Reach', 'fa-map-location-dot', 6,
'{
  "heading": "Our Reach Across Rwanda",
  "subheading": "Coverage data by province and diocese",
  "provinces": [
    { "name": "Kigali City",   "color": "#911313", "dioceses": 1, "beneficiaries": "180,000+", "districts": 3  },
    { "name": "Northern",      "color": "#2563eb", "dioceses": 2, "beneficiaries": "95,000+",  "districts": 5  },
    { "name": "Southern",      "color": "#16a34a", "dioceses": 2, "beneficiaries": "120,000+", "districts": 8  },
    { "name": "Eastern",       "color": "#d97706", "dioceses": 1, "beneficiaries": "60,000+",  "districts": 7  },
    { "name": "Western",       "color": "#7c3aed", "dioceses": 3, "beneficiaries": "75,000+",  "districts": 7  }
  ]
}'::jsonb)
ON CONFLICT (page_id, tab_key) DO NOTHING;

END$$;
