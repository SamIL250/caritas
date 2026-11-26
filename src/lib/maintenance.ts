import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type MaintenanceSettings = {
  id: string | null;
  enabled: boolean;
  eyebrow: string;
  title: string;
  message: string;
  contact_label: string;
  contact_email: string;
};

export const MAINTENANCE_DEFAULTS: MaintenanceSettings = {
  id: null,
  enabled: false,
  eyebrow: "We'll be back soon",
  title: "This website is under maintenance",
  message:
    "We are making a few improvements so Caritas Rwanda can serve you better. The site will be live again shortly.",
  contact_label: "Need to reach us?",
  contact_email: "info@caritasrwanda.org",
};

function textOr(raw: unknown, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/** Coerce a database row into safe copy. Blank title or message fall back to defaults. */
export function parseMaintenanceSettings(row: unknown): MaintenanceSettings {
  if (!row || typeof row !== "object") return { ...MAINTENANCE_DEFAULTS };
  const src = row as Record<string, unknown>;
  const email = typeof src.contact_email === "string" ? src.contact_email.trim() : "";
  return {
    id: typeof src.id === "string" ? src.id : null,
    enabled: src.enabled === true,
    eyebrow: textOr(src.eyebrow, MAINTENANCE_DEFAULTS.eyebrow),
    title: textOr(src.title, MAINTENANCE_DEFAULTS.title),
    message: textOr(src.message, MAINTENANCE_DEFAULTS.message),
    contact_label:
      typeof src.contact_label === "string" ? src.contact_label.trim() : MAINTENANCE_DEFAULTS.contact_label,
    contact_email: email,
  };
}

/** Public maintenance copy. Missing table or row keeps the site online. */
export const getMaintenanceSettings = cache(async (): Promise<MaintenanceSettings> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("maintenance_settings")
      .select("id, enabled, eyebrow, title, message, contact_label, contact_email")
      .limit(1)
      .maybeSingle();

    if (error || !data) return { ...MAINTENANCE_DEFAULTS };
    return parseMaintenanceSettings(data);
  } catch {
    return { ...MAINTENANCE_DEFAULTS };
  }
});
