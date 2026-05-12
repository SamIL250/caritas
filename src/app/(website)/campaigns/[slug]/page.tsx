import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CampaignDetailHero from "@/components/website/campaigns/CampaignDetailHero";
import { CampaignComments } from "@/components/website/campaigns/CampaignComments";
import { CampaignFullStory } from "@/components/website/campaigns/CampaignFullStory";
import { sanitizeStaffRichText } from "@/lib/sanitize-staff-html";
import { enrichCampaignFundraisingCopy, fetchFundraisingStatsForCampaigns } from "@/lib/community-campaign-fundraising-stats";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import "../campaign-detail-page.css";

type CampaignRow = Database["public"]["Tables"]["community_campaigns"]["Row"];
type CategoryRow = Database["public"]["Tables"]["community_campaign_categories"]["Row"];
type CommentRow = Database["public"]["Tables"]["community_campaign_comments"]["Row"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_campaigns")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const row = data as Pick<CampaignRow, "title" | "excerpt"> | null;
  if (!row) return { title: "Campaign" };

  return {
    title: row.title,
    description: (row.excerpt || "").slice(0, 160) || undefined,
  };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("community_campaigns")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const c = campaign as CampaignRow | null;
  if (!c) notFound();

  const [{ data: catRow }, { data: comments }, statsMap] = await Promise.all([
    supabase.from("community_campaign_categories").select("*").eq("id", c.category_id).maybeSingle(),
    supabase
      .from("community_campaign_comments")
      .select("*")
      .eq("campaign_id", c.id)
      .order("created_at", { ascending: true }),
    fetchFundraisingStatsForCampaigns(supabase, [c.id]),
  ]);

  const category = catRow as CategoryRow | null;
  const approvedComments = (comments ?? []).filter((c) => c.status === "approved") as CommentRow[];
  const st = statsMap.get(c.id) ?? { raisedAmount: 0, donorCount: 0 };
  const copy = enrichCampaignFundraisingCopy(c, st);

  const donationsOk = Boolean(c.donations_enabled);
  const primaryUrl = (c.primary_action_url || "#donate").trim() || "#donate";
  const storyHtml =
    (c.body || "").trim() !== "" ? sanitizeStaffRichText((c.body || "").trim()) : "";

  return (
    <div className="campaign-detail-root">
      <CampaignDetailHero
        categoryName={category?.name ?? null}
        title={c.title}
        excerpt={c.excerpt || ""}
        locationLabel={c.location_label || ""}
        featuredImageUrl={c.featured_image_url || ""}
        imageAlt={c.image_alt || ""}
        fundraisingEndAt={c.fundraising_end_at}
        copy={{
          raisedDisplay: copy.raisedDisplay,
          goalDisplay: copy.goalDisplay,
          progressPercent: copy.progressPercent,
          donorsCountDisplay: copy.donorsCountDisplay,
          daysLeftDisplay: copy.daysLeftDisplay,
        }}
        campaignId={c.id}
        donationsEnabled={donationsOk}
        primaryLabel={(c.primary_action_label || "Donate now").trim() || "Donate now"}
        primaryUrl={primaryUrl}
      />

      <article className="campaign-detail-body">
        <div className="campaign-detail-body-grid">
          <CampaignFullStory key={`${c.id}-${c.updated_at}`} html={storyHtml} />
          <CampaignComments campaignId={c.id} initialComments={approvedComments} />
        </div>
      </article>
    </div>
  );
}
