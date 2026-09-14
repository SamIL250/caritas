-- Site-wide font size controls (dashboard → Typography).
--
-- Stored alongside the footer inside site_settings.options so no schema change
-- is needed. Seeds the neutral defaults (scale 1, floor disabled) which render
-- the site exactly as it does today.

update public.site_settings
set
  options = coalesce(options, '{}'::jsonb)
    || jsonb_build_object(
         'typography',
         coalesce(options -> 'typography', '{}'::jsonb)
           || jsonb_build_object(
                'scale', coalesce(options -> 'typography' -> 'scale', to_jsonb(1::numeric)),
                'minTextRem', coalesce(options -> 'typography' -> 'minTextRem', to_jsonb(0::numeric))
              )
       ),
  updated_at = now()
where id = 1;
