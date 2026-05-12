"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import type { CtaImpactPanel, CtaSidebarCard } from "@/components/website/sections/CTA";
import BePartOfChangeSection, {
  type BePartCampaignVM,
} from "@/components/website/sections/featured-campaign/BePartOfChangeSection";
import { loadFeaturedCampaignHomeData } from "@/lib/featured-campaign-home-data";

type Props = {
  anchor_id?: string;
  eyebrow?: string;
  heading?: string;
  heading_accent?: string;
  body?: string;
  impact_panel?: CtaImpactPanel;
  bottom_primary_text?: string;
  bottom_primary_url?: string;
  bottom_secondary_text?: string;
  bottom_secondary_url?: string;
};

type Loaded = {
  campaign: BePartCampaignVM | null;
  sidebarCards: CtaSidebarCard[];
};

/** CMS preview: same featured + sidebar rules as the live homepage (Supabase + fundraising RPC). */
export default function FeaturedCampaignSectionPreview(props: Props) {
  const [data, setData] = useState<Loaded | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    void (async () => {
      try {
        const next = await loadFeaturedCampaignHomeData(supabase);
        if (!cancelled) setData(next);
      } catch {
        if (!cancelled) setData({ campaign: null, sidebarCards: [] });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (data === undefined) {
    return (
      <div className="flex min-h-[12rem] w-full flex-col items-center justify-center gap-2 px-6 py-12 text-center text-sm text-stone-400">
        Loading featured campaign…
      </div>
    );
  }

  return (
    <BePartOfChangeSection
      anchor_id={props.anchor_id}
      eyebrow={props.eyebrow}
      heading={props.heading}
      heading_accent={props.heading_accent}
      body={props.body}
      sidebar_cards={data.sidebarCards}
      impact_panel={props.impact_panel}
      bottom_primary_text={props.bottom_primary_text}
      bottom_primary_url={props.bottom_primary_url}
      bottom_secondary_text={props.bottom_secondary_text}
      bottom_secondary_url={props.bottom_secondary_url}
      campaign={data.campaign}
    />
  );
}
