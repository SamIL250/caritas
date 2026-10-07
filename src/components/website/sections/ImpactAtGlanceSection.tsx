"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  /**
   * Max category cards on the site (and max metrics revealed per category).
   * `null` / omitted / invalid = no limit (everything renders).
   */
  max_cards?: number | null;
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

type ImpactCard = {
  key: string;
  /** Footer label — the category name. */
  name: string;
  imageUrl: string;
  statSmall: string | null;
  statLargeValue: string;
  statLargeLabel: string;
};

/** One category card plus the metric cards its arrow reveals. */
type Category = {
  key: string;
  name: string;
  card: ImpactCard;
  metrics: ImpactCard[];
};

/** Returns the card cap, or `null` when every card should render. */
function resolveMaxCards(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.floor(n);
}

/** Cards are grouped by slug so a category keeps its metric cards together. */
function categoryKey(link: ProgramLink): string {
  return (
    link.slug ||
    tabKeyToSlug[link.tab_key] ||
    link.tab_key ||
    link.name ||
    ""
  )
    .trim()
    .toLowerCase();
}

function linkToCard(link: ProgramLink, index: number): ImpactCard {
  const stats = link.stats || [];
  const primary = stats[0];
  const secondary = stats[1];
  return {
    key: `${link.tab_key || "card"}-${index}`,
    name: link.name || link.tab_label || "Caritas Programme",
    imageUrl:
      (link.image_url || "").trim() ||
      DEFAULT_CARD_IMAGES[index % DEFAULT_CARD_IMAGES.length],
    statSmall: secondary
      ? `${secondary.value} ${secondary.label}`.trim()
      : (link.description || "").trim() || null,
    statLargeValue: primary?.value || "",
    statLargeLabel: primary?.label || "",
  };
}

function kpiToCard(kpi: KpiItem, index: number): ImpactCard {
  return {
    key: `kpi-${index}`,
    name: kpi.label || "Impact",
    imageUrl:
      (kpi.image_url || "").trim() ||
      DEFAULT_CARD_IMAGES[index % DEFAULT_CARD_IMAGES.length],
    statSmall: null,
    statLargeValue: kpi.value || "",
    statLargeLabel: kpi.label || "",
  };
}

/**
 * Groups cards into categories (one group per slug). The card carrying the
 * most stats becomes the category card, the remaining cards of the group are
 * its metrics. A category without separate metric cards (Administration &
 * Finance) reveals its own stats instead, so every card keeps an arrow.
 */
function buildCategories(
  links: ProgramLink[],
  maxCards: number | null,
): Category[] {
  const groups = new Map<
    string,
    { link: ProgramLink; index: number; card: ImpactCard }[]
  >();

  links.forEach((link, index) => {
    const key = categoryKey(link);
    const member = { link, index, card: linkToCard(link, index) };
    const group = groups.get(key);
    if (group) group.push(member);
    else groups.set(key, [member]);
  });

  const categories: { index: number; category: Category }[] = [];

  for (const [key, members] of groups) {
    let anchorPos = 0;
    members.forEach((member, i) => {
      const stats = member.link.stats?.length ?? 0;
      const anchorStats = members[anchorPos].link.stats?.length ?? 0;
      if (stats > anchorStats) anchorPos = i;
    });

    const anchor = members[anchorPos];
    const { card } = anchor;
    const metrics: ImpactCard[] = members
      .filter((_, i) => i !== anchorPos)
      .map((member) => ({ ...member.card, name: card.name }));

    if (metrics.length === 0) {
      (anchor.link.stats || []).forEach((stat, i) => {
        metrics.push({
          key: `${key}-stat-${i}`,
          name: card.name,
          imageUrl: card.imageUrl,
          statSmall: stat.label,
          statLargeValue: stat.value,
          statLargeLabel: "",
        });
      });
    }

    categories.push({
      index: anchor.index,
      category: { key, name: card.name, card, metrics },
    });
  }

  categories.sort((a, b) => a.index - b.index);
  const ordered = categories.map((entry) => entry.category);
  const visible = maxCards === null ? ordered : ordered.slice(0, maxCards);
  if (maxCards === null) return visible;
  return visible.map((category) => ({
    ...category,
    metrics: category.metrics.slice(0, maxCards),
  }));
}

