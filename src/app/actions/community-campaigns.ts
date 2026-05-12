"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/news";
import type { Database, Json } from "@/types/database.types";

type CampaignStatus = Database["public"]["Enums"]["community_campaign_status"];

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be signed in.");
  return { supabase, user };
}

async function nextUniqueCampaignSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
  excludeId?: string,
): Promise<string> {
  let candidate = base || "campaign";
  for (let n = 0; n < 40; n++) {
    const row = await supabase.from("community_campaigns").select("id").eq("slug", candidate).maybeSingle();
    const id = row.data?.id as string | undefined;
    if (!id || (excludeId && id === excludeId)) return candidate;
    candidate = `${base}-${n + 2}`;
  }
  return `${base}-${Date.now()}`;
}

function parsePublishedAt(raw: FormDataEntryValue | null): string | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function parsePresetAmounts(raw: FormDataEntryValue | null): Json {
  const s = String(raw || "").trim();
  if (!s) return [1000, 5000, 10000, 50000];
  const nums = s
    .split(/[\s,]+/)
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isFinite(n) && n >= 100);
  return nums.length ? nums : [1000, 5000, 10000, 50000];
}

function parseGoalAmount(raw: FormDataEntryValue | null): number | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Clears home-featured flag from every campaign, then optionally sets one published row. */
export async function setFeaturedCampaignOnHome(formData: FormData) {
  const { supabase } = await requireStaff();

  const campaignIdRaw = formData.get("campaign_id");
  const campaignId = typeof campaignIdRaw === "string" && campaignIdRaw.length ? campaignIdRaw : null;

  await supabase.from("community_campaigns").update({ featured_on_home: false }).eq("featured_on_home", true);

  if (campaignId) {
    const { error } = await supabase
      .from("community_campaigns")
      .update({ featured_on_home: true })
      .eq("id", campaignId)
      .eq("status", "published");
    if (error) {
      return { ok: false as const, error: error.message };
    }
  }

  revalidatePath("/dashboard/community-campaigns");
  revalidatePath("/");
  return { ok: true as const };
}

