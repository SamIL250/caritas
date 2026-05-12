"use client";

import Link from "next/link";

import { CampaignPrimaryActions } from "@/components/website/campaigns/CampaignPrimaryActions";

export function CampaignHeroActions({
  campaignId,
  donationsEnabled,
  primaryLabel,
  primaryUrl,
}: {
  campaignId: string;
  donationsEnabled: boolean;
  primaryLabel: string;
  primaryUrl: string;
}) {
  return (
    <div className="campaign-hero-actions">
      <CampaignPrimaryActions
        primaryLabel={primaryLabel}
        primaryUrl={primaryUrl}
        campaignId={campaignId}
        donationsEnabled={donationsEnabled}
        className="campaign-hero-donate-btn"
      />
      <Link href="#campaign-comments-panel" className="campaign-hero-message-btn">
        <i className="fa-regular fa-comments" aria-hidden />
        Leave a message
      </Link>
    </div>
  );
}