function CardMedia({ imageUrl }: { imageUrl: string }) {
  return (
    <>
      <div
        className={`cr-impact__card-media${imageUrl ? "" : " cr-impact__card-media--fallback"}`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- CMS / static public URLs
          <img src={imageUrl} alt="" loading="lazy" decoding="async" />
        ) : null}
      </div>
      <div className="cr-impact__card-shade" aria-hidden />
    </>
  );
}

function CardStats({ card }: { card: ImpactCard }) {
  return (
    <>
      {card.statSmall ? (
        <p className="cr-impact__stat-sm">{card.statSmall}</p>
      ) : null}
      {card.statLargeValue ? (
        <p className="cr-impact__stat-lg">
          <strong>{card.statLargeValue}</strong>
          {card.statLargeLabel}
        </p>
      ) : null}
    </>
  );
}

function MetricCard({
  card,
  categoryLabel,
}: {
  card: ImpactCard;
  categoryLabel?: string;
}) {
  return (
    <article className="cr-impact__card cr-impact__card--metric">
      <CardMedia imageUrl={card.imageUrl} />
      <div className="cr-impact__card-body">
        <CardStats card={card} />
        {categoryLabel ? (
          <div className="cr-impact__card-foot">
            <p className="cr-impact__card-cat">{categoryLabel}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
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
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const triggerKeyRef = useRef<string | null>(null);

  // The arrow that opened a view is unmounted while it is open, so the
  // category key is remembered instead of the element itself.
  const focusTrigger = useCallback(() => {
    const key = triggerKeyRef.current;
    if (!key) return;
    for (const arrow of Array.from(
      document.querySelectorAll<HTMLElement>(".cr-impact__card-arrow"),
    )) {
      if (arrow.dataset.key !== key) continue;
      arrow.focus();
      return;
    }
  }, []);

  const closeReveal = useCallback(() => {
    setActiveKey(null);
    requestAnimationFrame(focusTrigger);
  }, [focusTrigger]);

  // Move focus into the revealed view, and back to the arrow that opened it.
  useEffect(() => {
    if (activeKey) backRef.current?.focus();
  }, [activeKey]);

  useEffect(() => {
    if (!activeKey) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeReveal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeKey, closeReveal]);

  const maxCards = resolveMaxCards(max_cards);

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

  const categories = buildCategories(programLinks, maxCards);
  const kpiCards = categories.length === 0 ? (kpis || []).map(kpiToCard) : [];
  if (categories.length === 0 && kpiCards.length === 0) return null;

  const active =
    categories.find((c) => c.key === activeKey && c.metrics.length > 0) ?? null;

  const titleLead = title || "Caritas Rwanda by the";
  const titleAccent = title_accent || "Numbers";
  const intro =
    (body || "").trim() ||
    "A transparent look at our reach across programmes — healthcare, social welfare, development, and administration.";

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

        {active ? (
          <div className="cr-impact__toolbar" key={`toolbar-${active.key}`}>
            <button
              type="button"
              ref={backRef}
              className="cr-impact__back"
              onClick={closeReveal}
            >
              <ChevronLeft size={16} strokeWidth={2.25} aria-hidden />
              <span>All categories</span>
            </button>
            <h3 className="cr-impact__toolbar-title">{active.name}</h3>
          </div>
        ) : null}
      </div>

      <div className="cr-impact__cards-wrap">
        <div
          className="cr-impact__display"
          key={active ? `metrics-${active.key}` : "categories"}
        >
          {active
            ? active.metrics.map((card) => (
                <MetricCard
                  key={card.key}
                  card={card}
                  categoryLabel={active.name}
                />
              ))
            : categories.length > 0
              ? categories.map((category) => (
                  <article className="cr-impact__card" key={category.key}>
                    <CardMedia imageUrl={category.card.imageUrl} />
                    <div className="cr-impact__card-body">
                      <CardStats card={category.card} />
                      <div className="cr-impact__card-foot">
                        <h3 className="cr-impact__card-name">
                          {category.card.name}
                        </h3>
                        {category.metrics.length > 0 ? (
                          <button
                            type="button"
                            className="cr-impact__card-arrow"
                            data-key={category.key}
                            aria-label={`Show metrics for ${category.name}`}
                            onClick={(event) => {
                              triggerKeyRef.current =
                                event.currentTarget.dataset.key;
                              setActiveKey(category.key);
                            }}
                          >
                            <ChevronRight
                              size={18}
                              strokeWidth={2.25}
                              aria-hidden
                            />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))
              : kpiCards.map((card) => (
                  <MetricCard key={card.key} card={card} />
                ))}
        </div>
      </div>
    </section>
  );
}
