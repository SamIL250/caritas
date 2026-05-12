-- Depends on: 20260428120000 (map_section enum committed).
insert into public.section_templates (type, label, description, icon, default_content)
values (
  'map_section',
  'Our Location',
  'Street view and HQ map embeds; headline, copy, and two embed URLs.',
  'MapPin',
  jsonb_build_object(
    'eyebrow', 'Find Us',
    'heading', 'Our Location on',
    'heading_accent', 'G-Map',
    'subtext', 'Visit us at the Caritas Rwanda offices in Kigali — we would love to welcome you.',
    'map_a_title', 'Street View',
    'map_a_subtitle', 'Explore our surroundings in 360°',
    'map_a_embed_url', 'https://www.google.com/maps/embed?pb=!4v1776831990082!6m8!1m7!1shQopyAPx9qTD4VQMaDmVfg!2m2!1d-1.948423749421037!2d30.05942523532954!3f245.44809355904687!4f1.5795459231316045!5f0.7820865974627469',
    'map_b_title', 'Caritas Rwanda HQ',
    'map_b_subtitle', 'Kigali, Rwanda — get directions',
    'map_b_embed_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5112492331314!2d30.05660827473925!3d-1.9485541980337648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425b5be2a55%3A0xcc6cf890e6ae864!2sCaritas%20Rwanda!5e0!3m2!1sen!2srw!4v1776832048548!5m2!1sen!2srw'
  )
)
on conflict (type) do update set
  label = excluded.label,
  description = excluded.description,
  icon = excluded.icon,
  default_content = excluded.default_content;
