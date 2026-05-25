import React from "react";
import { createClient } from "@/lib/supabase/server";
import {
  getContentStatusBreakdowns,
  getDonationsByDay,
  getDonationSummary,
  getEngagementSummary,
  getRecentContentItems,
} from "@/lib/overview-analytics";
import OverviewDashboardClient from "@/components/dashboard/OverviewDashboardClient";

export const metadata = {
  title: "Overview - Caritas Rwanda CMS",
};

export default async function OverviewPage() {
  const supabase = await createClient();

  // Fetch all dashboard data concurrently
  const [
    contentBreakdowns,
    donationSeries,
    donationSummary,
    engagement,
    recentItems,
    { count: mediaCount },
    { count: campaignsCount },
  ] = await Promise.all([
    getContentStatusBreakdowns(supabase),
    getDonationsByDay(supabase, 90),
    getDonationSummary(supabase),
    getEngagementSummary(supabase),
    getRecentContentItems(supabase, 14),
    supabase.from("media").select("*", { count: "exact", head: true }),
    supabase.from("community_campaigns").select("*", { count: "exact", head: true }),
  ]);

  return (
    <OverviewDashboardClient
      contentBreakdowns={contentBreakdowns}
      donationSeries={donationSeries}
      donationSummary={donationSummary}
      engagement={engagement}
      recentItems={recentItems}
      totalMedia={mediaCount ?? 0}
      totalDonationCampaigns={campaignsCount ?? 0}
    />
  );
}
