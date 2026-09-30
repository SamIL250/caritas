-- ============================================================================
-- Impact metrics (cards) — one card per programme metric
-- ----------------------------------------------------------------------------
-- The home page "Impact metrics (cards)" section (type = impact_at_glance)
-- stores programme cards in sections.content->'programs'. Each card currently
-- carries a programme (pillar) name plus its numbers.
--
-- This migration appends a card for every metric below, where the CARD NAME is
-- the programme (pillar) and the card shows that single metric:
--
--   Social Welfare / Health / Development  x 4 metrics = 12 new cards
--
--   .description -> small line above the number (the metric name)
--   .stats[0]    -> { value: number, label: unit }
--
-- Images, icons and accent colours are copied from the existing pillar card of
-- the same programme (so images can be replaced later in the dashboard).
-- Idempotent: a metric whose tab_key already exists is skipped.
--
-- Also drops content.max_cards so the section renders every card (the old
-- hard cap of 12 is gone from the editor and the public component).
-- ============================================================================

do $$
declare
  v_page_id    uuid;
  v_section_id uuid;
  v_content    jsonb;
  v_programs   jsonb;
  v_new_cards  jsonb := '[]'::jsonb;
  v_pillars    jsonb;
  v_pillar     jsonb;
  v_metrics    jsonb;
  v_metric     jsonb;
  v_anchor     jsonb;
  v_card       jsonb;
  i            int;
  j            int;
begin
  -- ---------------------------------------------------------------- target --
  select id into v_page_id from public.pages where slug = 'home';
  if v_page_id is null then
    raise notice 'impact_metric_cards: home page not found — nothing to do';
    return;
  end if;

  select s.id, s.content
    into v_section_id, v_content
    from public.sections s
   where s.page_id = v_page_id
     and s.type = 'impact_at_glance'
   order by s."order" nulls last
   limit 1;

  if v_section_id is null then
    raise notice 'impact_metric_cards: no impact_at_glance section on the home page — nothing to do';
    return;
  end if;

  v_content   := coalesce(v_content, '{}'::jsonb);
  v_programs  := case
    when jsonb_typeof(v_content -> 'programs') = 'array' then v_content -> 'programs'
    else '[]'::jsonb
  end;

  -- ------------------------------------------------------------- the data --
  -- "lookup" = slug/tab_key values of the existing pillar card to borrow
  -- icon, accent colour, image and tab label from.
  v_pillars := '[
    {
      "name": "Social Welfare",
      "slug": "social-welfare",
      "lookup": ["social-welfare", "social"],
      "icon": "fa-people-roof",
      "accent": "#2563eb",
      "metrics": [
        { "key": "metric-social-income-locally-raised", "name": "Income Locally Raised",            "value": "239,508,573", "unit": "Frw" },
        { "key": "metric-social-community-solidarity",  "name": "Community Solidarity",             "value": "102,826",     "unit": "People" },
        { "key": "metric-social-poverty-behaviour",     "name": "Poverty Behavior Change",          "value": "163,582",     "unit": "people" },
        { "key": "metric-social-education-support",     "name": "Education Support",                "value": "284,038",     "unit": "students" }
      ]
    },
    {
      "name": "Health",
      "slug": "health",
      "lookup": ["health"],
      "icon": "fa-heart-pulse",
      "accent": "#c01c28",
      "metrics": [
        { "key": "metric-health-nutrition",     "name": "Nutritional Education and Rehabilitation",              "value": "690,716",    "unit": "" },
        { "key": "metric-health-ecd",           "name": "ECD Program",                                           "value": "527,932",    "unit": "Children" },
        { "key": "metric-health-nfp",           "name": "Natural Family Planning (PFN)",                         "value": "430,139",    "unit": "Couples" },
        { "key": "metric-health-services",      "name": "Preventive, Promotional, Curative and Palliative Services", "value": "3,411,982", "unit": "people" }
      ]
    },
    {
      "name": "Development",
      "slug": "development",
      "lookup": ["development"],
      "icon": "fa-seedling",
      "accent": "#16a34a",
      "metrics": [
        { "key": "metric-development-agroforestry", "name": "Agroforestry",            "value": "83,862,170", "unit": "Trees" },
        { "key": "metric-development-youth",        "name": "Youth",                   "value": "175,374",    "unit": "Jobs Created" },
        { "key": "metric-development-clean-energy", "name": "Access to Clean Energy",  "value": "1,098",      "unit": "HH with Solar Energy" },
        { "key": "metric-development-vsla",         "name": "VSLA",                    "value": "45,903",     "unit": "Groups" }
      ]
    }
  ]'::jsonb;

  -- ------------------------------------------------------ build new cards --
  for i in 0 .. jsonb_array_length(v_pillars) - 1 loop
    v_pillar  := v_pillars -> i;
    v_metrics := case
      when jsonb_typeof(v_pillar -> 'metrics') = 'array' then v_pillar -> 'metrics'
      else '[]'::jsonb
    end;

    -- existing pillar card (borrow image / icon / accent when present)
    select elem
      into v_anchor
      from jsonb_array_elements(v_programs) elem
     where exists (
             select 1
               from jsonb_array_elements_text(v_pillar -> 'lookup') lk
              where lk = lower(coalesce(elem ->> 'slug', ''))
                 or lk = lower(coalesce(elem ->> 'tab_key', ''))
           )
     limit 1;

    for j in 0 .. jsonb_array_length(v_metrics) - 1 loop
      v_metric := v_metrics -> j;

      -- already applied?
      if exists (
           select 1
             from jsonb_array_elements(v_programs || v_new_cards) e
          where e ->> 'tab_key' = v_metric ->> 'key'
         )
      then
        continue;
      end if;

      v_card := jsonb_build_object(
        'name',         v_pillar ->> 'name',
        'tab_label',    v_pillar ->> 'name',
        'tab_key',      v_metric ->> 'key',
        'tab_icon',     coalesce(v_anchor ->> 'tab_icon', v_pillar ->> 'icon'),
        'slug',         v_pillar ->> 'slug',
        'icon',         coalesce(v_anchor ->> 'icon', v_pillar ->> 'icon'),
        'accent_color', coalesce(v_anchor ->> 'accent_color', v_pillar ->> 'accent'),
        'image_url',    coalesce(v_anchor ->> 'image_url', ''),
        'description',  v_metric ->> 'name',
        'stats', jsonb_build_array(
                   jsonb_build_object(
                     'value', v_metric ->> 'value',
                     'label', coalesce(v_metric ->> 'unit', '')
                   )
                 )
      );

      v_new_cards := v_new_cards || jsonb_build_array(v_card);
    end loop;
  end loop;

  if jsonb_array_length(v_new_cards) = 0 then
    raise notice 'impact_metric_cards: cards already present — skipping insert';
  else
    v_content := jsonb_set(v_content, '{programs}', v_programs || v_new_cards);
    raise notice 'impact_metric_cards: added % card(s)', jsonb_array_length(v_new_cards);
  end if;

  -- no cap on how many cards render
  v_content := v_content - 'max_cards';

  update public.sections
     set content = v_content
   where id = v_section_id;
end $$;
