import React from "react";
import Link from "next/link";
import { DEFAULT_SECTION_CONTENT } from "@/lib/constants";

export type StatBannerVariant = "red" | "blue" | "teal";

export type StatBannerLayout = "strip" | "impact";

/** Icons for the white “infographic” strip (about.html reference design). */
export type StatBannerStripIcon =
  | "clock"
  | "people"
  | "church"
  | "hands-heart"
  | "heart-pulse"
  | "money";

export type StatBannerItem = {
  number_core: string;
  number_suffix?: string;
  label: string;
  trend?: string;
  variant?: StatBannerVariant;
  strip_icon?: StatBannerStripIcon;
};

export type StatsBannerSectionProps = {
  layout?: StatBannerLayout;
  badge?: string;
  title_lead?: string;
  title_accent?: string;
  subtitle?: string;
  items?: StatBannerItem[];
  cta_label?: string;
  cta_href?: string;
};

type BannerDefaults = {
  layout: StatBannerLayout;
  badge: string;
  title_lead: string;
  title_accent: string;
  subtitle: string;
  cta_label: string;
  cta_href: string;
  items: StatBannerItem[];
};

const VARIANT_CYCLE: StatBannerVariant[] = ["red", "blue", "teal"];

const STRIP_ICON_DEFAULTS: StatBannerStripIcon[] = [
  "clock",
  "people",
  "church",
  "hands-heart",
  "heart-pulse",
  "money",
];

const STRIP_ICON_SET = new Set<string>([
  "clock",
  "people",
  "church",
  "hands-heart",
  "heart-pulse",
  "money",
]);

const BASE = DEFAULT_SECTION_CONTENT.stats_banner as BannerDefaults;

function normalizeStripIcon(raw: unknown, index: number): StatBannerStripIcon {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (STRIP_ICON_SET.has(s)) return s as StatBannerStripIcon;
  return STRIP_ICON_DEFAULTS[index % STRIP_ICON_DEFAULTS.length];
}

function mergeSection(
  props: StatsBannerSectionProps,
): (BannerDefaults & { layout: StatBannerLayout }) | null {
  const rawItems =
    props.items === undefined || props.items === null ? (BASE.items ?? []) : props.items;

  if (!rawItems.length) return null;

  const items = rawItems.map((it, i) => {
    const fallback = BASE.items?.[i];
    const variant =
      (it.variant as StatBannerVariant | undefined) ||
      fallback?.variant ||
      VARIANT_CYCLE[i % VARIANT_CYCLE.length];
    const strip_icon = normalizeStripIcon(it.strip_icon ?? fallback?.strip_icon, i);
    return {
      number_core: String(it.number_core ?? ""),
      number_suffix: it.number_suffix ?? "",
      label: String(it.label ?? ""),
      trend: it.trend ?? fallback?.trend ?? "",
      variant,
      strip_icon,
    };
  });

  const layout: StatBannerLayout =
    props.layout === "impact" || props.layout === "strip"
      ? props.layout
      : BASE.layout === "impact" || BASE.layout === "strip"
        ? BASE.layout
        : "strip";

  return {
    layout,
    badge: props.badge ?? BASE.badge,
    title_lead: props.title_lead ?? BASE.title_lead,
    title_accent: props.title_accent ?? BASE.title_accent,
    subtitle: props.subtitle ?? BASE.subtitle,
    cta_label: props.cta_label ?? BASE.cta_label,
    cta_href: props.cta_href ?? BASE.cta_href,
    items,
  };
}

