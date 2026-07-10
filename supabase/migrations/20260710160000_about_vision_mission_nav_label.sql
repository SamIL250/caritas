-- Rename About page quick-nav label: Mission & Vision → Vision & Mission

update public.hero_content hc
set
  options = jsonb_set(
    hc.options,
    '{quick_nav}',
    (
      select coalesce(
        jsonb_agg(
          case
            when elem->>'href' = '#mission'
              then jsonb_set(elem, '{label}', '"Vision & Mission"'::jsonb)
            else elem
          end
          order by ord
        ),
        hc.options->'quick_nav'
      )
      from jsonb_array_elements(hc.options->'quick_nav') with ordinality as t(elem, ord)
    ),
    true
  ),
  updated_at = now()
from public.pages p
where p.slug = 'about'
  and hc.page_id = p.id
  and hc.options ? 'quick_nav'
  and exists (
    select 1
    from jsonb_array_elements(hc.options->'quick_nav') elem
    where elem->>'href' = '#mission'
      and elem->>'label' = 'Mission & Vision'
  );
