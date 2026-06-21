"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isValidEmail } from "@/lib/publication-access";
import { sendAccessRequestedAlert, sendAccessGrantedEmail } from "@/lib/send-publication-access-email";
import { resolveSiteOrigin } from "@/lib/site-origin";

export async function requestPublicationAccess(
  publicationId: string,
  email: string,
): Promise<{ success: boolean; error?: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !isValidEmail(trimmed)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from("publication_access_requests")
    .insert({ publication_id: publicationId, requester_email: trimmed });

  if (error) return { success: false, error: error.message };

  // Fetch publication title + admin contact email for notification
  try {
    const [pubRes, settingsRes] = await Promise.all([
      supabase.from("publications").select("title").eq("id", publicationId).maybeSingle(),
      supabase.from("site_settings").select("contact_email").eq("id", 1).maybeSingle(),
    ]);
    const pubTitle = (pubRes.data as any)?.title ?? "Unknown publication";
    const adminEmail = (settingsRes.data as any)?.contact_email ?? "";

    if (adminEmail) {
      await sendAccessRequestedAlert({
        to: adminEmail,
        requesterEmail: trimmed,
        publicationTitle: pubTitle,
        dashboardUrl: `${resolveSiteOrigin()}/dashboard/publications/access-requests`,
      });
    }
  } catch {
    // Notification is best-effort; don't fail the request
  }

  revalidatePath("/dashboard/publications/access-requests");
  return { success: true };
}

export async function updateAccessRequest(
  requestId: string,
  status: "granted" | "denied",
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await (supabase as any)
    .from("publication_access_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) return { success: false, error: error.message };

  // On grant, send the password to the requester
  if (status === "granted") {
    try {
      const reqRes = await (supabase as any)
        .from("publication_access_requests")
        .select("requester_email, publication_id")
        .eq("id", requestId)
        .maybeSingle();

      if (reqRes.data) {
        const pubRes = await supabase
          .from("publications")
          .select("title, slug, access_password")
          .eq("id", reqRes.data.publication_id)
          .maybeSingle();

        const pub = pubRes.data as any;
        if (pub?.access_password) {
          await sendAccessGrantedEmail({
            to: reqRes.data.requester_email,
            publicationTitle: pub.title,
            password: pub.access_password,
            publicationUrl: `${resolveSiteOrigin()}/publications/${pub.slug}`,
          });
        }
      }
    } catch {
      // Email is best-effort; don't fail the grant action
    }
  }

  revalidatePath("/dashboard/publications/access-requests");
  return { success: true };
}

export async function updatePublicationLock(
  publicationId: string,
  is_locked: boolean,
  access_password: string | null,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Fetch old password to detect changes
  const old = await (supabase as any)
    .from("publications")
    .select("access_password")
    .eq("id", publicationId)
    .maybeSingle();

  const newPassword = is_locked && access_password ? access_password.trim() : null;
  const oldPassword = (old?.data as any)?.access_password ?? null;
  const passwordChanged = oldPassword !== newPassword;

  const { error } = await (supabase as any)
    .from("publications")
    .update({
      is_locked,
      access_password: newPassword,
    })
    .eq("id", publicationId);

  if (error) return { success: false, error: error.message };

  // If password changed, reset granted requests so admin can re-grant with new password
  if (passwordChanged) {
    await (supabase as any)
      .from("publication_access_requests")
      .update({ status: "pending", updated_at: new Date().toISOString() })
      .eq("publication_id", publicationId)
      .eq("status", "granted");
  }

  revalidatePath("/publications");
  revalidatePath("/dashboard/publications");
  return { success: true };
}

export async function verifyPublicationPassword(
  publicationId: string,
  password: string,
): Promise<{ valid: boolean }> {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from("publications")
    .select("access_password")
    .eq("id", publicationId)
    .maybeSingle();

  if (!data) return { valid: false };
  return { valid: (data as any).access_password === password };
}
