"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { DonationAnalyticsView } from "@/components/dashboard/donations/DonationAnalyticsView";
import type { DonationAnalyticsRow } from "@/lib/donation-analytics";

function NotFound() {
  return (
    <div className="w-full space-y-6">
      <div className="rounded-xl border border-stone-200 bg-white p-10 text-center">
        <p className="font-medium text-stone-700">Campaign not found or you do not have access.</p>
        <Link
          href="/dashboard/donations"
          className="mt-4 inline-flex text-sm font-semibold text-[var(--color-primary)] underline"
        >
          Back to Donations
        </Link>
      </div>
    </div>
  );
}

export default function CampaignDonationAnalyticsPage() {
  const params = useParams();
  const campaignId = typeof params?.campaignId === "string" ? params.campaignId : "";

  const [campaign, setCampaign] = useState<{
    id: string;
    title: string;
    slug: string;
    goal_amount: number | null;
    currency: string | null;
    excerpt: string | null;
  } | null>(null);
  const [donations, setDonations] = useState<DonationAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(() => Boolean(campaignId));

  useEffect(() => {
    if (!campaignId) return;

    let cancelled = false;
    const supabase = createClient();

    void (async () => {
      setLoading(true);
      const [{ data: camp, error: cErr }, { data: rows, error: dErr }] = await Promise.all([
        supabase
          .from("community_campaigns")
          .select("id,title,slug,goal_amount,currency,excerpt")
          .eq("id", campaignId)
          .maybeSingle(),
        supabase
          .from("donations")
          .select("id,amount,currency,status,payment_method,created_at,donor_name,donor_email")
          .eq("community_campaign_id", campaignId)
          .order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;

      if (cErr || !camp) {
        setCampaign(null);
        setDonations([]);
      } else {
        setCampaign({
          id: camp.id,
          title: camp.title,
          slug: camp.slug,
          goal_amount: typeof camp.goal_amount === "number" ? camp.goal_amount : null,
          currency: camp.currency ?? null,
          excerpt: camp.excerpt ?? null,
        });
        setDonations((rows ?? []) as DonationAnalyticsRow[]);
      }

      if (dErr && camp) {
        console.error(dErr);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  if (!campaignId) {
    return <NotFound />;
  }

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-300" aria-hidden />
      </div>
    );
  }

  if (!campaign) {
    return <NotFound />;
  }

  const cy = campaign.currency?.trim() || "RWF";

  return (
    <DonationAnalyticsView
      title={campaign.title}
      subtitle={campaign.excerpt?.trim() || undefined}
      currency={cy}
      goalAmount={campaign.goal_amount ?? null}
      donations={donations}
      loading={false}
      backHref="/dashboard/donations"
      editHref={`/dashboard/community-campaigns/${campaign.id}`}
      publicHref={campaign.slug ? `/campaigns/${campaign.slug}` : undefined}
    />
  );
}
