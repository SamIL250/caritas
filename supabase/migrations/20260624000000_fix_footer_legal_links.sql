-- Fix footer legal links hrefs in site_settings.options->footer->legalLinks
-- Old: /privacy → /privacy-policy, /cookies → /cookie-policy

DO $$
DECLARE
  links jsonb;
  new_links jsonb := '[]'::jsonb;
  item jsonb;
  href text;
  label text;
BEGIN
  SELECT options#>'{footer,legalLinks}' INTO links FROM site_settings WHERE id = 1;
  IF links IS NULL THEN RETURN; END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(links)
  LOOP
    label := item->>'label';
    href := item->>'href';
    IF label = 'Privacy Policy' AND href = '/privacy' THEN
      href := '/privacy-policy';
    ELSIF label = 'Cookie Policy' AND href = '/cookies' THEN
      href := '/cookie-policy';
    END IF;
    new_links := new_links || jsonb_build_object('label', label, 'href', href);
  END LOOP;

  UPDATE site_settings
  SET options = jsonb_set(options, '{footer,legalLinks}', new_links)
  WHERE id = 1;
END $$;
