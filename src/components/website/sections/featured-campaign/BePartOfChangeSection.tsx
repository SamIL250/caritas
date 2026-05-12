"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import "./be-part-change.css";

import { useDonation } from "@/context/DonationContext";
import type { CtaImpactPanel, CtaSidebarCard } from "@/components/website/sections/CTA";

export type BePartCampaignVM = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featured_image_url: string;
  image_alt: string;
  location_label: string;
  raised_display: string;
  goal_display: string;
  progress_percent: number;
  donors_count_display: string;
  days_left_display: string;
  /** When false and primary_action_url is #donate, open story page instead of modal */
  donations_enabled?: boolean;
  primary_action_label: string;
  primary_action_url: string;
  category_label: string;
  category_icon: string;
  discussion_label?: string;
  discussion_url?: string;
};

export type BePartOfChangeSectionProps = {
  anchor_id?: string;
  eyebrow?: string;
  heading?: string;
  heading_accent?: string;
  body?: string;
  sidebar_cards?: CtaSidebarCard[];
  impact_panel?: CtaImpactPanel;
  bottom_primary_text?: string;
  bottom_primary_url?: string;
  bottom_secondary_text?: string;
  bottom_secondary_url?: string;
  campaign: BePartCampaignVM | null;
};

function iconClass(raw: string) {
  const t = (raw || "fa-users").trim();
  if (t.startsWith("fa-") && t.includes(" ")) return t;
  if (t.startsWith("fa-")) return `fa-solid ${t}`;
  return `fa-solid fa-${t.replace(/^fa-?/i, "")}`;
}

function clampPct(n: unknown): number {
  const x = typeof n === "number" ? n : Number.parseFloat(String(n));
  if (!Number.isFinite(x)) return 0;
  return Math.min(100, Math.max(0, Math.round(x)));
}

function formatLegacyHeading(
  h?: string,
  accent?: string,
): { line1: string; line2: string } {
  if (accent !== undefined && accent !== null) {
    const a = String(accent).trim();
    if (a) {
      return {
        line1: (h || "Be Part of").trim() || "Be Part of",
        line2: a,
      };
    }
    return { line1: (h || "Be Part of").trim() || "Be Part of", line2: "" };
  }
  const full = (h || "").trim();
  if (!full) {
    return { line1: "Be Part of", line2: "the Change" };
  }
  const legacy = "Be Part of the Change";
  if (full === legacy || full.toLowerCase() === legacy.toLowerCase()) {
    return { line1: "Be Part of", line2: "the Change" };
  }
  return { line1: full, line2: "" };
}

function CtaSecondaryLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function DonateOrLink({
  className,
  href,
  children,
  modalCampaignId,
}: {
  className?: string;
  href: string;
  children: React.ReactNode;
  modalCampaignId?: string | null;
}) {
  const { openModal } = useDonation();
  const h = (href || "").trim();
  if (h === "#donate") {
    return (
      <button
        type="button"
        className={className}
        onClick={() => openModal(modalCampaignId ? String(modalCampaignId) : null)}
      >
        {children}
      </button>
    );
  }
  return (
    <CtaSecondaryLink href={h || "#"} className={className ?? ""}>
      {children}
    </CtaSecondaryLink>
  );
}

function smallTagStyle(tone: string | undefined): CSSProperties | undefined {
  if (tone === "teal") return { color: "#7fccdf" };
  return undefined;
}

function smallBarClass(tone: string | undefined): string {
  if (tone === "teal") return "bpc-small-bar-fill bpc-small-bar-fill--teal";
  return "bpc-small-bar-fill";
}

function primaryDonateHref(campaign: BePartCampaignVM | null, raw: string): string {
  const u = (raw || "").trim() || "#donate";
  if (u === "#donate" && campaign?.donations_enabled === false && campaign.slug) {
    return `/campaigns/${campaign.slug}`;
  }
  return u;
}

function primaryModalId(campaign: BePartCampaignVM | null, raw: string): string | null {
  const u = (raw || "").trim() || "#donate";
  if (u !== "#donate") return null;
  if (campaign?.donations_enabled === false) return null;
  return campaign?.id ?? null;
}

