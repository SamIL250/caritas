-- Sidebar cards on featured_campaign are driven by published community_campaigns (max 2); remove stale demo cards from template default_content.

update public.section_templates
set default_content = '{
    "anchor_id": "featured-campaign",
    "eyebrow": "Make a Difference",
    "heading": "Be Part of",
    "heading_accent": "the Change",
    "body": "Your support enables us to continue transforming lives and building sustainable communities across all nine dioceses of Rwanda.",
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
where type = 'featured_campaign'::public.section_type;
