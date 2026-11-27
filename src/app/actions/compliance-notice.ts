"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  COMPLIANCE_NOTICE_DEFAULTS,
  type ComplianceNoticeSettings,
} from "@/lib/compliance-notice";

export type ComplianceNoticeUpdate = Omit<ComplianceNoticeSettings, "id">;

function requiredText(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export async function updateComplianceNoticeSettings(payload: ComplianceNoticeUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to change this notice.", success: false as const };
  }

  const next = {
    enabled: payload.enabled === true,
    title: requiredText(payload.title, COMPLIANCE_NOTICE_DEFAULTS.title),
    image_url: requiredText(payload.image_url, COMPLIANCE_NOTICE_DEFAULTS.image_url),
    image_alt: requiredText(payload.image_alt, COMPLIANCE_NOTICE_DEFAULTS.image_alt),
    report_label: payload.report_label.trim(),
    contact_email: payload.contact_email.trim(),
    contact_phone: payload.contact_phone.trim(),
    info_label: payload.info_label.trim(),
    info_url: payload.info_url.trim(),
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  };

  const { data: existing } = await supabase
    .from("compliance_notice_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("compliance_notice_settings").insert(next);
    if (error) return { error: error.message, success: false as const };
  } else {
    const { error } = await supabase
      .from("compliance_notice_settings")
      .update(next)
      .eq("id", existing.id);
    if (error) return { error: error.message, success: false as const };
  }

  revalidatePath("/");
  revalidatePath("/dashboard/compliance");
  return { success: true as const };
}
