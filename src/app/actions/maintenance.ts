"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MAINTENANCE_DEFAULTS, type MaintenanceSettings } from "@/lib/maintenance";

export type MaintenanceUpdate = Omit<MaintenanceSettings, "id">;

function clean(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export async function updateMaintenanceSettings(payload: MaintenanceUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to change maintenance mode.", success: false as const };
  }

  const next = {
    enabled: payload.enabled === true,
    eyebrow: clean(payload.eyebrow, MAINTENANCE_DEFAULTS.eyebrow),
    title: clean(payload.title, MAINTENANCE_DEFAULTS.title),
    message: clean(payload.message, MAINTENANCE_DEFAULTS.message),
    contact_label: payload.contact_label.trim(),
    contact_email: payload.contact_email.trim(),
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  };

  const { data: existing } = await supabase
    .from("maintenance_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("maintenance_settings").insert(next);
    if (error) return { error: error.message, success: false as const };
  } else {
    const { error } = await supabase.from("maintenance_settings").update(next).eq("id", existing.id);
    if (error) return { error: error.message, success: false as const };
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/maintenance");
  return { success: true as const };
}