export async function createCommunityCampaign(form: FormData): Promise<{ error?: string; id?: string }> {
  try {
    const { supabase, user } = await requireStaff();

    const title = String(form.get("title") || "").trim();
    if (!title) return { error: "Title is required." };

    const slugInput = String(form.get("slug") || "").trim();
    const baseSlug = slugify(slugInput || title);
    const slug = await nextUniqueCampaignSlug(supabase, baseSlug);

    const category_id = String(form.get("category_id") || "").trim();
    if (!category_id) return { error: "Category is required." };

    const excerpt = String(form.get("excerpt") || "").trim();
    const bodyRaw = form.get("body");
    const body = typeof bodyRaw === "string" && bodyRaw.trim() ? bodyRaw.trim() : null;

    const featured_image_url = String(form.get("featured_image_url") || "").trim();
    const image_alt = String(form.get("image_alt") || "").trim();
    const location_label = String(form.get("location_label") || "").trim();
    /** Raised/progress/donor display fields come from donations — never editable here. */
    const raised_display = "";
    const goal_display = "";
    const progress_percent = 0;
    const donors_count_display = "";
    const days_left_display = "";
    const primary_action_label = String(form.get("primary_action_label") || "").trim() || "Support this campaign";
    const primary_action_url = String(form.get("primary_action_url") || "").trim() || "#donate";

    const status = String(form.get("status") || "draft") as CampaignStatus;
    const allowed: CampaignStatus[] = ["draft", "pending_review", "published", "archived"];
    const safeStatus = allowed.includes(status) ? status : "draft";

    let published_at = parsePublishedAt(form.get("published_at"));
    if (safeStatus === "published" && !published_at) published_at = new Date().toISOString();
    if (safeStatus !== "published") published_at = null;

    const donations_enabled = form.get("donations_enabled") === "on";
    const preset_amounts = parsePresetAmounts(form.get("preset_amounts"));
    const goal_amount = parseGoalAmount(form.get("goal_amount"));
    const currency = String(form.get("currency") || "RWF").trim().slice(0, 8) || "RWF";
    const frequency_one_time = form.get("frequency_one_time") === "on";
    const frequency_weekly = form.get("frequency_weekly") === "on";
    const frequency_monthly = form.get("frequency_monthly") === "on";

    const modalHtmlRaw = form.get("donation_modal_description_html");
    const donation_modal_description_html =
      typeof modalHtmlRaw === "string" && modalHtmlRaw.trim() ? modalHtmlRaw.trim() : null;

    const { data: inserted, error } = await supabase
      .from("community_campaigns")
      .insert({
        title,
        slug,
        excerpt,
        body,
        category_id,
        featured_image_url,
        image_alt,
        location_label,
        raised_display,
        goal_display,
        progress_percent,
        donors_count_display,
        days_left_display,
        primary_action_label,
        primary_action_url,
        status: safeStatus,
        published_at,
        donations_enabled,
        preset_amounts,
        goal_amount,
        currency,
        frequency_one_time,
        frequency_weekly,
        frequency_monthly,
        donation_modal_description_html,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/dashboard/community-campaigns");
    revalidatePath("/dashboard/donations");
    revalidatePath("/");

    return { id: inserted?.id as string };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to create campaign." };
  }
}

export async function updateCommunityCampaign(
  campaignId: string,
  form: FormData,
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireStaff();
    if (!campaignId) return { error: "Missing campaign id." };

    const title = String(form.get("title") || "").trim();
    if (!title) return { error: "Title is required." };

    const slugInput = String(form.get("slug") || "").trim();
    const slugBase = slugify(slugInput || title);
    const slug = await nextUniqueCampaignSlug(supabase, slugBase, campaignId);

    const category_id = String(form.get("category_id") || "").trim();
    if (!category_id) return { error: "Category is required." };

    const excerpt = String(form.get("excerpt") || "").trim();
    const bodyRaw = form.get("body");
    const body = typeof bodyRaw === "string" && bodyRaw.trim() ? bodyRaw.trim() : null;

    const featured_image_url = String(form.get("featured_image_url") || "").trim();
    const image_alt = String(form.get("image_alt") || "").trim();
    const location_label = String(form.get("location_label") || "").trim();
    const raised_display = "";
    const goal_display = "";
    const progress_percent = 0;
    const donors_count_display = "";
    const days_left_display = "";
    const primary_action_label = String(form.get("primary_action_label") || "").trim() || "Support this campaign";
    const primary_action_url = String(form.get("primary_action_url") || "").trim() || "#donate";

    const status = String(form.get("status") || "draft") as CampaignStatus;
    const allowed: CampaignStatus[] = ["draft", "pending_review", "published", "archived"];
    const safeStatus = allowed.includes(status) ? status : "draft";

    let published_at = parsePublishedAt(form.get("published_at"));
    if (safeStatus === "published" && !published_at) {
      const { data: prev } = await supabase
        .from("community_campaigns")
        .select("published_at")
        .eq("id", campaignId)
        .maybeSingle();
      published_at = (prev?.published_at as string | null) ?? new Date().toISOString();
    }
    if (safeStatus !== "published") published_at = null;

    const donations_enabled = form.get("donations_enabled") === "on";
    const preset_amounts = parsePresetAmounts(form.get("preset_amounts"));
    const goal_amount = parseGoalAmount(form.get("goal_amount"));
    const currency = String(form.get("currency") || "RWF").trim().slice(0, 8) || "RWF";
    const frequency_one_time = form.get("frequency_one_time") === "on";
    const frequency_weekly = form.get("frequency_weekly") === "on";
    const frequency_monthly = form.get("frequency_monthly") === "on";

    const modalHtmlRaw = form.get("donation_modal_description_html");
    const donation_modal_description_html =
      typeof modalHtmlRaw === "string" && modalHtmlRaw.trim() ? modalHtmlRaw.trim() : null;

    const { error } = await supabase
      .from("community_campaigns")
      .update({
        title,
        slug,
        excerpt,
        body,
        category_id,
        featured_image_url,
        image_alt,
        location_label,
        raised_display,
        goal_display,
        progress_percent,
        donors_count_display,
        days_left_display,
        primary_action_label,
        primary_action_url,
        status: safeStatus,
        published_at,
        donations_enabled,
        preset_amounts,
        goal_amount,
        currency,
        frequency_one_time,
        frequency_weekly,
        frequency_monthly,
        donation_modal_description_html,
      })
      .eq("id", campaignId);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/community-campaigns");
    revalidatePath(`/dashboard/community-campaigns/${campaignId}`);
    revalidatePath("/dashboard/donations");
    revalidatePath("/");

    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to save campaign." };
  }
}

export async function upsertCommunityCampaignCategory(form: FormData): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireStaff();
    const id = String(form.get("id") || "").trim();
    const name = String(form.get("name") || "").trim();
    const slugInput = String(form.get("slug") || "").trim();
    const slug = slugify(slugInput || name);
    const sort_order = Number.parseInt(String(form.get("sort_order") || "0"), 10) || 0;

    if (!name || !slug) return { error: "Name and slug are required." };

    if (id) {
      const { error } = await supabase
        .from("community_campaign_categories")
        .update({ name, slug, sort_order })
        .eq("id", id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("community_campaign_categories").insert({ name, slug, sort_order });
      if (error) return { error: error.message };
    }

    revalidatePath("/dashboard/community-campaigns");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to save category." };
  }
}

export async function deleteCommunityCampaignCategory(categoryId: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireStaff();
    const { count, error: cErr } = await supabase
      .from("community_campaigns")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId);
    if (cErr) return { error: cErr.message };
    if ((count ?? 0) > 0) {
      return { error: "Cannot delete a category that still has campaigns. Reassign campaigns first." };
    }
    const { error } = await supabase.from("community_campaign_categories").delete().eq("id", categoryId);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/community-campaigns");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to delete category." };
  }
}

export async function setCampaignDonationsEnabled(
  campaignId: string,
  enabled: boolean,
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireStaff();
    const { error } = await supabase
      .from("community_campaigns")
      .update({ donations_enabled: enabled })
      .eq("id", campaignId);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/community-campaigns");
    revalidatePath("/dashboard/donations");
    revalidatePath("/");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to update donations setting." };
  }
}

export async function setCampaignVolunteeringEnabled(
  campaignId: string,
  enabled: boolean,
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireStaff();
    const { error } = await supabase
      .from("community_campaigns")
      .update({ volunteering_enabled: enabled })
      .eq("id", campaignId);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/community-campaigns");
    revalidatePath("/get-involved");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to update volunteering setting." };
  }
}

export async function moderateCommunityCampaignComment(
  commentId: string,
  status: "approved" | "rejected",
): Promise<{ error?: string }> {
  try {
    const { supabase, user } = await requireStaff();
    const { error } = await supabase
      .from("community_campaign_comments")
      .update({
        status,
        moderated_at: new Date().toISOString(),
        moderated_by: user.id,
      })
      .eq("id", commentId)
      .eq("status", "pending");

    if (error) return { error: error.message };
    revalidatePath("/dashboard/community-campaigns");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to moderate comment." };
  }
}
