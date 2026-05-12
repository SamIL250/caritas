"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database.types";
import { isMailFailure } from "@/lib/mail";
import {
  sendVolunteerAcceptanceEmail,
  sendVolunteerRejectionEmail,
} from "@/lib/send-volunteer-email";

export type VolunteerApplicationRow =
  Database["public"]["Tables"]["volunteer_applications"]["Row"];

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be signed in.");
  return { supabase, user };
}

export async function createVolunteerApplication(input: {
  preferredCampaignId: string | null;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  motivation: string;
  skillsExperience: string;
  availability: string;
  languages: string;
}): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();

    const full_name = input.fullName.trim();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    const city = input.city.trim();
    const motivation = input.motivation.trim();
    const skills_experience = input.skillsExperience.trim();
    const availability = input.availability.trim();
    const languages = input.languages.trim();

    if (full_name.length < 2) return { error: "Please enter your full name." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email." };
    if (!motivation.length) return { error: "Please tell us why you want to volunteer." };
    if (!skills_experience.length)
      return { error: "Please describe your skills or relevant experience." };
    if (!availability.length) return { error: "Please describe when you are available." };

    let preferred_campaign_id: string | null = input.preferredCampaignId?.trim() || null;
    if (preferred_campaign_id) {
      const { data: camp } = await supabase
        .from("community_campaigns")
        .select("id, volunteering_enabled, status")
        .eq("id", preferred_campaign_id)
        .maybeSingle();
      if (
        !camp ||
        camp.status !== "published" ||
        camp.volunteering_enabled !== true
      ) {
        return { error: "That campaign is not open for volunteer sign-ups." };
      }
    }

    const { error } = await supabase.from("volunteer_applications").insert({
      status: "pending",
      preferred_campaign_id,
      full_name,
      email,
      phone,
      city,
      motivation,
      skills_experience,
      availability,
      languages,
    });

    if (error) return { error: error.message };

    revalidatePath("/dashboard/volunteers");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Could not submit application." };
  }
}

export async function updateVolunteerApplicationStaff(
  applicationId: string,
  form: FormData,
): Promise<{ error?: string }> {
  try {
    const { supabase, user } = await requireStaff();

    const status = String(form.get("status") || "pending") as "pending" | "accepted" | "rejected";
    if (!["pending", "accepted", "rejected"].includes(status)) return { error: "Invalid status." };

    const assigned_campaign_raw = String(form.get("assigned_campaign_id") || "").trim();
    const assigned_campaign_id = assigned_campaign_raw || null;

    if (assigned_campaign_id) {
      const { data: camp } = await supabase
        .from("community_campaigns")
        .select("id")
        .eq("id", assigned_campaign_id)
        .maybeSingle();
      if (!camp) return { error: "Assigned campaign not found." };
    }

    const assigned_role_label = String(form.get("assigned_role_label") || "").trim().slice(0, 200);
    const staff_notes = String(form.get("staff_notes") || "").trim().slice(0, 4000);
    const rejection_reason = String(form.get("rejection_reason") || "").trim().slice(0, 4000);
    const acceptance_note = String(form.get("acceptance_note") || "").trim().slice(0, 2000);

    const sendAcceptEmail = form.get("notify_accept") === "on";
    const sendRejectEmail = form.get("notify_reject") === "on";

    const { data: prev, error: prevErr } = await supabase
      .from("volunteer_applications")
      .select("*")
      .eq("id", applicationId)
      .maybeSingle();
    if (prevErr || !prev) return { error: "Application not found." };

    const row = prev as VolunteerApplicationRow;

    const updates: Database["public"]["Tables"]["volunteer_applications"]["Update"] = {
      status,
      assigned_campaign_id,
      assigned_role_label,
      staff_notes,
      rejection_reason,
    };

    const nowIso = new Date().toISOString();
    if (status !== row.status) {
      updates.reviewed_at = nowIso;
      updates.reviewed_by = user.id;
    }

    let acceptance_email_sent_at = row.acceptance_email_sent_at;
    let rejection_email_sent_at = row.rejection_email_sent_at;

    if (status === "accepted" && sendAcceptEmail && !row.acceptance_email_sent_at) {
      let campaignTitle: string | null = null;
      if (assigned_campaign_id) {
        const { data: c } = await supabase
          .from("community_campaigns")
          .select("title")
          .eq("id", assigned_campaign_id)
          .maybeSingle();
        campaignTitle = c?.title ?? null;
      }
      const sendRes = await sendVolunteerAcceptanceEmail({
        to: row.email,
        applicantName: row.full_name,
        roleLabel: assigned_role_label,
        campaignTitle,
        extraNote: acceptance_note || undefined,
      });
      if (sendRes.ok) {
        acceptance_email_sent_at = nowIso;
      } else if (isMailFailure(sendRes) && !sendRes.skipped) {
        return { error: sendRes.error };
      }
    }

    if (status === "rejected" && sendRejectEmail && !row.rejection_email_sent_at) {
      const sendRes = await sendVolunteerRejectionEmail({
        to: row.email,
        applicantName: row.full_name,
        reason: rejection_reason || undefined,
      });
      if (sendRes.ok) {
        rejection_email_sent_at = nowIso;
      } else if (isMailFailure(sendRes) && !sendRes.skipped) {
        return { error: sendRes.error };
      }
    }

    updates.acceptance_email_sent_at = acceptance_email_sent_at;
    updates.rejection_email_sent_at = rejection_email_sent_at;

    const { error } = await supabase
      .from("volunteer_applications")
      .update(updates)
      .eq("id", applicationId);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/volunteers");
    revalidatePath(`/dashboard/volunteers/${applicationId}`);
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to save." };
  }
}
