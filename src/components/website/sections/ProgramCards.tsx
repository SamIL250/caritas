"use client";

import React, { useId, useState } from "react";
import Link from "next/link";

export const PROGRAM_TAB_KEYS = ["social", "health", "dev", "admin"] as const;
export type ProgramTabKey = (typeof PROGRAM_TAB_KEYS)[number];

export interface ProgramItem {
  title: string;
  description: string;
  icon: string;
  link_url: string;
  image_url: string;
  /** Label shown on tab; use `\n` for a line break (e.g. Social\\nWelfare). */
  tab_label?: string;
  bullets?: string[];
}

function iconClasses(icon: string): string {
  const t = (icon || "fa-solid fa-seedling").trim();
  if (/\bfa-(solid|regular|brands)\b/.test(t)) return t;
  const bare = t.replace(/^fa-?/i, "");
  return `fa-solid fa-${bare.replace(/^fa-?/i, "")}`;
}

/**
 * Pillar anchors on /programs (see ProgramsLibrary `id={cat.slug}`).
 * `/programs/[slug]` is reserved for individual program articles, not categories.
 */
export const PROGRAM_SLOT_LEARN_MORE_HREF: readonly string[] = [
  "/programs#social-welfare",
  "/programs#health",
  "/programs#development",
  "/programs#finance-administration",
];

/** Canonical slot order matches PROGRAM_TAB_KEYS: Welfare → Health → Dev → Admin. */
export const CANONICAL_PROGRAMS: ProgramItem[] = [
  {
    tab_label: "Social\nWelfare",
    title: "Social Welfare",
    description:
      "Community mobilization, support and advocacy for the most vulnerable people — providing safety nets, emergency assistance, and dignity-restoring support systems for Rwanda's most vulnerable families and communities.",
    bullets: [
      "Community support & social protection",
      "Emergency humanitarian response",
      "Social advocacy & inclusion programs",
    ],
    icon: "fa-solid fa-people-roof",
    link_url: PROGRAM_SLOT_LEARN_MORE_HREF[0],
    image_url: "/img/bg_1.png",
  },
  {
    tab_label: "Health",
    title: "Health",
    description:
      "Healthcare services, medical support, and health education for communities in need — improving maternal and child health outcomes, community nutrition, and healthcare access across all nine dioceses.",
    bullets: [
      "Maternal & child healthcare",
      "Community health outreach programs",
      "Nutrition, wellness & disease prevention",
    ],
    icon: "fa-solid fa-heart-pulse",
    link_url: PROGRAM_SLOT_LEARN_MORE_HREF[1],
    image_url: "/img/health.JPG",
  },
  {
    tab_label: "Development",
    title: "Development",
    description:
      "Sustainable development programs focused on education, agriculture, and economic empowerment — building long-term resilience through vocational training, microfinance, and community-led initiatives.",
    bullets: [
      "Vocational training & skills development",
      "Sustainable livelihoods & agriculture",
      "Microfinance & economic empowerment",
    ],
    icon: "fa-solid fa-seedling",
    link_url: PROGRAM_SLOT_LEARN_MORE_HREF[2],
    image_url: "/img/bg_2.png",
  },
  {
    tab_label: "Admin &\nFinance",
    title: "Administration & Finance",
    description:
      "Organizational management, financial oversight, and operational excellence — ensuring transparent governance, sound financial stewardship, and accountability that sustains Caritas Rwanda's mission across Rwanda.",
    bullets: [
      "Transparent governance & oversight",
      "Financial stewardship & reporting",
      "Operational accountability & compliance",
    ],
    icon: "fa-solid fa-building-columns",
    link_url: PROGRAM_SLOT_LEARN_MORE_HREF[3],
    image_url: "/img/slide5.jpg",
  },
];

function mergeSlot(base: ProgramItem, item: ProgramItem): ProgramItem {
  return {
    ...base,
    ...item,
    title: item.title?.trim() || base.title,
    tab_label: item.tab_label?.trim() || base.tab_label,
    bullets:
      item.bullets && item.bullets.length > 0 ? item.bullets : base.bullets ?? [],
  };
}

/** Map CMS-provided rows into the four canonical slots (by title cues; fallback preserves index alignment). */
export function normalizePrograms(raw?: ProgramItem[]): ProgramItem[] {
  const out = CANONICAL_PROGRAMS.map((c) => ({ ...c }));

  function slotHint(title: string): number | null {
    const t = (title || "").toLowerCase();
    if (/social\s*welfare|^welfare/i.test(t) || /\bsocial\b/.test(t)) return 0;
    if (/\bhealth\b|^maternal/i.test(t) && !/mental\s*health\b/.test(t)) return 1;
    if (/\bdevelopment\b/i.test(t) || /\bdevelop\b/.test(t)) return 2;
    if (
      /\badministration\b|\badmin\b.*\bfinance\b|finance\b.*\badmin\b|administration\s*&\s*finance/i.test(t)
    )
      return 3;
    return null;
  }

  const taken = new Set<number>();
  const unmatched: ProgramItem[] = [];

  raw?.forEach((item) => {
    const s = slotHint(item.title ?? "");
    if (s !== null && !taken.has(s)) {
      taken.add(s);
      out[s] = mergeSlot(out[s], item);
    } else {
      unmatched.push(item);
    }
  });

  let next = 0;
  unmatched.forEach((item) => {
    while (taken.has(next) && next < 4) next++;
    if (next < 4) {
      taken.add(next);
      out[next] = mergeSlot(out[next], item);
      next++;
    }
  });

  return out.map((item, idx) => ({
    ...item,
    link_url: PROGRAM_SLOT_LEARN_MORE_HREF[idx] ?? item.link_url,
  }));
}

