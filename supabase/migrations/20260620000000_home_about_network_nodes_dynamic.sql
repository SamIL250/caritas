-- Make the radial infographic network node numbers and labels editable from the dashboard.
-- Adds a networkNodes array to the home_about section content JSONB.

update public.section_templates
set default_content = default_content || jsonb_build_object(
  'networkNodes', jsonb_build_array(
    jsonb_build_object('value', '1',       'label', 'Caritas Rwanda'),
    jsonb_build_object('value', '10',      'label', 'Diocesan Caritas'),
    jsonb_build_object('value', '229',     'label', 'Parish Caritas'),
    jsonb_build_object('value', '882',     'label', 'Sub-Parish Caritas'),
    jsonb_build_object('value', '29,141',  'label', 'Basic Christian Community Caritas'),
    jsonb_build_object('value', '56,345+', 'label', 'Volunteers')
  )
)
where type = 'home_about';

update public.sections
set content = content || jsonb_build_object(
  'networkNodes', jsonb_build_array(
    jsonb_build_object('value', '1',       'label', 'Caritas Rwanda'),
    jsonb_build_object('value', '10',      'label', 'Diocesan Caritas'),
    jsonb_build_object('value', '229',     'label', 'Parish Caritas'),
    jsonb_build_object('value', '882',     'label', 'Sub-Parish Caritas'),
    jsonb_build_object('value', '29,141',  'label', 'Basic Christian Community Caritas'),
    jsonb_build_object('value', '56,345+', 'label', 'Volunteers')
  )
)
where section_key = 'home_about'
  and exists (
    select 1 from public.pages p
    where p.id = sections.page_id and p.slug = 'home'
  )
  and (content -> 'networkNodes') is null;
