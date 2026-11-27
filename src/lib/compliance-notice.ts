import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type ComplianceNoticeSettings = {
  id: string | null;
  enabled: boolean;
  title: string;
  image_url: string;
  image_alt: string;
  report_label: string;
  contact_email: string;
  contact_phone: string;
  info_label: string;
  info_url: string;
};

export const COMPLIANCE_NOTICE_DEFAULTS: ComplianceNoticeSettings = {
  id: null,
  enabled: true,
  title: "Zero tolerance",
  image_url: "/img/compliance-zero-tolerance.webp",
  image_alt:
    "Caritas Rwanda zero tolerance against sexual exploitation and abuse, fraud, abuse of authority, corruption, misuse of assets, and harassment.",
  report_label: "You can report your concerns directly through",
  contact_email: "inspector@caritasrwanda.org",
  contact_phone: "+250 793 455 552",
  info_label: "Need more information",
  info_url: "https://caritasrwanda.org/home/policies/",
};

function textOr(raw: unknown, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function optionalText(raw: unknown, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  return raw.trim();
}

export function parseComplianceNoticeSettings(row: unknown): ComplianceNoticeSettings {
  if (!row || typeof row !== "object") return { ...COMPLIANCE_NOTICE_DEFAULTS };
  const src = row as Record<string, unknown>;
  return {
    id: typeof src.id === "string" ? src.id : null,
    enabled: src.enabled !== false,
    title: textOr(src.title, COMPLIANCE_NOTICE_DEFAULTS.title),
    image_url: textOr(src.image_url, COMPLIANCE_NOTICE_DEFAULTS.image_url),
    image_alt: textOr(src.image_alt, COMPLIANCE_NOTICE_DEFAULTS.image_alt),
    report_label: optionalText(src.report_label, COMPLIANCE_NOTICE_DEFAULTS.report_label),
    contact_email: optionalText(src.contact_email, COMPLIANCE_NOTICE_DEFAULTS.contact_email),
    contact_phone: optionalText(src.contact_phone, COMPLIANCE_NOTICE_DEFAULTS.contact_phone),
    info_label: optionalText(src.info_label, COMPLIANCE_NOTICE_DEFAULTS.info_label),
    info_url: optionalText(src.info_url, COMPLIANCE_NOTICE_DEFAULTS.info_url),
  };
}

/** Public homepage notice. A missing table still shows the poster. */
export const getComplianceNoticeSettings = cache(async (): Promise<ComplianceNoticeSettings> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("compliance_notice_settings")
      .select(
        "id, enabled, title, image_url, image_alt, report_label, contact_email, contact_phone, info_label, info_url",
      )
      .limit(1)
      .maybeSingle();

    if (error || !data) return { ...COMPLIANCE_NOTICE_DEFAULTS };
    return parseComplianceNoticeSettings(data);
  } catch {
    return { ...COMPLIANCE_NOTICE_DEFAULTS };
  }
});
