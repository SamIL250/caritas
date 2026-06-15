-- Section template + contact page seed for the faq_section.
-- Depends on 20260602015000_add_faq_section_type.sql.

insert into public.section_templates (type, label, description, icon, default_content)
values (
  'faq_section',
  'FAQ accordion',
  'Expandable FAQ accordion: eyebrow, title, and a list of question/answer pairs.',
  'HelpCircle',
  jsonb_build_object(
    'eyebrow', 'FAQ',
    'title', 'Frequently Asked Questions',
    'items', jsonb_build_array(
      jsonb_build_object(
        'question', 'How can I donate to Caritas Rwanda?',
        'answer', 'You can donate by contacting our office directly via phone at +250 252 574 344 or email at info@caritasrwanda.org. We also accept contributions through bank transfer — our team will provide full banking details upon request. All donations are acknowledged and used transparently for humanitarian programs.'
      ),
      jsonb_build_object(
        'question', 'How can I volunteer with Caritas Rwanda?',
        'answer', 'We welcome volunteers at both our national headquarters in Kigali and through our 10 Diocesan Caritas offices across the country. Send us a message using the form on this page, selecting "Volunteering" as the subject, and include details about your skills and availability.'
      ),
      jsonb_build_object(
        'question', 'How can my organization partner with Caritas Rwanda?',
        'answer', 'Caritas Rwanda actively partners with NGOs, faith-based organizations, government agencies, and international donors. Select "Partnership" in the contact form and describe your organization and the nature of the proposed collaboration. Our partnerships team will respond within two business days.'
      ),
      jsonb_build_object(
        'question', 'How can I access Caritas Rwanda''s annual reports and publications?',
        'answer', 'All annual reports, quarterly newsletters, and strategic plans are freely available on our Publications page. You can download PDFs directly — no registration required. For older archives not listed online, please contact us by email.'
      ),
      jsonb_build_object(
        'question', 'Where are Caritas Rwanda''s Diocesan offices located?',
        'answer', 'Caritas Rwanda has 10 Diocesan Caritas offices covering all provinces of Rwanda: Kabgayi, Nyundo, Butare, Ruhengeri, Kibungo, Byumba, Cyangugu, Gikongoro, Kigali, and Kibuye. You can find contact details for each Diocese on our About page.'
      )
    )
  )
)
on conflict (type) do update set
  label = excluded.label,
  description = excluded.description,
  icon = excluded.icon,
  default_content = excluded.default_content;

-- Seed FAQ section on the contact page (order = 30, after map_section at 20).
do $$
declare
  v_contact_id uuid;
  v_template_content jsonb;
begin
  select id into v_contact_id from public.pages where slug = 'contact' limit 1;
  if v_contact_id is null then
    return;
  end if;

  -- Idempotent: skip if seed already exists.
  if exists (
    select 1
    from public.sections
    where page_id = v_contact_id and section_key = 'contact_faq'
  ) then
    return;
  end if;

  -- Read template default content
  select default_content into v_template_content
  from public.section_templates
  where type = 'faq_section' limit 1;

  if v_template_content is null then
    v_template_content := jsonb_build_object(
      'eyebrow', 'FAQ',
      'title', 'Frequently Asked Questions',
      'items', '[]'::jsonb
    );
  end if;

  insert into public.sections (page_id, name, type, content, "order", visible, section_key)
  values (v_contact_id, 'FAQ accordion', 'faq_section'::public.section_type, v_template_content, 30, true, 'contact_faq');
end;
$$;
