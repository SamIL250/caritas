"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ScrollReveal from "@/components/website/motion/ScrollReveal";

export type KpiItem = {
  value: string;
  label: string;
  color?: string;
  size?: "xs" | "sm" | "lg" | "xl";
  image_url?: string;
};

export type ProgramStat = {
  value: string;
  label: string;
  size?: "xs" | "sm" | "lg" | "xl";
  color?: string;
};

export type ProgramLink = {
  tab_key: string;
  tab_label: string;
  tab_icon: string;
  name: string;
  description: string;
  icon: string;
  accent_color: string;
  slug?: string;
  image_url?: string;
  stats?: ProgramStat[];
};

export type ImpactAtGlanceContent = {
  label?: string;
  title?: string;
  title_accent?: string;
  body?: string;
  /** Max cards rendered on the site (keeps page light). Default 6. */
  max_cards?: number;
  kpis?: KpiItem[];
  programs?: ProgramLink[];
};

const tabKeyToSlug: Record<string, string> = {
  health: "health",
  social: "social-welfare",
  development: "development",
  admin: "finance-administration",
};

const DEFAULT_CARD_IMAGES = [
  "/img/health.JPG.webp",
  "/img/slide2.webp",
  "/img/slide3.webp",
  "/img/slide1.webp",
  "/img/slide4.webp",
  "/img/slide5.webp",
];

const DEFAULT_MAX_CARDS = 6;

type ImpactCard = {
  key: string;
  name: string;
  href: string;
  imageUrl: string;
  statSmall: string | null;
  statLargeValue: string;
  statLargeLabel: string;
};

function clampMaxCards(raw: unknown): number {
  const n = typeof raw === "number" ? raw : parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_MAX_CARDS;
  return Math.min(12, Math.max(1, Math.floor(n)));
}

function buildCards(
  programs: ProgramLink[],
  kpis: KpiItem[],
  maxCards: number,
): ImpactCard[] {
  const fromPrograms =
    programs.length > 0
      ? programs.map((p, i) => {
          const slug = p.slug || tabKeyToSlug[p.tab_key] || p.tab_key;
          const stats = p.stats || [];
          const primary = stats[0];
          const secondary = stats[1];
          return {
            key: `${p.tab_key || "prog"}-${i}`,
            name: p.name || p.tab_label || "Programme",
            href: `/programs#${slug}`,
            imageUrl:
              (p.image_url || "").trim() ||
              DEFAULT_CARD_IMAGES[i % DEFAULT_CARD_IMAGES.length],
            statSmall: secondary
              ? `${secondary.value} ${secondary.label}`.trim()
              : (p.description || "").trim() || null,
            statLargeValue: primary?.value || "",
            statLargeLabel: primary?.label || "",
          };
        })
      : kpis.map((kpi, i) => ({
          key: `kpi-${i}`,
          name: kpi.label || "Impact",
          href: "/programs",
          imageUrl:
            (kpi.image_url || "").trim() ||
            DEFAULT_CARD_IMAGES[i % DEFAULT_CARD_IMAGES.length],
          statSmall: null,
          statLargeValue: kpi.value || "",
          statLargeLabel: kpi.label || "",
        }));

  return fromPrograms.slice(0, maxCards);
}

export default function ImpactAtGlanceSection({
  label,
  title,
  title_accent,
  body,
  max_cards,
  kpis,
  programs,
  allProgramSections,
}: ImpactAtGlanceContent & {
  allProgramSections?: {
    tab_key: string;
    tab_label: string;
    tab_icon: string;
    content: any;
  }[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const maxCards = clampMaxCards(max_cards);

  const programLinks: ProgramLink[] =
    programs && programs.length > 0
      ? programs
      : (allProgramSections || []).map((s) => {
          const c = s.content as any;
          return {
            tab_key: s.tab_key,
            tab_label: s.tab_label,
            tab_icon: s.tab_icon || "fa-chart-bar",
            name: c?.name || s.tab_label,
            description: c?.description || "",
            icon: c?.icon || s.tab_icon || "fa-chart-bar",
            accent_color: c?.accent_color || "#8c2208",
            slug: tabKeyToSlug[s.tab_key] || s.tab_key,
            image_url: c?.image_url || "",
            stats: c?.stats || [],
          };
        });

  const cards = buildCards(programLinks, kpis || [], maxCards);
  if (cards.length === 0) return null;

  const titleLead = title || "Caritas Rwanda by the";
  const titleAccent = title_accent || "Numbers";
  const intro =
    (body || "").trim() ||
    "A transparent look at our reach across programmes — healthcare, social welfare, development, and administration.";

  const scrollByCard = useCallback((dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".cr-impact__card");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.75;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  const showArrows = cards.length > 1;

  return (
    <section className="cr-impact" aria-labelledby="cr-impact-title">
      <div className="cr-impact__band">
        <div className="cr-impact__band-inner">
          <ScrollReveal>
            <div>
              {(label || "").trim() ? (
                <p className="cr-impact__eyebrow">{label}</p>
              ) : null}
              <h2 id="cr-impact-title" className="cr-impact__title">
                {titleLead}{" "}
                <span className="cr-impact__title-accent">{titleAccent}</span>
              </h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <p className="cr-impact__body">{intro}</p>
          </ScrollReveal>
        </div>
      </div>

      <div className="cr-impact__cards-wrap">
        <div className="cr-impact__carousel">
          {showArrows ? (
            <button
              type="button"
              className="cr-impact__nav cr-impact__nav--prev"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous impact cards"
            >
              <ChevronLeft size={22} strokeWidth={2.25} aria-hidden />
            </button>
          ) : null}

          <div
            ref={trackRef}
            className="cr-impact__track"
            role="list"
            aria-label="Impact metrics"
          >
            {cards.map((card) => (
              <Link
                key={card.key}
                href={card.href}
                className="cr-impact__card"
                role="listitem"
              >
                <div
                  className={`cr-impact__card-media${card.imageUrl ? "" : " cr-impact__card-media--fallback"}`}
                >
                  {card.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- CMS / static public URLs
                    <img
                      src={card.imageUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </div>
                <div className="cr-impact__card-shade" aria-hidden />
                <div className="cr-impact__card-body">
                  {card.statSmall ? (
                    <p className="cr-impact__stat-sm">{card.statSmall}</p>
                  ) : null}
                  {card.statLargeValue ? (
                    <p className="cr-impact__stat-lg">
                      <strong>{card.statLargeValue}</strong>
                      {card.statLargeLabel}
                    </p>
                  ) : null}
                  <div className="cr-impact__card-foot">
                    <h3 className="cr-impact__card-name">{card.name}</h3>
                    <span className="cr-impact__card-arrow" aria-hidden>
                      <i className="fa-solid fa-arrow-right" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {showArrows ? (
            <button
              type="button"
              className="cr-impact__nav cr-impact__nav--next"
              onClick={() => scrollByCard(1)}
              aria-label="Next impact cards"
            >
              <ChevronRight size={22} strokeWidth={2.25} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
