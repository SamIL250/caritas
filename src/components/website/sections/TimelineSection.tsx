import { faSolidIconClass } from "@/lib/fontawesome";
import { formatInlineBold } from "@/lib/text-format";

export type TimelineCardTone = "accent" | "navy" | "neutral";

export type TimelineRow = {
  year: string;
  title: string;
  body: string;
  tone?: TimelineCardTone;
  /** Short label shown before the year in the pill, e.g. "Founding" → "FOUNDING · 1959" */
  badge?: string;
  /** Icon: `fa-seedling`, `clock-rotate-left`, etc. */
  icon?: string;
};

type Props = {
  eyebrow?: string;
  eyebrow_icon?: string;
  title?: string;
  subtitle?: string;
  anchor_id?: string;
  items?: TimelineRow[];
};

/** Matches reference mosaic rhythm: accent highlights + navy milestone + neutral detail cards */
const DEFAULT_TONE_CYCLE: TimelineCardTone[] = [
  "accent",
  "neutral",
  "neutral",
  "navy",
  "accent",
  "neutral",
  "accent",
];

const DEFAULT_ICON_CYCLE = [
  "fa-seedling",
  "fa-file-signature",
  "fa-pen-to-square",
  "fa-globe",
  "fa-hand-holding-heart",
  "fa-building-columns",
  "fa-calendar-check",
];

function normalizeTone(raw: unknown, index: number): TimelineCardTone {
  const v = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (v === "accent" || v === "navy" || v === "neutral") return v;
  return DEFAULT_TONE_CYCLE[index % DEFAULT_TONE_CYCLE.length];
}

function normalizeIcon(raw: unknown, index: number): string | undefined {
  const s = typeof raw === "string" ? raw.trim() : "";
  const pick = s || DEFAULT_ICON_CYCLE[index % DEFAULT_ICON_CYCLE.length];
  return faSolidIconClass(pick);
}

export default function TimelineSection({
  eyebrow,
  eyebrow_icon = "fa-clock-rotate-left",
  title,
  subtitle,
  anchor_id = "history",
  items = [],
}: Props) {
  if (!items.length) return null;
  const eyebrowIc = faSolidIconClass(eyebrow_icon);

  return (
    <section className="section-warm history-section" id={anchor_id || undefined}>
      <div className="container">
        <div className="head-center">
          {eyebrow ? (
            <div className="sub-section-label">
              {eyebrowIc ? <i className={eyebrowIc} aria-hidden /> : null}{" "}
              {eyebrow}
            </div>
          ) : null}
          {title ? (
            <h2 className="sub-section-title">{title}</h2>
          ) : null}
          {subtitle ? <p className="sub-section-subtitle">{subtitle}</p> : null}
        </div>

        <div className="history-mosaic">
          {items.map((row, idx) => {
            const tone = normalizeTone(row.tone, idx);
            const iconClass = normalizeIcon(row.icon, idx);
            const badgeTrim = typeof row.badge === "string" ? row.badge.trim() : "";
            const badgeText = badgeTrim
              ? `${badgeTrim.replace(/\s+/g, " ")} · ${row.year}`
              : row.year;

            return (
              <article
                className={`hm-card hm-card--${tone}`}
                key={`${row.year}-${idx}`}
              >
                <span className="hm-watermark" aria-hidden>
                  {row.year}
                </span>
                <div className="hm-card-head">
                  <div className="hm-icon-wrap" aria-hidden>
                    {iconClass ? <i className={iconClass} /> : null}
                  </div>
                  <span className="hm-badge">{badgeText}</span>
                </div>
                <h3 className="hm-title">{row.title}</h3>
                <p className="hm-body">{formatInlineBold(row.body)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
