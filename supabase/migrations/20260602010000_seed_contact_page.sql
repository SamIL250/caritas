-- Seed published Contact page, hero, sections, and dynamic form fields support.
-- Idempotent: INSERT-if-missing for each piece.

-- 1. Add fields_data jsonb column to contact_messages for dynamic form field values
do $$ begin
  alter table public.contact_messages add column if not exists fields_data jsonb not null default '{}';
exception when others then null;
end $$;

comment on column public.contact_messages.fields_data is
  'Key-value pairs for dynamic form fields defined in the contact_info section. Keys match form field keys.';

-- 2. Seed the contact page
insert into public.pages (title, slug, status, meta)
select
  'Contact Us',
  'contact',
  'published'::public.page_status,
  jsonb_build_object(
    'seo_title',
    'Contact Us — Caritas Rwanda',
    'seo_description',
    'Get in touch with Caritas Rwanda — reach our headquarters in Kigali, send us a message, or find us on the map.'
  )
where not exists (select 1 from public.pages p where p.slug = 'contact');
update public.pages
set
  title = 'Contact Us',
  status = 'published'::public.page_status,
  meta = jsonb_build_object(
    'seo_title',
    'Contact Us — Caritas Rwanda',
    'seo_description',
    'Get in touch with Caritas Rwanda — reach our headquarters in Kigali, send us a message, or find us on the map.'
  ),
  updated_at = now()
where slug = 'contact';

-- 3. Seed hero_content for contact page
insert into public.hero_content (
  page_id,
  heading,
  subheading,
  cta_text,
  cta_url,
  image_url,
  options
)
select
  p.id,
  'We''d Love to Hear From You',
  'Have a question, want to partner with us, or simply want to learn more about our work across Rwanda? Reach out — we''re here to help.',
  '',
  '',
  '/img/slide1.webp',
  $hero$
  {
    "align": "center",
    "overlay_opacity": 0.4,
    "text_color": "#ffffff",
    "badge_text": "Get in Touch"
  }
  $hero$::jsonb
from public.pages p
where p.slug = 'contact'
  and not exists (
    select 1 from public.hero_content h where h.page_id = p.id
  );
update public.hero_content hc
set
  heading = 'We''d Love to Hear From You',
  subheading = 'Have a question, want to partner with us, or simply want to learn more about our work across Rwanda? Reach out — we''re here to help.',
  cta_text = '',
  cta_url = '',
  image_url = '/img/slide1.webp',
  options = $hero$
  {
    "align": "center",
    "overlay_opacity": 0.4,
    "text_color": "#ffffff",
    "badge_text": "Get in Touch"
  }
  $hero$::jsonb,
  updated_at = now()
from public.pages p
where p.slug = 'contact'
  and hc.page_id = p.id;

-- 4. Seed contact_info section with dynamic form fields
insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'Contact info & form',
  'contact_info'::public.section_type,
  $sect$
  {
    "eyebrow": "Get In Touch",
    "heading_line1": "Let's Talk &",
    "heading_line2": "Work Together",
    "subtext": "Have a question, want to partner with us, or simply want to learn more about our work across Rwanda? We'd love to hear from you.",
    "headquarters_label": "Headquarters",
    "headquarters": "Kigali, Rwanda",
    "phone_label": "Phone",
    "phone": "(+250) 252 574 344",
    "email_label": "Email",
    "email": "info@caritasrwanda.org",
    "hours_label": "Office Hours",
    "office_hours": "Mon – Fri, 8:00 AM – 5:00 PM",
    "form_title": "Send Us a Message",
    "form_subtitle": "We'll get back to you within 24 hours.",
    "form_fields": [
      { "key": "name", "type": "text", "label": "Full Name", "required": true, "placeholder": "e.g. Jean Hakizimana" },
      { "key": "email", "type": "email", "label": "Email Address", "required": true, "placeholder": "you@example.com" },
      { "key": "phone", "type": "tel", "label": "Phone Number", "required": false, "placeholder": "+250 7xx xxx xxx" },
      { "key": "organization", "type": "text", "label": "Organization", "required": false, "placeholder": "Your organization" },
      { "key": "topic", "type": "select", "label": "Topic", "required": true, "placeholder": "Select a topic", "options": ["General Inquiry", "Partnership", "Volunteering", "Donation", "Media"] },
      { "key": "message", "type": "textarea", "label": "Your Message", "required": true, "placeholder": "Tell us how we can help you..." }
    ]
  }
  $sect$::jsonb,
  10,
  true,
  'contact_info_form'
from public.pages p
where p.slug = 'contact'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'contact_info_form'
  );
