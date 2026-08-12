-- Ensure Lerony appears in any published partners section items (homepage CMS).

DO $$
DECLARE
  r RECORD;
  items jsonb;
  has_lerony boolean;
  lerony jsonb := jsonb_build_object(
    'name', 'Lerony',
    'logo_url', '/img/lerony_logo.png',
    'url', 'https://lerony.com'
  );
BEGIN
  FOR r IN
    SELECT s.id, s.content
    FROM sections s
    WHERE s.section_type::text = 'partners'
  LOOP
    items := COALESCE(r.content->'items', '[]'::jsonb);
    IF jsonb_typeof(items) <> 'array' THEN
      items := '[]'::jsonb;
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(items) AS el
      WHERE lower(coalesce(el->>'name', '')) = 'lerony'
    ) INTO has_lerony;

    IF NOT has_lerony THEN
      UPDATE sections
      SET
        content = jsonb_set(r.content, '{items}', items || jsonb_build_array(lerony), true),
        updated_at = now()
      WHERE id = r.id;
    ELSE
      -- Refresh logo/url for existing Lerony entries
      UPDATE sections
      SET
        content = jsonb_set(
          r.content,
          '{items}',
          (
            SELECT jsonb_agg(
              CASE
                WHEN lower(coalesce(el->>'name', '')) = 'lerony' THEN
                  el || lerony
                ELSE el
              END
            )
            FROM jsonb_array_elements(items) AS el
          ),
          true
        ),
        updated_at = now()
      WHERE id = r.id;
    END IF;
  END LOOP;
END $$;
