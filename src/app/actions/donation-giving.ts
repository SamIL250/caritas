"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  DONATION_GIVING_DEFAULTS,
  normalizeMtnCode,
  type DonationGivingSettings,
} from "@/lib/donation-giving";

export type DonationGivingUpdate = Omit<DonationGivingSettings, "id">;

function clean(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export async function updateDonationGivingSettings(payload: DonationGivingUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to change donation settings.", success: false as const };
  }

  const next = {
    online_payments_enabled: payload.online_payments_enabled === true,
    title: clean(payload.title, DONATION_GIVING_DEFAULTS.title),
    message: clean(payload.message, DONATION_GIVING_DEFAULTS.message),
    contact_email: payload.contact_email.trim(),
    contact_phone: payload.contact_phone.trim(),
    mtn_code: normalizeMtnCode(payload.mtn_code),
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  };

  const { data: existing, error: readError } = await supabase
    .from("donation_giving_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (readError) return { error: readError.message, success: false as const };

  if (!existing) {
    const { error } = await supabase.from("donation_giving_settings").insert(next);
    if (error) return { error: error.message, success: false as const };
  } else {
    const { error } = await supabase.from("donation_giving_settings").update(next).eq("id", existing.id);
    if (error) return { error: error.message, success: false as const };
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/donations/giving");
  return { success: true as const };
}
