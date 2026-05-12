-- Section template + home page seed for the video_gallery section.
-- Depends on 20260524120000_add_video_gallery_section_type.sql.

insert into public.section_templates (type, label, description, icon, default_content)
values (
  'video_gallery',
  'Video gallery',
  'Curated YouTube videos: spotlight, grid, or carousel layout — supports custom categories and inline lite player.',
  'PlayCircle',
  jsonb_build_object(
    'eyebrow', 'Watch & Learn',
    'eyebrow_icon', 'fa-circle-play',
    'heading_lead', 'Stories in',
    'heading_accent', 'Motion',
    'subtitle',
      'Field reports, campaign films, and event highlights from across the Caritas Rwanda network.',
    'layout', 'spotlight',
    'show_categories', true,
    'all_label', 'All videos',
    'cta_label', 'See more on YouTube',
    'cta_url', '',
    'videos', jsonb_build_array(
      jsonb_build_object(
        'id', 'v-1',
        'title', 'Caritas Rwanda — Year in review',
        'description', 'A short look back at programmes and people we walked alongside this year.',
        'youtube_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'category', 'Highlights',
        'duration', '4:21',
        'published_label', 'Featured'
      ),
      jsonb_build_object(
        'id', 'v-2',
        'title', 'Inside our community campaigns',
        'description', 'Volunteers and partners share what these months on the ground meant for them.',
        'youtube_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'category', 'Campaigns',
        'duration', '3:08',
        'published_label', 'Recent'
      ),
      jsonb_build_object(
        'id', 'v-3',
        'title', 'Voices from the field',
        'description', 'Beneficiaries and field staff describe the work in their own words.',
        'youtube_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'category', 'Stories',
        'duration', '6:42',
        'published_label', 'Popular'
      )
    )
  )
)
on conflict (type) do update set
  label = excluded.label,
  description = excluded.description,
  icon = excluded.icon,
  default_content = excluded.default_content;

-- Home page seed: place between home_about (Rooted in Faith…) and home_programs (Our Programs)
-- by shifting any existing sections at order >= 1 down by 10, then inserting at order = 1.
do $$
declare
  v_home_id uuid;
  v_template_content jsonb;
begin
  select id into v_home_id from public.pages where slug = 'home' limit 1;
  if v_home_id is null then
    return;
  end if;

  -- Idempotent: skip if seed already exists.
  if exists (
    select 1
    from public.sections
    where page_id = v_home_id and section_key = 'home_video_gallery'
  ) then
    return;
  end if;

  -- Shift sections that currently sit at order >= 1 to make room.
  update public.sections
  set "order" = "order" + 10
  where page_id = v_home_id
    and "order" >= 1;

  select default_content into v_template_content
  from public.section_templates
  where type = 'video_gallery'
  limit 1;

  insert into public.sections (page_id, name, type, content, "order", visible, section_key)
  values (
    v_home_id,
    'Home — Video gallery',
    'video_gallery'::public.section_type,
    coalesce(v_template_content, '{}'::jsonb),
    1,
    true,
    'home_video_gallery'
  );
end $$;
