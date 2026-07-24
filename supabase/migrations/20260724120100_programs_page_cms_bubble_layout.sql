-- Programs page CMS: bubble layout column, library + partner sections.

alter table public.programs
  add column if not exists bubble_layout jsonb not null default '{}'::jsonb;

insert into public.section_templates (type, label, description, icon, default_content)
values (
  'programs_library',
  'Programs library',
  'Map-backed project circles, success stories, and news on the Programs page.',
  'LayoutGrid',
  jsonb_build_object(
    'bubble_initial_count', 3,
    'view_all_label', 'View All Programs',
    'view_all_less_label', 'Show Less',
    'show_success_stories', true,
    'show_news', true
  )
)
on conflict (type) do update set
  label = excluded.label,
  description = excluded.description,
  icon = excluded.icon,
  default_content = excluded.default_content;

do $$
declare
  v_page_id uuid;
begin
  select id into v_page_id from public.pages where slug = 'programs' limit 1;
  if v_page_id is null then
    return;
  end if;

  insert into public.sections (page_id, name, type, content, "order", visible, section_key)
  select
    v_page_id,
    'Programs library',
    'programs_library'::public.section_type,
    jsonb_build_object(
      'bubble_initial_count', 3,
      'view_all_label', 'View All Programs',
      'view_all_less_label', 'Show Less',
      'show_success_stories', true,
      'show_news', true
    ),
    10,
    true,
    'programs_library'
  where not exists (
    select 1 from public.sections s
    where s.page_id = v_page_id and s.section_key = 'programs_library'
  );

  insert into public.sections (page_id, name, type, content, "order", visible, section_key)
  select
    v_page_id,
    'Partner with us',
    'cta'::public.section_type,
    jsonb_build_object(
      'eyebrow', 'Partner With Us',
      'eyebrow_icon', 'fa-handshake',
      'title', E'Join the Mission of\nHuman Dignity',
      'subtitle', 'Whether you want to donate, volunteer, or partner with us — every act of solidarity helps Caritas Rwanda reach more families across the country.',
      'primary_label', 'Donate Now',
      'secondary_label', 'Back to Top',
      'secondary_action', 'back_to_top',
      'outline_label', 'Contact Us',
      'outline_href', '/contact'
    ),
    20,
    true,
    'programs_partner'
  where not exists (
    select 1 from public.sections s
    where s.page_id = v_page_id and s.section_key = 'programs_partner'
  );
end $$;
