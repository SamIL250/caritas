"use client";

import Link from "next/link";
import { useDonation } from "@/context/DonationContext";
import { isDarkBackgroundColor } from "@/lib/isDarkBackgroundColor";

export type CtaStat = {
  icon: string;
  value: string;
  value_suffix?: string;
  label: string;
};

export type CtaFeaturedCard = {
  featured_campaign_id?: string;
  donation_modal_campaign_id?: string;
  image_url?: string;
  image_alt?: string;
  category_label?: string;
  category_icon?: string;
  title?: string;
  location?: string;
  story?: string;
  raised_label?: string;
  goal_label?: string;
  progress_pct?: number;
  stats?: { num: string; label: string }[];
  primary_button_text?: string;
  primary_button_url?: string;
  discussion_label?: string;
  discussion_url?: string;
};

export type CtaSidebarCard = {
  /** When button_url is #donate, opens donation modal scoped to this campaign */
  modal_campaign_id?: string | null;
  image_url?: string;
  image_alt?: string;
  category_label?: string;
  category_icon?: string;
  category_tone?: "rose" | "sky" | "teal";
  name?: string;
  description?: string;
  raised_label?: string;
  goal_pct_label?: string;
  progress_pct?: number;
  bar_tone?: "sky" | "teal";
  button_text?: string;
  button_url?: string;
  discuss_label?: string;
  discuss_url?: string;
};

export type CtaImpactPanel = {
  title?: string;
  icon?: string;
  items?: { num: string; label: string }[];
};

export interface CTAProps {
  eyebrow?: string;
  heading?: string;
  heading_accent?: string;
  body?: string;
  button_text?: string;
  button_url?: string;
  secondary_text?: string;
  secondary_url?: string;
  bg_color?: string;
  stats?: CtaStat[];
  /** Original homepage layout: featured story + sidebar cards + impact grid */
  be_part_grid?: boolean;
  featured_card?: CtaFeaturedCard;
  sidebar_cards?: CtaSidebarCard[];
  impact_panel?: CtaImpactPanel;
  bottom_primary_text?: string;
  bottom_primary_url?: string;
  bottom_secondary_text?: string;
  bottom_secondary_url?: string;
}

const DEFAULT_STATS: CtaStat[] = [
  { icon: "fa-users", value: "150", value_suffix: "K+", label: "Lives Transformed" },
  { icon: "fa-calendar-check", value: "67", value_suffix: "+", label: "Years of Service" },
  { icon: "fa-church", value: "9", label: "Dioceses Covered" },
  { icon: "fa-hands-helping", value: "8", value_suffix: "K", label: "Active Volunteers" },
];

function iconClass(raw: string) {
  const t = (raw || "fa-users").trim();
  if (t.startsWith("fa-") && t.includes(" ")) return t;
  if (t.startsWith("fa-")) return `fa-solid ${t}`;
  return `fa-solid fa-${t.replace(/^fa-?/i, "")}`;
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
  /** When set and href is #donate, opens donation modal scoped to this community campaign */
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
    <CtaSecondaryLink href={h || "#"} className={className}>
      {children}
    </CtaSecondaryLink>
  );
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

function clampPct(n: unknown): number {
  const x = typeof n === "number" ? n : Number.parseFloat(String(n));
  if (!Number.isFinite(x)) return 0;
  return Math.min(100, Math.max(0, Math.round(x)));
}

