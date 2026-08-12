import React from "react";

type HistoryCard = {
  year: string;
  eraPill: string;
  eraPillIcon?: string;
  title: string;
  body: string;
  imageUrl: string;
  variant: "crimson" | "navy" | "light" | "gold";
  span?: 1 | 2 | 3;
};

export type HistoryBentoItemInput = {
  year?: string;
  badge?: string;
  title?: string;
  body?: string;
  icon?: string;
  tone?: string;
  image_url?: string;
  span?: number;
};

export type HistoryBentoSectionProps = {
  eyebrow?: string;
  eyebrow_icon?: string;
  title?: string;
  subtitle?: string;
  anchor_id?: string;
  items?: HistoryBentoItemInput[];
};

const DEFAULT_CARDS: HistoryCard[] = [
  {
    year: "1959",
    eraPill: "Founding",
    eraPillIcon: "fa-church",
    title: "Creation of Caritas Rwanda",
    body: "<strong>Secours Catholique Rwandais</strong> established by the Catholic Bishops of Rwanda — a Gospel-rooted response to humanitarian hardship and the call to serve the poor without discrimination.",
    imageUrl: "/img/bg_3.webp",
    variant: "crimson",
    span: 2,
  },
  {
    year: "1960",
    eraPill: "Founding",
    eraPillIcon: "fa-gavel",
    title: "Legal Registration",
    body: "Officially registered as a <strong>non-profit organization</strong> by Prime Minister's Order No. 488/08 — formal legal standing to operate nationally.",
    imageUrl: "https://caritasrwanda.org/wp-content/uploads/2026/03/162A8733-scaled.jpg",
    variant: "light",
    span: 1,
  },
  {
    year: "1963",
    eraPill: "Founding",
    eraPillIcon: "fa-pen-nib",
    title: "Name Change",
    body: "Renamed to <strong>Caritas Rwanda</strong> by Prime Minister's Order No. 75/08 — aligning with the global Caritas confederation identity.",
    imageUrl: "/img/bg_1.webp",
    variant: "light",
    span: 1,
  },
  {
    year: "1965",
    eraPill: "Global",
    eraPillIcon: "fa-globe",
    title: "International Membership",
    body: "Became a member of <strong>Caritas Internationalis</strong> — a confederation of 162 National Caritas across the world — expanding our reach through global solidarity and partnership.",
    imageUrl: "https://caritasrwanda.org/wp-content/uploads/2025/03/162A2264-1-scaled.jpg",
    variant: "navy",
    span: 2,
  },
  {
    year: "1994",
    eraPill: "Recovery",
    eraPillIcon: "fa-hands-holding-circle",
    title: "Post-Genocide Expansion",
    body: "Following the Genocide against the Tutsi, Caritas Rwanda expanded to include <strong>Health, Development, and Finance & Administration</strong> departments to meet Rwanda's vast recovery needs.",
    imageUrl: "https://caritasrwanda.org/wp-content/uploads/2024/06/162A4432-scaled.jpg",
    variant: "navy",
    span: 2,
  },
  {
    year: "2012",
    eraPill: "Modern Era",
    eraPillIcon: "fa-building-columns",
    title: "National NGO Status",
    body: "Registered as a <strong>National Non-Governmental Organisation</strong> under Law No. 04/2012 — an independent humanitarian mandate for the future.",
    imageUrl: "https://caritasrwanda.org/wp-content/uploads/2026/03/162A7732-scaled.jpg",
    variant: "light",
    span: 1,
  },
  {
    year: "2025",
    eraPill: "Jubilee",
    eraPillIcon: "fa-trophy",
    title: "125th Jubilee of Evangelization",
    body: "Celebrating <strong>125 years of evangelization</strong> in Rwanda and 66 years of Caritas service — a milestone of faith, perseverance, and nationwide impact.",
    imageUrl: "https://caritasrwanda.org/wp-content/uploads/2024/09/Youth-Forum-scaled.jpg",
    variant: "gold",
    span: 3,
  },
];

const TONE_CYCLE: HistoryCard["variant"][] = ["crimson", "light", "navy", "gold"];
const FALLBACK_IMAGES = [
  "/img/bg_3.webp",
  "/img/bg_1.webp",
  "/img/slide1.webp",
  "/img/slide4.webp",
];

function markdownLiteToHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function normalizeIcon(raw?: string): string | undefined {
  const t = (raw || "").trim();
  if (!t) return undefined;
  if (t.startsWith("fa-")) return t.replace(/^fa-solid\s+/i, "");
  return `fa-${t.replace(/^fa-?/i, "")}`;
}

function mapTone(tone: string | undefined, index: number): HistoryCard["variant"] {
  const t = (tone || "").trim().toLowerCase();
  if (t === "crimson" || t === "navy" || t === "light" || t === "gold") return t;
  if (t === "dark" || t === "blue") return "navy";
  if (t === "red" || t === "rose" || t === "accent") return "crimson";
  if (t === "warm" || t === "amber") return "gold";
  if (t === "neutral" || t === "white") return "light";
  return TONE_CYCLE[index % TONE_CYCLE.length];
}

function mapSpan(span: number | undefined, index: number, total: number): 1 | 2 | 3 {
  if (span === 1 || span === 2 || span === 3) return span;
  if (total <= 3) return index === 0 ? 2 : 1;
  if (index === total - 1) return 3;
  return index % 3 === 0 ? 2 : 1;
}

function mapCmsItems(items: HistoryBentoItemInput[]): HistoryCard[] {
  return items.flatMap((item, index) => {
    const year = String(item.year || "").trim();
    const title = String(item.title || "").trim();
    if (!year && !title) return [];
    const bodyRaw = String(item.body || "").trim();
    const card: HistoryCard = {
      year: year || "—",
      eraPill: String(item.badge || "").trim() || "Milestone",
      eraPillIcon: normalizeIcon(item.icon),
      title: title || year,
      body: bodyRaw ? markdownLiteToHtml(bodyRaw) : "",
      imageUrl:
        String(item.image_url || "").trim() ||
        FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
      variant: mapTone(item.tone, index),
      span: mapSpan(typeof item.span === "number" ? item.span : undefined, index, items.length),
    };
    return [card];
  });
}

export default function HistoryBentoSection(props: HistoryBentoSectionProps = {}) {
  const eyebrow = (props.eyebrow || "Our History").trim() || "Our History";
  const eyebrowIcon = normalizeIcon(props.eyebrow_icon) || "fa-clock-rotate-left";
  const title =
    (props.title || "Six Decades of Faith & Service").trim() ||
    "Six Decades of Faith & Service";
  const subtitle =
    (props.subtitle || "").trim() ||
    "From a small charity established by Catholic Bishops to a nationwide humanitarian network — our journey spans over 66 years of unwavering service to the most vulnerable Rwandans.";
  const anchor = (props.anchor_id || "history").trim() || "history";

  const cards =
    Array.isArray(props.items) && props.items.length > 0
      ? mapCmsItems(props.items)
      : DEFAULT_CARDS;

  return (
    <section className="about-history-section" id={anchor}>
      <div className="container">
        <div className="head-center">
          <div className="sub-section-label">
            <i className={`fa-solid ${eyebrowIcon}`} aria-hidden /> {eyebrow}
          </div>
          <h2 className="sub-section-title">{title}</h2>
          {subtitle ? <p className="sub-section-subtitle">{subtitle}</p> : null}
        </div>

        <div className="about-hist-bento">
          {cards.map((card, i) => (
            <div
              key={`${card.year}-${card.title}-${i}`}
              className={`about-hist-card about-hist-card--${card.variant}${card.span && card.span > 1 ? ` about-hist-span${card.span}` : ""}`}
              style={{ backgroundImage: `url(${card.imageUrl})` }}
            >
              <div className="about-hist-yr-bg">{card.year}</div>
              {card.eraPillIcon ? (
                <div className="about-hist-icon">
                  <i className={`fa-solid ${card.eraPillIcon}`} aria-hidden />
                </div>
              ) : null}
              <div className="about-hist-meta">
                <span className="about-hist-era-pill">{card.eraPill}</span>
                <span className="about-hist-year-tag">{card.year}</span>
              </div>
              <div className="about-hist-title">{card.title}</div>
              {card.body ? (
                <div
                  className="about-hist-body"
                  dangerouslySetInnerHTML={{ __html: card.body }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
