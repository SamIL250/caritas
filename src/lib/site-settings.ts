import { createClient } from "@/lib/supabase/server";
import {
  mergeFooterSettings,
  parseFooterFromOptions,
  type FooterSettings,
} from "@/lib/footer-settings";
import { parseCookieSettings, type CookieConsentSettings } from "@/lib/cookie-consent";
import {
  parseTypographyFromOptions,
  TYPOGRAPHY_DEFAULTS,
  type TypographySettings,
} from "@/lib/typography-settings";

/** Footer merged with defaults, for the public site layout. */
export async function getMergedFooterSettings(): Promise<FooterSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("options").eq("id", 1).maybeSingle();
  if (!data?.options) return mergeFooterSettings(undefined);
  return parseFooterFromOptions(data.options);
}

/** Font size controls merged with defaults, for the public site layout. */
export async function getMergedTypographySettings(): Promise<TypographySettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("options").eq("id", 1).maybeSingle();
  if (!data?.options) return { ...TYPOGRAPHY_DEFAULTS };
  return parseTypographyFromOptions(data.options);
}

/** Cookie consent settings for the public site banner. */
export async function getCookieConsentSettings(): Promise<CookieConsentSettings | null> {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('cookie_consent_settings')
    .select('*')
    .limit(1)
    .maybeSingle();
  return data ? parseCookieSettings(data) : null;
}