function FeaturedDonateSection(props: {
  featured: CtaFeaturedCard;
  sidebar_cards: CtaSidebarCard[];
  impact_panel?: CtaImpactPanel;
  bottom_primary_text?: string;
  bottom_primary_url?: string;
  bottom_secondary_text?: string;
  bottom_secondary_url?: string;
}) {
  const {
    featured,
    sidebar_cards,
    impact_panel,
    bottom_primary_text,
    bottom_primary_url,
    bottom_secondary_text,
    bottom_secondary_url,
  } = props;

  const pct = clampPct(featured.progress_pct);
  const pbText = (featured.primary_button_text || "Donate Now").trim();
  const pbUrl = (featured.primary_button_url || "#donate").trim() || "#donate";
  const discussLabel = (featured.discussion_label || "").trim();
  const discussUrl = (featured.discussion_url || "").trim();

  const impactItems = Array.isArray(impact_panel?.items) ? impact_panel!.items! : [];
  const impactTitle = (impact_panel?.title || "Our collective impact").trim();
  const impactIcon = (impact_panel?.icon || "fa-chart-line").trim();

  return (
    <>
      <div className="cr-bpc-grid">
        <article className="cr-bpc-card cr-bpc-feat">
          <div className="cr-bpc-feat-media">
            {featured.image_url ? (
              // CMS / external URLs — avoid coupling remotePatterns for next/image here.
              // eslint-disable-next-line @next/next/no-img-element -- CMS-provided URLs
              <img src={featured.image_url} alt={featured.image_alt || ""} loading="lazy" />
            ) : null}
            {(featured.category_label || "").trim() ? (
              <span className="cr-bpc-feat-tag">
                {featured.category_icon ? (
                  <i className={iconClass(featured.category_icon)} aria-hidden />
                ) : null}
                {featured.category_label}
              </span>
            ) : null}
          </div>
          <div className="cr-bpc-feat-body">
            {(featured.title || "").trim() ? (
              <h3 className="cr-bpc-feat-name">{featured.title}</h3>
            ) : null}
            {(featured.location || "").trim() ? (
              <p className="cr-bpc-feat-location">
                <i className="fa-solid fa-location-dot" aria-hidden />
                {featured.location}
              </p>
            ) : null}
            {(featured.story || "").trim() ? (
              <p className="cr-bpc-feat-story">{featured.story}</p>
            ) : null}
            {(featured.raised_label || featured.goal_label) && (
              <div className="cr-bpc-progress-wrap">
                <div className="cr-bpc-progress-labels">
                  {(featured.raised_label || "").trim() ? (
                    <span className="cr-bpc-raised">{featured.raised_label}</span>
                  ) : (
                    <span className="cr-bpc-raised">&nbsp;</span>
                  )}
                  {(featured.goal_label || "").trim() ? (
                    <span className="cr-bpc-goal">{featured.goal_label}</span>
                  ) : null}
                </div>
                <div className="cr-bpc-bar-track" aria-hidden>
                  <div className="cr-bpc-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
            {Array.isArray(featured.stats) && featured.stats.length > 0 ? (
              <div className="cr-bpc-feat-stats">
                {featured.stats.map((s, i) => (
                  <div key={`${s.label}-${i}`} className="cr-bpc-mini-stat">
                    <div className="cr-bpc-mini-stat-num">{s.num}</div>
                    <div className="cr-bpc-mini-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            ) : null}
            <DonateOrLink
              href={pbUrl}
              className="cr-bpc-btn-full"
              modalCampaignId={featured.donation_modal_campaign_id ?? null}
            >
              <i className="fa-solid fa-heart" aria-hidden />
              {pbText}
            </DonateOrLink>
            {discussLabel && discussUrl ? (
              <CtaSecondaryLink href={discussUrl} className="cr-bpc-link-discuss">
                <i className="fa-regular fa-comments" aria-hidden />
                {discussLabel}
              </CtaSecondaryLink>
            ) : null}
          </div>
        </article>

        <div className="cr-bpc-right-col">
          {sidebar_cards.map((card, idx) => {
            const cp = clampPct(card.progress_pct);
            const tone = card.category_tone || "rose";
            const tagCls =
              tone === "sky"
                ? "cr-bpc-small-tag cr-bpc-small-tag--sky"
                : tone === "teal"
                  ? "cr-bpc-small-tag cr-bpc-small-tag--teal"
                  : "cr-bpc-small-tag";
            const fillTone =
              card.bar_tone === "teal"
                ? "cr-bpc-bar-fill cr-bpc-bar-fill--teal"
                : card.bar_tone === "sky"
                  ? "cr-bpc-bar-fill cr-bpc-bar-fill--sky"
                  : "cr-bpc-bar-fill";
            const btnText = (card.button_text || "Support").trim();
            const btnUrl = (card.button_url || "#donate").trim() || "#donate";
            const dLab = (card.discuss_label || "").trim();
            const dUrl = (card.discuss_url || "").trim();

            return (
              <div key={`${card.name}-${idx}`} className="cr-bpc-card cr-bpc-small">
                <div className="cr-bpc-avatar">
                  {card.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- CMS-provided URLs
                    <img src={card.image_url} alt={card.image_alt || ""} loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-600">
                      <i className="fa-regular fa-user text-xl" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="cr-bpc-small-info">
                  {(card.category_label || "").trim() ? (
                    <p className={tagCls}>
                      {card.category_icon ? (
                        <i className={iconClass(card.category_icon)} aria-hidden />
                      ) : null}
                      {card.category_label}
                    </p>
                  ) : null}
                  {(card.name || "").trim() ? (
                    <p className="cr-bpc-small-name">{card.name}</p>
                  ) : null}
                  {(card.description || "").trim() ? (
                    <p className="cr-bpc-small-desc">{card.description}</p>
                  ) : null}
                  <div className="cr-bpc-bar-track" aria-hidden>
                    <div className={fillTone} style={{ width: `${cp}%` }} />
                  </div>
                  <div className="cr-bpc-small-meta">
                    <span>{(card.raised_label || "").trim()}</span>
                    <span>{(card.goal_pct_label || "").trim()}</span>
                  </div>
                  <div className="cr-bpc-small-actions">
                    <DonateOrLink href={btnUrl} className="cr-bpc-small-btn">
                      <i className="fa-solid fa-hand-holding-heart" aria-hidden />
                      {btnText}
                    </DonateOrLink>
                    {dLab && dUrl ? (
                      <CtaSecondaryLink href={dUrl} className="cr-bpc-small-btn">
                        <i className="fa-regular fa-comments" aria-hidden />
                        {dLab}
                      </CtaSecondaryLink>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          {impactItems.length > 0 ? (
            <div className="cr-bpc-card cr-bpc-impact">
              <div className="cr-bpc-impact-head">
                <div className="cr-bpc-impact-icon">
                  <i className={iconClass(impactIcon)} aria-hidden />
                </div>
                <span className="cr-bpc-impact-title">{impactTitle}</span>
              </div>
              <div className="cr-bpc-impact-grid">
                {impactItems.map((it, i) => (
                  <div key={`${it.label}-${i}`} className="cr-bpc-impact-item">
                    <span className="cr-bpc-impact-num">{it.num}</span>
                    <span className="cr-bpc-impact-label">{it.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {(bottom_primary_text || bottom_secondary_text) && (
        <div className="cr-bpc-bottom">
          {(bottom_primary_text || "").trim() ? (
            <DonateOrLink
              href={(bottom_primary_url || "#donate").trim()}
              className="cr-bpc-bottom-btn cr-bpc-bottom-btn--primary"
            >
              <i className="fa-solid fa-heart" aria-hidden />
              {bottom_primary_text}
            </DonateOrLink>
          ) : null}
          {(bottom_secondary_text || "").trim() ? (
            <DonateOrLink
              href={(bottom_secondary_url || "#").trim()}
              className="cr-bpc-bottom-btn cr-bpc-bottom-btn--ghost"
            >
              <i className="fa-solid fa-people-group" aria-hidden />
              {bottom_secondary_text}
            </DonateOrLink>
          ) : null}
        </div>
      )}
    </>
  );
}

export default function CTA({
  eyebrow = "Make a Difference",
  heading = "Be Part of",
  heading_accent,
  body = "Your support enables us to continue our mission of transforming lives and building sustainable communities across all nine dioceses of Rwanda.",
  button_text = "Donate Now",
  button_url = "#donate",
  secondary_text = "Volunteer with Us",
  secondary_url = "#",
  bg_color = "#f0f2f5",
  stats: statsProp,
  be_part_grid = false,
  featured_card,
  sidebar_cards = [],
  impact_panel,
  bottom_primary_text,
  bottom_primary_url,
  bottom_secondary_text,
  bottom_secondary_url,
}: CTAProps) {
  const { openModal } = useDonation();
  const displayEyebrow = (eyebrow || "").trim();
  const { line1, line2 } = formatLegacyHeading(heading, heading_accent);
  const displayBody =
    (body || "").trim() ||
    "Your support enables us to continue our mission of transforming lives and building sustainable communities across all nine dioceses of Rwanda.";
  const pText = (button_text || "Donate Now").trim();
  const pUrl = (button_url || "#donate").trim() || "#donate";
  const sText = (secondary_text || "").trim();
  const sUrl = (secondary_url || "#").trim();
  const bg = (bg_color || "#f0f2f5").trim();
  const onDark = isDarkBackgroundColor(bg);

  const stats: CtaStat[] = Array.isArray(statsProp)
    ? statsProp.length > 0
      ? statsProp
      : []
    : DEFAULT_STATS;

  const featured = featured_card && typeof featured_card === "object" ? featured_card : null;
  const usePartGrid =
    Boolean(be_part_grid) &&
    featured &&
    ((featured.title || "").trim() || (featured.story || "").trim() || featured.image_url);

  const showClassicStats = !usePartGrid && stats.length > 0;

  const primaryOpensDonation = pUrl === "#donate";

  return (
    <section
      className={`${usePartGrid ? "cta-engage cr-bpc " : "cta-engage "}${onDark ? "cta-engage--on-dark" : ""}`}
      id="get-involved"
      aria-labelledby="cta-engage-title"
      style={{ backgroundColor: bg }}
    >
      <div
        className={
          usePartGrid
            ? "cr-bpc-inner"
            : `cta-engage__inner container-wide ${!showClassicStats ? "cta-engage__inner--text-only" : ""}`
        }
      >
        <header className={usePartGrid ? "cr-bpc-header" : "cta-engage__text"}>
          {displayEyebrow ? (
            <p className={usePartGrid ? "cr-bpc-badge" : "cta-engage__eyebrow"}>
              <i className="fa-solid fa-heart" aria-hidden />
              {displayEyebrow}
            </p>
          ) : null}
          <h2 className={usePartGrid ? "cr-bpc-title" : "cta-engage__title"} id="cta-engage-title">
            {line2 ? (
              <>
                {line1}
                <br />
                <span className={usePartGrid ? "cr-bpc-title-accent" : "cta-engage__title-accent"}>
                  {line2}
                </span>
              </>
            ) : (
              line1
            )}
          </h2>
          <p className={usePartGrid ? "cr-bpc-subtitle" : "cta-engage__body"}>{displayBody}</p>

          {!usePartGrid ? (
            <div className="cta-engage__actions">
              {primaryOpensDonation ? (
                <button
                  type="button"
                  className="cta-engage__btn cta-engage__btn--primary"
                  onClick={() => openModal()}
                >
                  <i className="fa-solid fa-hand-holding-dollar" aria-hidden />
                  {pText}
                </button>
              ) : (
                <Link href={pUrl} className="cta-engage__btn cta-engage__btn--primary">
                  <i className="fa-solid fa-hand-holding-dollar" aria-hidden />
                  {pText}
                </Link>
              )}
              {sText ? (
                <CtaSecondaryLink
                  href={sUrl}
                  className="cta-engage__btn cta-engage__btn--secondary"
                >
                  <i className="fa-solid fa-people-group" aria-hidden />
                  {sText}
                </CtaSecondaryLink>
              ) : null}
            </div>
          ) : null}
        </header>

        {usePartGrid ? (
          <FeaturedDonateSection
            featured={featured}
            sidebar_cards={Array.isArray(sidebar_cards) ? sidebar_cards : []}
            impact_panel={impact_panel}
            bottom_primary_text={bottom_primary_text}
            bottom_primary_url={bottom_primary_url}
            bottom_secondary_text={bottom_secondary_text}
            bottom_secondary_url={bottom_secondary_url}
          />
        ) : showClassicStats ? (
          <div
            className="cta-engage__stats"
            role="list"
            aria-label="Key impact numbers"
          >
            {stats.map((s, i) => (
              <div
                key={`${s.label}-${i}`}
                className="cta-engage__stat"
                role="listitem"
              >
                <div className="cta-engage__stat-icon" aria-hidden>
                  <i className={iconClass(s.icon)} />
                </div>
                <div className="cta-engage__stat-value">
                  {s.value}
                  {s.value_suffix ? <span>{s.value_suffix}</span> : null}
                </div>
                <div className="cta-engage__stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
