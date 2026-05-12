import { createClient } from "@/lib/supabase/server";
import {
  mergeFooterSettings,
  parseFooterFromOptions,
  type FooterSettings,
} from "@/lib/footer-settings";

/** Footer merged with defaults, for the public site layout. */
export async function getMergedFooterSettings(): Promise<FooterSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("options").eq("id", 1).maybeSingle();
  if (!data?.options) return mergeFooterSettings(undefined);
  return parseFooterFromOptions(data.options);
}