update public.sections s
set
  name = 'Contact info & form',
  type = 'contact_info'::public.section_type,
  content = $sect$
  {
    "eyebrow": "Get In Touch",
    "heading_line1": "Let's Talk &",
    "heading_line2": "Work Together",
    "subtext": "Have a question, want to partner with us, or simply want to learn more about our work across Rwanda? We'd love to hear from you.",
    "headquarters_label": "Headquarters",
    "headquarters": "Kigali, Rwanda",
    "phone_label": "Phone",
    "phone": "(+250) 252 574 344",
    "email_label": "Email",
    "email": "info@caritasrwanda.org",
    "hours_label": "Office Hours",
    "office_hours": "Mon – Fri, 8:00 AM – 5:00 PM",
    "form_title": "Send Us a Message",
    "form_subtitle": "We'll get back to you within 24 hours.",
    "form_fields": [
      { "key": "name", "type": "text", "label": "Full Name", "required": true, "placeholder": "e.g. Jean Hakizimana" },
      { "key": "email", "type": "email", "label": "Email Address", "required": true, "placeholder": "you@example.com" },
      { "key": "phone", "type": "tel", "label": "Phone Number", "required": false, "placeholder": "+250 7xx xxx xxx" },
      { "key": "organization", "type": "text", "label": "Organization", "required": false, "placeholder": "Your organization" },
      { "key": "topic", "type": "select", "label": "Topic", "required": true, "placeholder": "Select a topic", "options": ["General Inquiry", "Partnership", "Volunteering", "Donation", "Media"] },
      { "key": "message", "type": "textarea", "label": "Your Message", "required": true, "placeholder": "Tell us how we can help you..." }
    ]
  }
  $sect$::jsonb,
  "order" = 10,
  visible = true,
  updated_at = now()
from public.pages p
where p.slug = 'contact'
  and s.page_id = p.id
  and s.section_key = 'contact_info_form';

-- 5. Seed map_section for contact page
insert into public.sections (page_id, name, type, content, "order", visible, section_key)
select
  p.id,
  'Our Location',
  'map_section'::public.section_type,
  $map$
  {
    "eyebrow": "Find Us",
    "heading": "Our Location on",
    "heading_accent": "The Map",
    "subtext": "Visit us at the Caritas Rwanda offices in Kigali — we'd love to welcome you.",
    "map_a_title": "Street View",
    "map_a_subtitle": "Explore our surroundings in 360°",
    "map_a_embed_url": "https://www.google.com/maps/embed?pb=!4v1776831990082!6m8!1m7!1shQopyAPx9qTD4VQMaDmVfg!2m2!1d-1.948423749421037!2d30.05942523532954!3f245.44809355904687!4f1.5795459231316045!5f0.7820865974627469",
    "map_b_title": "Caritas Rwanda HQ",
    "map_b_subtitle": "Kigali, Rwanda — get directions",
    "map_b_embed_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5112492331314!2d30.05660827473925!3d-1.9485541980337648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425b5be2a55%3A0xcc6cf890e6ae864!2sCaritas%20Rwanda!5e0!3m2!1sen!2srw!4v1776832048548!5m2!1sen!2srw"
  }
  $map$::jsonb,
  20,
  true,
  'contact_map'
from public.pages p
where p.slug = 'contact'
  and not exists (
    select 1
    from public.sections s
    where s.page_id = p.id
      and s.section_key = 'contact_map'
  );
update public.sections s
set
  name = 'Our Location',
  type = 'map_section'::public.section_type,
  content = $map$
  {
    "eyebrow": "Find Us",
    "heading": "Our Location on",
    "heading_accent": "The Map",
    "subtext": "Visit us at the Caritas Rwanda offices in Kigali — we'd love to welcome you.",
    "map_a_title": "Street View",
    "map_a_subtitle": "Explore our surroundings in 360°",
    "map_a_embed_url": "https://www.google.com/maps/embed?pb=!4v1776831990082!6m8!1m7!1shQopyAPx9qTD4VQMaDmVfg!2m2!1d-1.948423749421037!2d30.05942523532954!3f245.44809355904687!4f1.5795459231316045!5f0.7820865974627469",
    "map_b_title": "Caritas Rwanda HQ",
    "map_b_subtitle": "Kigali, Rwanda — get directions",
    "map_b_embed_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5112492331314!2d30.05660827473925!3d-1.9485541980337648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425b5be2a55%3A0xcc6cf890e6ae864!2sCaritas%20Rwanda!5e0!3m2!1sen!2srw!4v1776832048548!5m2!1sen!2srw"
  }
  $map$::jsonb,
  "order" = 20,
  visible = true,
  updated_at = now()
from public.pages p
where p.slug = 'contact'
  and s.page_id = p.id
  and s.section_key = 'contact_map';
