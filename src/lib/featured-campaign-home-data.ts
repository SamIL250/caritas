import type { SupabaseClient } from "@supabase/supabase-js";

import type { CtaSidebarCard } from "@/components/website/sections/CTA";
import type { BePartCampaignVM } from "@/components/website/sections/featured-campaign/BePartOfChangeSection";
import {
  enrichCampaignFundraisingCopy,
  fetchFundraisingStatsForCampaigns,
} from "@/lib/community-campaign-fundraising-stats";
import type { Database } from "@/types/database.types";

export type CampaignRow = Database["public"]["Tables"]["community_campaigns"]["Row"];

/** Max sidebar slots on the homepage featured block; additional campaigns live on /campaigns */
export const FEATURED_CAMPAIGN_SIDEBAR_MAX = 2;

export function categoryIconFromCategorySlug(slug: string): string {
  const s = slug.toLowerCase();
  if (s.includes("education")) return "fa-book-open";
  if (s.includes("livelihood")) return "fa-briefcase";
  if (s.includes("health") || s.includes("medical")) return "fa-hand-holding-medical";
  return "fa-hand-holding-medical";
}

export function supportButtonLabel(title: string): string {
  const head = (title || "").split(",")[0]?.trim();
  return head ? `Support ${head}` : "Support this campaign";
}

export type FeaturedCampaignHomeData = {
  campaign: BePartCampaignVM | null;
  /** Always built from DB (up to FEATURED_CAMPAIGN_SIDEBAR_MAX published campaigns excluding featured). */
  sidebarCards: CtaSidebarCard[];
};

export async function loadFeaturedCampaignHomeData(
  supabase: SupabaseClient<Database>,
): Promise<FeaturedCampaignHomeData> {
  const [{ data: featuredRow }, { data: publishedPool }] = await Promise.all([
    supabase
      .from("community_campaigns")
      .select("*")
      .eq("featured_on_home", true)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("community_campaigns")
      .select("*")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(12),
  ]);

  const row = featuredRow as CampaignRow | null;
  const pool = (publishedPool ?? []) as CampaignRow[];

  const sidebarCandidates = pool
    .filter((r) => !row || r.id !== row.id)
    .slice(0, FEATURED_CAMPAIGN_SIDEBAR_MAX);

  const categoryIds = [
    ...new Set([row?.category_id, ...sidebarCandidates.map((r) => r.category_id)].filter(Boolean)),
  ];
  const categoryById = new Map<string, { slug: string; name: string }>();
  if (categoryIds.length > 0) {
    const { data: cats } = await supabase
      .from("community_campaign_categories")
      .select("id,slug,name")
      .in("id", categoryIds as string[]);
    for (const c of cats ?? []) {
      if (c && typeof c.id === "string") {
        categoryById.set(c.id, {
          slug: typeof c.slug === "string" ? c.slug : "",
          name: typeof c.name === "string" ? c.name : "",
        });
      }
    }
  }

  const statsIds = [...new Set([row?.id, ...sidebarCandidates.map((r) => r.id)].filter(Boolean))] as string[];
  const statsMap = await fetchFundraisingStatsForCampaigns(supabase, statsIds);

  let catSlug = "";
  let catName = "";
  if (row && typeof row.category_id === "string" && row.category_id.length) {
    const cat = categoryById.get(row.category_id);
    catSlug = cat?.slug ?? "";
    catName = cat?.name ?? "";
  }

  const featuredStats = row ? statsMap.get(row.id) ?? { raisedAmount: 0, donorCount: 0 } : null;
  const featuredCopy =
    row && featuredStats ? enrichCampaignFundraisingCopy(row, featuredStats) : null;

  const donationsOk = Boolean(row?.donations_enabled);
  const slugStr = row ? String(row.slug ?? "") : "";

  const campaign: BePartCampaignVM | null =
    row && typeof row.id === "string" && featuredCopy
      ? {
          id: row.id,
          slug: slugStr,
          title: String(row.title ?? ""),
          excerpt: String(row.excerpt ?? ""),
          featured_image_url: String(row.featured_image_url ?? ""),
          image_alt: String(row.image_alt ?? ""),
          location_label: String(row.location_label ?? ""),
          raised_display: featuredCopy.raisedDisplay,
          goal_display: featuredCopy.goalDisplay,
          progress_percent: featuredCopy.progressPercent,
          donors_count_display: featuredCopy.donorsCountDisplay,
          days_left_display: featuredCopy.daysLeftDisplay,
          donations_enabled: donationsOk,
          primary_action_label: donationsOk
            ? String(row.primary_action_label ?? "Donate now")
            : "View full story",
          primary_action_url: donationsOk
            ? String(row.primary_action_url ?? "#donate").trim() || "#donate"
            : `/campaigns/${slugStr}`,
          category_label: catName,
          category_icon: categoryIconFromCategorySlug(catSlug || catName),
          discussion_label: "View full story",
          discussion_url: `/campaigns/${slugStr}`,
        }
      : null;

  const sidebarCards: CtaSidebarCard[] = sidebarCandidates.map((r, idx) => {
    const st = statsMap.get(r.id) ?? { raisedAmount: 0, donorCount: 0 };
    const copy = enrichCampaignFundraisingCopy(r, st);
    const cat = categoryById.get(r.category_id);
    const cSlug = cat?.slug ?? "";
    const cName = cat?.name ?? "";
    const slug = String(r.slug ?? "");

    return {
      modal_campaign_id: null,
      image_url: String(r.featured_image_url ?? ""),
      image_alt: String(r.image_alt ?? ""),
      category_label: (cName || "Campaign").toUpperCase(),
      category_icon: categoryIconFromCategorySlug(cSlug || cName),
      category_tone: "rose",
      bar_tone: idx % 2 === 0 ? "sky" : "teal",
      name: String(r.title ?? ""),
      description: String(r.excerpt ?? ""),
      raised_label: copy.raisedDisplay,
      goal_pct_label:
        typeof r.goal_amount === "number" && r.goal_amount > 0
          ? `${copy.progressPercent}% of ${(r.currency || "RWF").trim() || "RWF"} ${r.goal_amount.toLocaleString()}`
          : "",
      progress_pct: copy.progressPercent,
      button_text: supportButtonLabel(String(r.title ?? "")),
      button_url: `/campaigns/${slug}`,
    };
  });

  return { campaign, sidebarCards };
}