function TabLabelLines({ label }: { label: string }) {
  const lines = label.split(/\n/).map((l) => l.trim());
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={`${i}-${line}`}>
          {i > 0 ? <br /> : null}
          {line}
        </React.Fragment>
      ))}
    </>
  );
}

export interface ProgramCardsProps {
  eyebrow?: string;
  heading?: string;
  subtitle?: string;
  programs?: ProgramItem[];
}

export default function ProgramCards({
  eyebrow = "What We Do",
  heading = "Our Program",
  subtitle = "Making a lasting difference through targeted, community-focused initiatives across Rwanda",
  programs: programsProp,
}: ProgramCardsProps) {
  const slots = normalizePrograms(programsProp);
  const [activeIdx, setActiveIdx] = useState(0);
  const baseId = useId();
  const tabIdPrefix = `${baseId}-tab`;
  const panelId = `${baseId}-panel`;

  const active = slots[Math.min(activeIdx, slots.length - 1)];
  const activeKey = PROGRAM_TAB_KEYS[Math.min(activeIdx, PROGRAM_TAB_KEYS.length - 1)];
  const href = active?.link_url?.trim() || "#";
  const isHash = href.startsWith("#");

  function cycle(d: number) {
    setActiveIdx((i) => {
      let n = i + d;
      if (n < 0) n = slots.length - 1;
      if (n >= slots.length) n = 0;
      return n;
    });
  }

  const bullets = active.bullets?.length ? active.bullets : [];

  const learnInner = (
    <>
      Learn more <i className="fa-solid fa-arrow-right" aria-hidden />
    </>
  );

  return (
    <section className="cr-prog-tabs" id="programs" aria-labelledby="programs-heading">
      <div className="prog-tabs-header">
        <div className="prog-tabs-eyebrow">
          <i className="fa-solid fa-grid-2" aria-hidden /> {eyebrow}
        </div>
        <h2 className="prog-tabs-title" id="programs-heading">
          {heading}
        </h2>
        {subtitle ? <p className="prog-tabs-subtitle">{subtitle}</p> : null}
      </div>

      <div className="prog-tabs-body">
        <div className="prog-image-col" aria-hidden>
          {slots.map((p, idx) => (
            <img
              key={PROGRAM_TAB_KEYS[idx]}
              src={p.image_url}
              alt=""
              className={`prog-img${idx === activeIdx ? " active" : ""}`}
              width={1200}
              height={900}
              decoding="async"
            />
          ))}
        </div>

        <div className="prog-content-col">
          <div
            className="prog-nav"
            role="tablist"
            aria-label="Program categories"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                cycle(1);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                cycle(-1);
              } else if (e.key === "Home") {
                e.preventDefault();
                setActiveIdx(0);
              } else if (e.key === "End") {
                e.preventDefault();
                setActiveIdx(slots.length - 1);
              }
            }}
          >
            {slots.map((p, idx) => {
              const tabKey = PROGRAM_TAB_KEYS[idx];
              const chip = (p.tab_label || p.title).trim();
              const selected = idx === activeIdx;
              return (
                <button
                  key={tabKey}
                  type="button"
                  role="tab"
                  id={`${tabIdPrefix}-${idx}`}
                  data-tab={tabKey}
                  aria-selected={selected}
                  aria-controls={panelId}
                  tabIndex={selected ? 0 : -1}
                  className={`prog-tab-btn${selected ? " active" : ""}`}
                  onClick={() => setActiveIdx(idx)}
                >
                  <div className="prog-tab-icon">
                    <i className={iconClasses(p.icon)} aria-hidden />
                  </div>
                  <span className="prog-tab-label">
                    <TabLabelLines label={chip} />
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="prog-content-area"
            id={panelId}
            role="tabpanel"
            data-panel={activeKey}
            aria-labelledby={`${tabIdPrefix}-${activeIdx}`}
          >
            <div key={activeKey} className="prog-content-inner anim-in">
              <span className="prog-tag">
                <i className={iconClasses(active.icon)} aria-hidden />
                &nbsp; Program Area
              </span>
              <h3 className="prog-heading">{active.title}</h3>
              <p className="prog-desc">{active.description}</p>
              <ul className="prog-bullets">
                {bullets.map((b) => (
                  <li key={b}>
                    <i className="fa-solid fa-circle-check" aria-hidden /> {b}
                  </li>
                ))}
              </ul>
              {isHash ? (
                <a href={href} className="prog-learn-btn">
                  {learnInner}
                </a>
              ) : (
                <Link href={href} className="prog-learn-btn">
                  {learnInner}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