function SvgAttrs({ className }: { className?: string }) {
  return {
    className,
    xmlns: "http://www.w3.org/2000/svg",
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
}

function IconClock({ className }: { className?: string }) {
  const a = SvgAttrs({ className });
  return (
    <svg {...a}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function IconPeople({ className }: { className?: string }) {
  const a = SvgAttrs({ className });
  return (
    <svg {...a}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconChurch({ className }: { className?: string }) {
  const a = SvgAttrs({ className });
  return (
    <svg {...a}>
      <path d="M10 9h4" />
      <path d="M12 7v14" />
      <path d="M8 21h8" />
      <path d="M6 21V10l6-5 6 5v11" />
      <path d="M12 3v2" />
    </svg>
  );
}

function IconHandsHeart({ className }: { className?: string }) {
  const a = SvgAttrs({ className });
  return (
    <svg {...a}>
      <path d="M11 14h2a2 2 0 0 0 2-2v-.5l2.48-2.52A2 2 0 1 0 12 6v2.05" />
      <path d="M13 14h-2a2 2 0 0 1-2-2v-.5L6.52 9A2 2 0 1 1 12 6v2.05" />
      <path d="M7 19c1.5 1 3.5 1 6 0" />
      <path d="M12 21v-7" />
    </svg>
  );
}

function IconHeartPulse({ className }: { className?: string }) {
  const a = SvgAttrs({ className });
  return (
    <svg {...a}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}

function IconMoneyBag({ className }: { className?: string }) {
  const a = SvgAttrs({ className });
  return (
    <svg {...a}>
      <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L8 13.5" />
      <path d="M11 18h4a3 3 0 0 0 3-3v-4l-3-4h-8l-3 4v4a3 3 0 0 0 3 3h4Z" />
      <path d="M16 11V9a4 4 0 0 0-8 0v2" />
    </svg>
  );
}

function IconHospital({ className }: { className?: string }) {
  const a = SvgAttrs({ className });
  return (
    <svg {...a}>
      <path d="M12 6v4" />
      <path d="M14 14h-4" />
      <path d="M14 18h-4" />
      <path d="M14 8h-4" />
      <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2" />
      <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  const a = SvgAttrs({ className });
  return (
    <svg {...a}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function TrendGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function StripStatIcon({ icon }: { icon: StatBannerStripIcon }) {
  switch (icon) {
    case "people":
      return <IconPeople />;
    case "church":
      return <IconChurch />;
    case "hands-heart":
      return <IconHandsHeart />;
    case "heart-pulse":
      return <IconHeartPulse />;
    case "money":
      return <IconMoneyBag />;
    case "clock":
    default:
      return <IconClock />;
  }
}

function statVariantToneClass(variant: StatBannerVariant) {
  if (variant === "blue") return "cr-resources-icon--blue";
  if (variant === "teal") return "cr-resources-icon--teal";
  return "cr-resources-icon--red";
}

function StatIcon({ variant }: { variant: StatBannerVariant }) {
  const inner =
    variant === "blue" ? (
      <IconHospital />
    ) : variant === "teal" ? (
      <IconGlobe />
    ) : (
      <IconPeople />
    );

  return (
    <div
      className={`cr-resources-icon-wrap ${statVariantToneClass(variant)}`}
      aria-hidden
    >
      {inner}
    </div>
  );
}

function ResourcesCta({ href, label }: { href: string; label: string }) {
  const inner = (
    <>
      <span>{label}</span>
      <svg
        className="cr-resources-cta-arrow"
        xmlns="http://www.w3.org/2000/svg"
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </>
  );

  const isInternal = href.startsWith("/") && !href.startsWith("//");

  if (isInternal) {
    return (
      <Link href={href} className="cr-resources-cta">
        {inner}
      </Link>
    );
  }

  return (
    <a href={href} className="cr-resources-cta">
      {inner}
    </a>
  );
}

export default function StatsBannerSection(props: StatsBannerSectionProps = {}) {
  const c = mergeSection(props);

  if (!c) return null;

  const aria = c.items[0]?.label || c.subtitle || "Key statistics";

  if (c.layout === "strip") {
    return (
      <section className="stats-banner" aria-label={aria}>
        <div className="stats-banner-card">
          <div className="stats-banner-grid">
            {c.items.map((it, idx) => (
              <div className="stats-banner-item" key={`${it.label}-${idx}`}>
                <div className="stats-banner-icon" aria-hidden>
                  <StripStatIcon icon={it.strip_icon!} />
                </div>
                <div className="stats-banner-number">
                  <span>{it.number_core}</span>
                  {it.number_suffix ?? ""}
                </div>
                <div className="stats-banner-label">{it.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cr-resources-impact" id="impact" aria-label={aria}>
      <div className="cr-resources-impact-inner">
        <header className="cr-resources-header">
          {c.badge?.trim() ? (
            <div className="cr-resources-badge">{c.badge.trim()}</div>
          ) : null}
          <h2 className="cr-resources-title">
            {c.title_lead}{" "}
            <span className="cr-resources-title-accent">{c.title_accent}</span>
          </h2>
          <p className="cr-resources-subtitle">{c.subtitle}</p>
        </header>

        <div className="cr-resources-grid">
          {c.items.map((it, idx) => {
            const variant = it.variant ?? VARIANT_CYCLE[idx % VARIANT_CYCLE.length];
            return (
              <article key={`${it.label}-${idx}`} className="cr-resources-card">
                <StatIcon variant={variant} />
                <div className="cr-resources-stat">
                  <span>{it.number_core}</span>
                  {it.number_suffix ?? ""}
                </div>
                <div className="cr-resources-label">{it.label}</div>
                {it.trend?.trim() ? (
                  <div className="cr-resources-trend">
                    <TrendGlyph />
                    <span>{it.trend.trim()}</span>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {c.cta_label?.trim() && c.cta_href?.trim() ? (
          <div className="cr-resources-cta-wrap">
            <ResourcesCta href={c.cta_href.trim()} label={c.cta_label.trim()} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
