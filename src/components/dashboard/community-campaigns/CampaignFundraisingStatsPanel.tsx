"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { progressPercentFromGoal } from "@/lib/community-campaign-fundraising-stats";

type Props = {
  campaignId: string | undefined;
  currency: string;
  goalAmount: number | null;
};

export function CampaignFundraisingStatsPanel({ campaignId, currency, goalAmount }: Props) {
  const [raised, setRaised] = useState<number | null>(null);
  const [donors, setDonors] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaignId) {
      setRaised(null);
      setDonors(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("community_campaign_staff_fundraising_stats", {
        p_campaign_id: campaignId,
      });
      if (cancelled) return;
      if (error) {
        setRaised(0);
        setDonors(0);
      } else {
        const row = Array.isArray(data) ? data[0] : data;
        const raisedRaw =
          row && typeof row === "object" && "raised_amount" in row
            ? (row as { raised_amount: unknown }).raised_amount
            : 0;
        const donorRaw =
          row && typeof row === "object" && "donor_count" in row ? (row as { donor_count: unknown }).donor_count : 0;
        setRaised(typeof raisedRaw === "number" ? raisedRaw : Number(raisedRaw) || 0);
        setDonors(typeof donorRaw === "number" ? donorRaw : Number(donorRaw) || 0);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const cy = currency.trim() || "RWF";
  const pct = raised !== null ? progressPercentFromGoal(raised, goalAmount) : null;

  if (!campaignId) {
    return (
      <div className="rounded-lg border border-stone-200 bg-stone-50/80 px-3 py-2 text-[11px] text-stone-500">
        After you save this campaign, live totals from succeeded donations appear here.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50/80 px-3 py-3 text-sm">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
        Live fundraising (from donations)
      </p>
      {loading ? (
        <div className="flex items-center gap-2 text-stone-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading totals…
        </div>
      ) : (
        <dl className="grid gap-2 sm:grid-cols-3">
          <div>
            <dt className="text-[10px] uppercase text-stone-400">Raised</dt>
            <dd className="font-semibold text-stone-800">
              {cy} {(raised ?? 0).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase text-stone-400">Succeeded gifts</dt>
            <dd className="font-semibold text-stone-800">{donors ?? 0}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase text-stone-400">Progress</dt>
            <dd className="font-semibold text-stone-800">{pct !== null ? `${pct}%` : "—"}</dd>
          </div>
        </dl>
      )}
      <p className="mt-2 text-[11px] text-stone-400">
        Totals come from donation records only and cannot be edited here.
      </p>
    </div>
  );
}
