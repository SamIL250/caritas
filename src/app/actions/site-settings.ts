"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { FooterSettings } from "@/lib/footer-settings";
import type { Json } from "@/types/database.types";

export type SiteSettingsUpdate = {
  site_name: string;
  tagline: string | null;
  contact_email: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  footer: FooterSettings;
};

export async function updateSiteSettings(payload: SiteSettingsUpdate) {
  const supabase = await createClient();

  const { data: current, error: fetchError } = await supabase
    .from("site_settings")
    .select("options")
    .eq("id", 1)
    .single();

  if (fetchError) {
    return { error: fetchError.message, success: false as const };
  }

  const existing =
    current?.options && typeof current.options === "object" && !Array.isArray(current.options)
      ? (current.options as Record<string, Json | undefined>)
      : {};

  const nextOptions: Json = {
    ...existing,
    footer: payload.footer as unknown as Json,
  };

  const { error: updateError } = await supabase
    .from("site_settings")
    .update({
      site_name: payload.site_name,
      tagline: payload.tagline,
      contact_email: payload.contact_email,
      logo_url: payload.logo_url,
      favicon_url: payload.favicon_url,
      options: nextOptions,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (updateError) {
    return { error: updateError.message, success: false as const };
  }

  revalidatePath("/");
  revalidatePath("/dashboard/settings");
  return { success: true as const };
}
