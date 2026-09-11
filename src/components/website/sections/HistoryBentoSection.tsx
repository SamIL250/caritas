import React from "react";

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

export type HistoryYearOrder = "past_to_present" | "present_to_past";

export type HistoryBentoSectionProps = {
  eyebrow?: string;
  eyebrow_icon?: string;
  title?: string;
  subtitle?: string;
  anchor_id?: string;
  background_image?: string;
  /** Display order of milestones by year. */
  year_order?: HistoryYearOrder | string;
  items?: HistoryBentoItemInput[];
};

type TimelineCard = {
  year: string;
  title: string;
  body: string;
};

const DEFAULT_ITEMS: TimelineCard[] = [
  {
    year: "1959",
    title: "Establishment",
    body: 'Established by the Catholic Bishops of Rwanda as "Secours Catholique Rwandais"',
  },
  {
    year: "1962",
    title: "Legal Registration",
    body: "Legally Registered as Non-For-Profit Organization, by the Prime Minister's Order No. 488/08, with registration No.75/08",
  },
  {
    year: "1963",
    title: "Name Transition",
    body: 'Transition from "Secours Catholique Rwandais" into Caritas Rwanda',
  },
  {
    year: "1965",
    title: "International Membership",
    body: "Member of Caritas Internationalis Confederation now 162 members",
  },
  {
    year: "1994+",
    title: "Post-Genocide Expansion",
    body: "Suffered Genocide against Tutsi, and extended services to Health and Development interventions",
  },
  {
    year: "2012",
    title: "NGO Status",
    body: "Becomes Non-Governmental Organization (NGO), in compliance with Law No. 04/2012",
  },
];

/** Supports **bold** and *italic* (or _italic_). Bold is applied first so it is not treated as italic. */
function markdownLiteToHtml(raw: string): string {
  let s = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const boldChunks: string[] = [];
  s = s.replace(/\*\*(.+?)\*\*/g, (_, inner: string) => {
    const i = boldChunks.length;
    boldChunks.push(inner);
    return `\u0000B${i}\u0000`;
  });

  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(/_([^_\n]+?)_/g, "<em>$1</em>");

  s = s.replace(/\u0000B(\d+)\u0000/g, (_, i: string) => {
    return `<strong>${boldChunks[Number(i)] ?? ""}</strong>`;
  });

  return s;
}

function parseYearSortValue(year: string): number {
  const match = year.match(/-?\d+/);
  if (!match) return Number.POSITIVE_INFINITY;
  const n = Number.parseInt(match[0], 10);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

function normalizeYearOrder(raw: unknown): HistoryYearOrder {
  const v = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_");
  if (
    v === "present_to_past" ||
    v === "desc" ||
    v === "newest_first" ||
    v === "reverse"
  ) {
    return "present_to_past";
  }
  return "past_to_present";
}

function sortTimelineCards(
  cards: TimelineCard[],
  order: HistoryYearOrder,
): TimelineCard[] {
  const sorted = [...cards].sort((a, b) => {
    const ya = parseYearSortValue(a.year);
    const yb = parseYearSortValue(b.year);
    if (ya !== yb) return ya - yb;
    return a.year.localeCompare(b.year);
  });
  return order === "present_to_past" ? sorted.reverse() : sorted;
}

function normalizeIcon(raw?: string): string | undefined {
  const t = (raw || "").trim();
  if (!t) return undefined;
  if (t.startsWith("fa-")) return t.replace(/^fa-solid\s+/i, "");
  return `fa-${t.replace(/^fa-?/i, "")}`;
}

function mapCmsItems(items: HistoryBentoItemInput[]): TimelineCard[] {
  return items.flatMap((item) => {
    const year = String(item.year || "").trim();
    const title = String(item.title || "").trim();
    const bodyRaw = String(item.body || "").trim();
    if (!year && !title && !bodyRaw) return [];
    return [
      {
        year: year || "—",
        title: title || String(item.badge || "").trim(),
        body: bodyRaw ? markdownLiteToHtml(bodyRaw) : "",
      },
    ];
  });
}

export default function HistoryBentoSection(props: HistoryBentoSectionProps = {}) {
  const eyebrow = (props.eyebrow || "Our History").trim() || "Our History";
  const eyebrowIcon = normalizeIcon(props.eyebrow_icon) || "fa-clock-rotate-left";
  const title =
    (props.title || "Seven Decades of Faith & Service").trim() ||
    "Seven Decades of Faith & Service";
  const subtitle =
    (props.subtitle || "").trim() ||
    "From a small charity established by Catholic Bishops to a nationwide humanitarian network — our journey spans over 66 years of unwavering service to the most vulnerable Rwandans.";
  const anchor = (props.anchor_id || "history").trim() || "history";
  const backgroundImage = String(props.background_image || "").trim();
  const yearOrder = normalizeYearOrder(props.year_order);

  const cards = sortTimelineCards(
    Array.isArray(props.items) && props.items.length > 0
      ? mapCmsItems(props.items)
      : DEFAULT_ITEMS,
    yearOrder,
  );

  if (!cards.length) return null;

  return (
    <section
      className={`about-history-section${backgroundImage ? " about-history-section--has-bg" : ""}`}
      id={anchor}
      style={
        backgroundImage
          ? ({ "--about-history-bg": `url(${backgroundImage})` } as React.CSSProperties)
          : undefined
      }
    >
      <div className="about-history-intro">
        <div className="about-history-head">
          <div className="sub-section-label">
            <i className={`fa-solid ${eyebrowIcon}`} aria-hidden /> {eyebrow}
          </div>
          <h2 className="sub-section-title">{title}</h2>
          {subtitle ? <p className="sub-section-subtitle">{subtitle}</p> : null}
        </div>
      </div>

      <div className="about-history-stage">
        <div className="about-history-bg" aria-hidden />
        <div className="container about-history-inner">
          <div className="about-hist-panel">
            <div
              className="about-hist-timeline-scroll"
              tabIndex={0}
              aria-label="Our history timeline"
              data-lenis-prevent
              data-lenis-prevent-wheel
            >
              <ol className="about-hist-timeline">
                {cards.map((card, i) => {
                  const side = i % 2 === 0 ? "left" : "right";
                  const copy = (
                    <div className="about-hist-copy">
                      {card.title ? (
                        <h3 className="about-hist-title">{card.title}</h3>
                      ) : null}
                      {card.body ? (
                        <div
                          className="about-hist-body"
                          dangerouslySetInnerHTML={{ __html: card.body }}
                        />
                      ) : null}
                    </div>
                  );
                  const year = (
                    <span className="about-hist-year-node">{card.year}</span>
                  );
                  const connector = (
                    <span className="about-hist-connector" aria-hidden />
                  );

                  return (
                    <li
                      key={`${card.year}-${i}`}
                      className={`about-hist-row about-hist-row--${side}`}
                    >
                      {side === "left" ? (
                        <>
                          <div className="about-hist-side about-hist-side--main">
                            {copy}
                            {connector}
                          </div>
                          {year}
                          <div className="about-hist-side about-hist-side--empty" aria-hidden />
                        </>
                      ) : (
                        <>
                          <div className="about-hist-side about-hist-side--empty" aria-hidden />
                          {year}
                          <div className="about-hist-side about-hist-side--main">
                            {connector}
                            {copy}
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
