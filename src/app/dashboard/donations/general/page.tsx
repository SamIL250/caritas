"use client";

import React, { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { DonationAnalyticsView } from "@/components/dashboard/donations/DonationAnalyticsView";
import type { DonationAnalyticsRow } from "@/lib/donation-analytics";

export default function GeneralDonationsAnalyticsPage() {
  const [donations, setDonations] = useState<DonationAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    void (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("donations")
        .select("id,amount,currency,status,payment_method,created_at,donor_name,donor_email")
        .is("community_campaign_id", null)
        .order("created_at", { ascending: false });

      if (!cancelled) {
        if (error) console.error(error);
        setDonations((data ?? []) as DonationAnalyticsRow[]);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DonationAnalyticsView
      title="General donations"
      subtitle="Donations with no linked community campaign (general gifts and offline entries recorded without a fundraiser)."
      currency="RWF"
      goalAmount={null}
      donations={donations}
      loading={loading}
      backHref="/dashboard/donations"
    />
  );
}
