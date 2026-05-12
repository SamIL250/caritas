import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

type CampaignRow = Database["public"]["Tables"]["community_campaigns"]["Row"];

export type CampaignFundraisingStats = {
  raisedAmount: number;
  donorCount: number;
};

export async function fetchFundraisingStatsForCampaigns(
  supabase: SupabaseClient<Database>,
  campaignIds: string[],
): Promise<Map<string, CampaignFundraisingStats>> {
  const unique = [...new Set(campaignIds.filter(Boolean))];
  const map = new Map<string, CampaignFundraisingStats>();

  await Promise.all(
    unique.map(async (id) => {
      const { data, error } = await supabase.rpc("community_campaign_public_fundraising_stats", {
        p_campaign_id: id,
      });
      if (error) {
        map.set(id, { raisedAmount: 0, donorCount: 0 });
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      const raisedRaw =
        row && typeof row === "object" && "raised_amount" in row ? (row as { raised_amount: unknown }).raised_amount : 0;
      const donorRaw =
        row && typeof row === "object" && "donor_count" in row ? (row as { donor_count: unknown }).donor_count : 0;
      const raisedAmount = typeof raisedRaw === "number" ? raisedRaw : Number(raisedRaw) || 0;
      const donorCount = typeof donorRaw === "number" ? donorRaw : Number(donorRaw) || 0;
      map.set(id, { raisedAmount, donorCount });
    }),
  );

  return map;
}

/** Whole days until fundraising_end_at (UTC date boundary); null if no end date. */
export function daysUntilFundraisingEnd(fundraisingEndAt: string | null): number | null {
  if (!fundraisingEndAt || !String(fundraisingEndAt).trim()) return null;
  const end = new Date(fundraisingEndAt);
  if (Number.isNaN(end.getTime())) return null;
  const now = new Date();
  const startOfUtcDay = (d: Date) =>
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const diffDays = Math.ceil((startOfUtcDay(end) - startOfUtcDay(now)) / 86400000);
  return diffDays;
}

export function formatDaysLeftDisplay(endAt: string | null): string | null {
  const d = daysUntilFundraisingEnd(endAt);
  if (d === null) return null;
  if (d <= 0) return "0";
  return String(d);
}

export function progressPercentFromGoal(raised: number, goalAmount: number | null): number | null {
  if (goalAmount === null || goalAmount <= 0 || !Number.isFinite(raised)) return null;
  return Math.min(100, Math.max(0, Math.round((raised / goalAmount) * 100)));
}

export function enrichCampaignFundraisingCopy(
  row: CampaignRow,
  stats: CampaignFundraisingStats,
): {
  raisedDisplay: string;
  goalDisplay: string;
  progressPercent: number;
  donorsCountDisplay: string;
  daysLeftDisplay: string;
} {
  const currency = (row.currency || "RWF").trim() || "RWF";
  const goal = typeof row.goal_amount === "number" && row.goal_amount > 0 ? row.goal_amount : null;
  const livePct = progressPercentFromGoal(stats.raisedAmount, goal);
  const progressPercent = livePct ?? 0;

  const raisedDisplay = `${currency} ${stats.raisedAmount.toLocaleString()} raised`;

  const goalDisplay = goal ? `Goal: ${currency} ${goal.toLocaleString()}` : "";

  const donorsCountDisplay = String(stats.donorCount);

  const fromEnd = formatDaysLeftDisplay(row.fundraising_end_at);
  const daysLeftDisplay = fromEnd !== null ? fromEnd : "";

  return {
    raisedDisplay,
    goalDisplay,
    progressPercent,
    donorsCountDisplay,
    daysLeftDisplay,
  };
}
