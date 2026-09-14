"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  mergeTypographySettings,
  type TypographySettings,
} from "@/lib/typography-settings";
import type { Json } from "@/types/database.types";

/**
 * Persist the site-wide font size controls into `site_settings.options.typography`,
 * preserving every other key in the blob (footer, etc.).
 */
export async function updateTypographySettings(payload: TypographySettings) {
  const supabase = await createClient();

  const safe = mergeTypographySettings(payload);

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
    typography: safe as unknown as Json,
  };

  const { data: updated, error: updateError } = await supabase
    .from("site_settings")
    .update({
      options: nextOptions,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .select("id");

  if (updateError) {
    return { error: updateError.message, success: false as const };
  }

  // The admin-only RLS policy filters the row out rather than erroring, so an
  // empty result means the account lacks permission.
  if (!updated?.length) {
    return {
      error: "You need an administrator account to change typography settings.",
      success: false as const,
    };
  }

  // Font sizes apply to every public route, so drop the whole public cache.
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/typography");
  return { success: true as const, settings: safe };
}
