"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database, Json } from "@/types/database.types";

type ProfilePreferencesRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "preferences">;
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type ProfilePreferences = {
  emailNotifications?: boolean;
  compactCmsLayout?: boolean;
};

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { error: "Not signed in." };
  }

  const fullName = (formData.get("full_name") as string)?.trim() || null;
  const avatarUrl = (formData.get("avatar_url") as string)?.trim() || null;
  const emailNotifications = formData.get("email_notifications") === "on";
  const compactCmsLayout = formData.get("compact_cms") === "on";

  const { data: row } = await supabase.from("profiles").select("preferences").eq("id", user.id).single();
  const r = row as ProfilePreferencesRow | null;
  const rawPrefs = r?.preferences;
  const prev = (rawPrefs && typeof rawPrefs === "object" && !Array.isArray(rawPrefs)
    ? (rawPrefs as Record<string, Json | undefined>)
    : {}) as Record<string, unknown>;

  const preferences: ProfilePreferences = {
    ...prev,
    emailNotifications,
    compactCmsLayout,
  };

  const patch: ProfileUpdate = {
    full_name: fullName,
    avatar_url: avatarUrl,
    preferences: preferences as unknown as Json,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true as const };
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: "Not signed in." };
  }

  const current = formData.get("current_password") as string;
  const next = formData.get("new_password") as string;
  const confirm = formData.get("confirm_password") as string;

  if (!current || !next) {
    return { error: "Enter your current and new password." };
  }
  if (next.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (next !== confirm) {
    return { error: "New passwords do not match." };
  }

  const { error: signErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (signErr) {
    return { error: "Current password is incorrect." };
  }

  const { error: updErr } = await supabase.auth.updateUser({ password: next });
  if (updErr) {
    return { error: updErr.message };
  }

  revalidatePath("/dashboard/profile");
  return { success: true as const };
}
