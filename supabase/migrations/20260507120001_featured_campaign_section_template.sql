-- Depends on 20260507120000_featured_campaign_section.sql — enum value must exist from a committed migration.

insert into public.section_templates (type, label, description, icon, default_content)
values (
  'featured_campaign'::public.section_type,
  'Featured campaign',
  'Homepage “Be Part of the Change” glass block; featured story comes from Campaigns → Feature on home.',
  'Sparkles',
  '{
    "anchor_id": "featured-campaign",
    "eyebrow": "Make a Difference",
    "heading": "Be Part of",
    "heading_accent": "the Change",
    "body": "Your support enables us to continue transforming lives and building sustainable communities across all nine dioceses of Rwanda.",
    "sidebar_cards": [
      {
        "image_url": "https://caritasrwanda.org/wp-content/uploads/2026/03/162A8733-scaled.jpg",
        "image_alt": "Young student supported through education programmes",
        "category_label": "Education",
        "category_icon": "fa-book-open",
        "category_tone": "rose",
        "name": "Jean-Pierre Habimana, 12",
        "description": "An orphan from Musanze seeking school fees and supplies to complete his primary education and build a future.",
        "raised_label": "RWF 180,000 raised",
        "goal_pct_label": "72% of RWF 250,000",
        "progress_pct": 72,
        "bar_tone": "sky",
        "button_text": "Support Jean-Pierre",
        "button_url": "#donate"
      },
      {
        "image_url": "https://caritasrwanda.org/wp-content/uploads/2026/03/162A9069-scaled.jpg",
        "image_alt": "Young adult pursuing vocational skills training",
        "category_label": "Livelihood",
        "category_icon": "fa-briefcase",
        "category_tone": "teal",
        "name": "Emmanuel Nkurunziza, 24",
        "description": "A young man from Rwamagana seeking vocational training funds to become a licensed electrician and support his widowed mother.",
        "raised_label": "RWF 90,000 raised",
        "goal_pct_label": "45% of RWF 200,000",
        "progress_pct": 45,
        "bar_tone": "teal",
        "button_text": "Support Emmanuel",
        "button_url": "#donate"
      }
    ],
    "impact_panel": {
      "title": "Our Collective Impact",
      "icon": "fa-chart-line",
      "items": [
        { "num": "150K+", "label": "Lives Transformed" },
        { "num": "67+", "label": "Years of Service" },
        { "num": "9", "label": "Dioceses Covered" },
        { "num": "8K", "label": "Active Volunteers" }
      ]
    },
    "bottom_primary_text": "Start Donating Today",
    "bottom_primary_url": "#donate",
    "bottom_secondary_text": "Volunteer with Us",
    "bottom_secondary_url": "#"
  }'::jsonb
)
on conflict (type) do update set
  label = excluded.label,
  description = excluded.description,
  icon = excluded.icon,
  default_content = excluded.default_content;
