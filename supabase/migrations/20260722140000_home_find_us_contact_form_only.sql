-- Home: add Find Us (map_section) and retire legacy contact_info block.
-- Contact: hide map_section (Find Us moved to homepage).

do $$
declare
  v_home_id uuid;
  v_contact_id uuid;
  v_max_order integer;
begin
  select id into v_home_id from public.pages where slug = 'home' limit 1;
  select id into v_contact_id from public.pages where slug = 'contact' limit 1;

  if v_home_id is not null then
    if not exists (
      select 1 from public.sections
      where page_id = v_home_id and type = 'map_section'::public.section_type
    ) then
      select coalesce(max("order"), 0) into v_max_order
      from public.sections
      where page_id = v_home_id;

      insert into public.sections (page_id, type, content, "order", visible)
      values (
        v_home_id,
        'map_section'::public.section_type,
        jsonb_build_object(
          'eyebrow', 'Find Us',
          'heading', 'Our Location on',
          'heading_accent', 'The Map',
          'subtext', 'Visit us at the Caritas Rwanda offices in Kigali — we''d love to welcome you.',
          'map_a_title', 'Street View',
          'map_a_subtitle', 'Explore our surroundings in 360°',
          'map_a_embed_url', 'https://www.google.com/maps/embed?pb=!4v1776831990082!6m8!1m7!1shQopyAPx9qTD4VQMaDmVfg!2m2!1d-1.948423749421037!2d30.05942523532954!3f245.44809355904687!4f1.5795459231316045!5f0.7820865974627469',
          'map_b_title', 'Caritas Rwanda HQ',
          'map_b_subtitle', 'Kigali, Rwanda — get directions',
          'map_b_embed_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5112492331314!2d30.05660827473925!3d-1.9485541980337648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425b5be2a55%3A0xcc6cf890e6ae864!2sCaritas%20Rwanda!5e0!3m2!1sen!2srw!4v1776832048548!5m2!1sen!2srw',
          'cta_label', 'Send us a message',
          'cta_url', '/contact'
        ),
        v_max_order + 10,
        true
      );
    end if;

    update public.sections
    set visible = false
    where page_id = v_home_id
      and type = 'contact_info'::public.section_type;
  end if;

  if v_contact_id is not null then
    update public.sections
    set visible = false
    where page_id = v_contact_id
      and type = 'map_section'::public.section_type;
  end if;
end $$;
