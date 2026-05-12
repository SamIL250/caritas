import { createClient } from "@/lib/supabase/server";

import type { CtaImpactPanel } from "@/components/website/sections/CTA";
import BePartOfChangeSection from "@/components/website/sections/featured-campaign/BePartOfChangeSection";
import { loadFeaturedCampaignHomeData } from "@/lib/featured-campaign-home-data";

/** Homepage section: framing copy + impact panel from CMS JSON; featured story + sidebar from published campaigns only. */
export default async function FeaturedCampaignSection(props: Record<string, unknown>) {
  const supabase = await createClient();
  const { campaign, sidebarCards } = await loadFeaturedCampaignHomeData(supabase);

  const anchor_id = typeof props.anchor_id === "string" ? props.anchor_id : undefined;
  const eyebrow = typeof props.eyebrow === "string" ? props.eyebrow : undefined;
  const heading = typeof props.heading === "string" ? props.heading : undefined;
  const heading_accent = typeof props.heading_accent === "string" ? props.heading_accent : undefined;
  const body = typeof props.body === "string" ? props.body : undefined;

  const impact_panel =
    props.impact_panel && typeof props.impact_panel === "object" && !Array.isArray(props.impact_panel)
      ? (props.impact_panel as CtaImpactPanel)
      : undefined;
  const bottom_primary_text =
    typeof props.bottom_primary_text === "string" ? props.bottom_primary_text : undefined;
  const bottom_primary_url =
    typeof props.bottom_primary_url === "string" ? props.bottom_primary_url : undefined;
  const bottom_secondary_text =
    typeof props.bottom_secondary_text === "string" ? props.bottom_secondary_text : undefined;
  const bottom_secondary_url =
    typeof props.bottom_secondary_url === "string" ? props.bottom_secondary_url : undefined;

  return (
    <BePartOfChangeSection
      anchor_id={anchor_id}
      eyebrow={eyebrow}
      heading={heading}
      heading_accent={heading_accent}
      body={body}
      sidebar_cards={sidebarCards}
      impact_panel={impact_panel}
      bottom_primary_text={bottom_primary_text}
      bottom_primary_url={bottom_primary_url}
      bottom_secondary_text={bottom_secondary_text}
      bottom_secondary_url={bottom_secondary_url}
      campaign={campaign}
    />
  );
}
