import Link from "next/link";
import type { CSSProperties } from "react";

import { CampaignHeroActions } from "@/components/website/campaigns/CampaignHeroActions";
import { daysUntilFundraisingEnd } from "@/lib/community-campaign-fundraising-stats";

export type CampaignDetailHeroCopy = {
  raisedDisplay: string;
  goalDisplay: string;
  progressPercent: number;
  donorsCountDisplay: string;
  daysLeftDisplay: string;
};

export default function CampaignDetailHero({
  categoryName,
  title,
  excerpt,
  locationLabel,
  featuredImageUrl,
  imageAlt,
  fundraisingEndAt,
  copy,
  campaignId,
  donationsEnabled,
  primaryLabel,
  primaryUrl,
}: {
  categoryName: string | null;
  title: string;
  excerpt: string;
  locationLabel: string;
  featuredImageUrl: string;
  imageAlt: string;
  fundraisingEndAt: string | null;
  copy: CampaignDetailHeroCopy;
  campaignId: string;
  donationsEnabled: boolean;
  primaryLabel: string;
  primaryUrl: string;
}) {
  const heroBg =
    featuredImageUrl && featuredImageUrl.trim()
      ? `url("${featuredImageUrl.replace(/"/g, "")}")`
      : undefined;

  const pct = Math.min(100, Math.max(0, Math.round(copy.progressPercent)));
  const dLeft = daysUntilFundraisingEnd(fundraisingEndAt);
  const daysLabel =
    copy.daysLeftDisplay.trim() && dLeft !== null
      ? dLeft <= 0
        ? "Fundraiser ended"
        : "Days left"
      : copy.daysLeftDisplay.trim()
        ? "Timeline"
        : "";

  return (
    <section
      className="campaign-detail-hero"
      style={
        heroBg
          ? ({ ["--campaign-hero-image" as string]: heroBg } as CSSProperties)
          : undefined
      }
    >
      <div className="campaign-detail-hero-inner">
        {categoryName ? (
          <div className="campaign-hero-eyebrow">
            <i className="fa-solid fa-hand-holding-heart" aria-hidden />
            {categoryName.toUpperCase()}
          </div>
        ) : null}

        <h1 className="campaign-hero-title">{title}</h1>

        {locationLabel.trim() ? (
          <p className="campaign-hero-location">
            <i className="fa-solid fa-location-dot" aria-hidden />
            {locationLabel}
          </p>
        ) : null}

        {excerpt.trim() ? <p className="campaign-hero-intro">{excerpt}</p> : null}

        {(copy.raisedDisplay || copy.goalDisplay) && (
          <div className="campaign-hero-progress-block">
            <div className="campaign-hero-progress-labels">
              {copy.raisedDisplay.trim() ? (
                <span className="campaign-hero-raised">{copy.raisedDisplay}</span>
              ) : (
                <span className="campaign-hero-raised">&nbsp;</span>
              )}
              {copy.goalDisplay.trim() ? (
                <span className="campaign-hero-goal">{copy.goalDisplay}</span>
              ) : null}
            </div>
            <div className="campaign-hero-bar-track" aria-hidden>
              <div className="campaign-hero-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {(copy.donorsCountDisplay.trim() || copy.daysLeftDisplay.trim()) && (
          <div className="campaign-hero-stats">
            <div className="campaign-hero-stat">
              <span className="campaign-hero-stat-num">{pct}%</span>
              <span className="campaign-hero-stat-label">Funded</span>
            </div>
            {copy.donorsCountDisplay.trim() ? (
              <div className="campaign-hero-stat">
                <span className="campaign-hero-stat-num">{copy.donorsCountDisplay.trim()}</span>
                <span className="campaign-hero-stat-label">Donors</span>
              </div>
            ) : null}
            {copy.daysLeftDisplay.trim() ? (
              <div className="campaign-hero-stat">
                <span className="campaign-hero-stat-num">{copy.daysLeftDisplay.trim()}</span>
                <span className="campaign-hero-stat-label">{daysLabel || "Days left"}</span>
              </div>
            ) : null}
          </div>
        )}

        <CampaignHeroActions
          campaignId={campaignId}
          donationsEnabled={donationsEnabled}
          primaryLabel={primaryLabel}
          primaryUrl={primaryUrl}
        />

        <nav className="campaign-hero-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden>›</span>
          <Link href="/campaigns">Campaigns</Link>
          <span aria-hidden>›</span>
          <span className="campaign-hero-bc-current">{title}</span>
        </nav>
      </div>
    </section>
  );
}