export default function BePartOfChangeSection({
  anchor_id = "featured-campaign",
  eyebrow = "Make a Difference",
  heading = "Be Part of",
  heading_accent,
  body = "Your support enables us to continue transforming lives and building sustainable communities across all nine dioceses of Rwanda.",
  sidebar_cards = [],
  impact_panel,
  bottom_primary_text = "Start Donating Today",
  bottom_primary_url = "#donate",
  bottom_secondary_text = "Volunteer with Us",
  bottom_secondary_url = "#",
  campaign,
}: BePartOfChangeSectionProps) {
  const displayEyebrow = (eyebrow || "").trim();
  const { line1, line2 } = formatLegacyHeading(heading, heading_accent);
  const displayBody =
    (body || "").trim() ||
    "Your support enables us to continue transforming lives and building sustainable communities across all nine dioceses of Rwanda.";

  const pct = campaign ? clampPct(campaign.progress_percent) : 0;
  const pbText = (campaign?.primary_action_label || "Donate Now").trim();
  const pbUrl = (campaign?.primary_action_url || "#donate").trim() || "#donate";
  const discussLabel = (campaign?.discussion_label || "").trim();
  const discussUrl = (campaign?.discussion_url || "").trim();

  const impactItems = Array.isArray(impact_panel?.items) ? impact_panel!.items! : [];
  const impactTitle = (impact_panel?.title || "Our collective impact").trim();
  const impactIcon = (impact_panel?.icon || "fa-chart-line").trim();

  const stats =
    campaign &&
    (campaign.raised_display ||
      campaign.goal_display ||
      campaign.donors_count_display ||
      campaign.days_left_display)
      ? [
          { num: `${clampPct(campaign.progress_percent)}%`, label: "Funded" },
          ...(campaign.donors_count_display?.trim()
            ? [{ num: campaign.donors_count_display.trim(), label: "Donors" }]
            : []),
          ...(campaign.days_left_display?.trim()
            ? [
                {
                  num: campaign.days_left_display.trim(),
                  label:
                    campaign.days_left_display.trim() === "0" ? "Ended" : "Days left",
                },
              ]
            : []),
        ]
      : [];

  return (
    <section className="featured-campaign-bpc-scope bpc-section" id={anchor_id}>
      <div className="bpc-orb bpc-orb-1" aria-hidden />
      <div className="bpc-orb bpc-orb-2" aria-hidden />
      <div className="bpc-orb bpc-orb-3" aria-hidden />
      <div className="bpc-dot-grid" aria-hidden />

      <div className="bpc-inner">
        <div className="bpc-header">
          {displayEyebrow ? (
            <div className="bpc-eyebrow">
              <i className="fa-solid fa-heart" aria-hidden />
              &nbsp; {displayEyebrow}
            </div>
          ) : null}
          <h2 className="bpc-title">
            {line2 ? (
              <>
                {line1}
                <br />
                <span>{line2}</span>
              </>
            ) : (
              line1
            )}
          </h2>
          <p className="bpc-subtitle">{displayBody}</p>
        </div>

        <div className="bpc-grid">
          <div className="glass-card bpc-feat-card">
            <div className="bpc-feat-img-wrap">
              {campaign?.featured_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- CMS / external URLs
                <img
                  src={campaign.featured_image_url}
                  alt={campaign.image_alt || ""}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
              ) : (
                <div className="bpc-feat-img-placeholder" aria-hidden>
                  <i className="fa-solid fa-image" />
                  <span className="bpc-feat-img-label">Campaign image</span>
                </div>
              )}
              {campaign && (campaign.category_label || "").trim() ? (
                <span className="bpc-feat-badge">
                  {campaign.category_icon ? (
                    <i className={iconClass(campaign.category_icon)} aria-hidden />
                  ) : null}
                  &nbsp; {campaign.category_label}
                </span>
              ) : null}
            </div>
            <div className="bpc-feat-body">
              {campaign ? (
                <>
                  {(campaign.title || "").trim() ? (
                    <h3 className="bpc-feat-name">{campaign.title}</h3>
                  ) : null}
                  {(campaign.location_label || "").trim() ? (
                    <p className="bpc-feat-location">
                      <i className="fa-solid fa-location-dot" aria-hidden />
                      {campaign.location_label}
                    </p>
                  ) : null}
                  {(campaign.excerpt || "").trim() ? (
                    <p className="bpc-feat-story">{campaign.excerpt}</p>
                  ) : null}
                  {(campaign.raised_display || campaign.goal_display) && (
                    <div className="bpc-progress-wrap">
                      <div className="bpc-progress-labels">
                        {(campaign.raised_display || "").trim() ? (
                          <span className="bpc-raised">{campaign.raised_display}</span>
                        ) : (
                          <span className="bpc-raised">&nbsp;</span>
                        )}
                        {(campaign.goal_display || "").trim() ? (
                          <span className="bpc-goal">{campaign.goal_display}</span>
                        ) : null}
                      </div>
                      <div className="bpc-bar-track" aria-hidden>
                        <div className="bpc-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                  {stats.length > 0 ? (
                    <div className="bpc-stats-row">
                      {stats.map((s) => (
                        <div key={`${s.label}-${s.num}`} className="bpc-stat">
                          <span className="bpc-stat-num">{s.num}</span>
                          <span className="bpc-stat-label">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <DonateOrLink
                    href={primaryDonateHref(campaign, pbUrl)}
                    className="bpc-donate-btn"
                    modalCampaignId={primaryModalId(campaign, pbUrl)}
                  >
                    <i className="fa-solid fa-heart" aria-hidden />
                    {pbText}
                  </DonateOrLink>
                  {discussLabel && discussUrl ? (
                    <CtaSecondaryLink href={discussUrl} className="bpc-link-discuss">
                      <i className="fa-regular fa-comments" aria-hidden />
                      {discussLabel}
                    </CtaSecondaryLink>
                  ) : null}
                </>
              ) : (
                <p className="bpc-empty-hint">
                  No campaign is featured on the home page yet. In the dashboard, open{" "}
                  <strong>Campaigns</strong> and turn on <strong>Feature on home page</strong> for a published
                  campaign.
                </p>
              )}
            </div>
          </div>

          <div className="bpc-right-col">
            {sidebar_cards.map((card, idx) => {
              const cp = clampPct(card.progress_pct);
              const tone = card.category_tone || "rose";
              const btnText = (card.button_text || "Support").trim();
              const btnUrl = (card.button_url || "#donate").trim() || "#donate";
              return (
                <div key={`${card.name}-${idx}`} className="glass-card bpc-small-card">
                  <div className="bpc-avatar">
                    {card.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.image_url} alt={card.image_alt || ""} loading="lazy" />
                    ) : (
                      <i className="fa-regular fa-user" aria-hidden />
                    )}
                  </div>
                  <div className="bpc-small-info">
                    {(card.category_label || "").trim() ? (
                      <p className="bpc-small-tag" style={smallTagStyle(tone)}>
                        {card.category_icon ? (
                          <i className={iconClass(card.category_icon)} aria-hidden />
                        ) : null}
                        {card.category_label}
                      </p>
                    ) : null}
                    {(card.name || "").trim() ? <p className="bpc-small-name">{card.name}</p> : null}
                    {(card.description || "").trim() ? (
                      <p className="bpc-small-desc">{card.description}</p>
                    ) : null}
                    <div className="bpc-small-bar-track" aria-hidden>
                      <div className={smallBarClass(card.bar_tone)} style={{ width: `${cp}%` }} />
                    </div>
                    <div className="bpc-small-progress-text">
                      <span>{(card.raised_label || "").trim()}</span>
                      <span>{(card.goal_pct_label || "").trim()}</span>
                    </div>
                    <DonateOrLink href={btnUrl} className="bpc-small-donate" modalCampaignId={card.modal_campaign_id ?? null}>
                      <i className="fa-solid fa-hand-holding-heart" aria-hidden />
                      {btnText}
                    </DonateOrLink>
                  </div>
                </div>
              );
            })}

            {impactItems.length > 0 ? (
              <div className="glass-card bpc-impact-panel">
                <div className="bpc-impact-header">
                  <div className="bpc-impact-icon">
                    <i className={iconClass(impactIcon)} aria-hidden />
                  </div>
                  <span className="bpc-impact-title">{impactTitle}</span>
                </div>
                <div className="bpc-impact-grid">
                  {impactItems.map((it, i) => (
                    <div key={`${it.label}-${i}`} className="bpc-impact-item">
                      <span className="bpc-impact-num">{it.num}</span>
                      <span className="bpc-impact-label">{it.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="bpc-cta-row">
          {(bottom_primary_text || "").trim() ? (
            <DonateOrLink
              href={primaryDonateHref(campaign, (bottom_primary_url || "#donate").trim() || "#donate")}
              className="bpc-cta-primary"
              modalCampaignId={primaryModalId(
                campaign,
                (bottom_primary_url || "#donate").trim() || "#donate",
              )}
            >
              <i className="fa-solid fa-heart" aria-hidden />
              {bottom_primary_text.trim()}
            </DonateOrLink>
          ) : null}
          {(bottom_secondary_text || "").trim() ? (
            <CtaSecondaryLink
              href={(bottom_secondary_url || "#").trim() || "#"}
              className="bpc-cta-ghost"
            >
              <i className="fa-solid fa-people-group" aria-hidden />
              {bottom_secondary_text.trim()}
            </CtaSecondaryLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
