"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { faSolidIconClass } from "@/lib/fontawesome";

export type LeaderMember = {
  era_gap?: boolean;
  era_label?: string;
  year?: string;
  name?: string;
  role?: string;
  period?: string;
  duration?: number;
  featured?: boolean;
  photo_url?: string;
};

export type LeaderGroup = {
  subgroup_label?: string;
  subgroup_icon?: string;
  era_span?: string;
  members?: LeaderMember[];
};

type Props = {
  eyebrow?: string;
  eyebrow_icon?: string;
  title?: string;
  subtitle?: string;
  anchor_id?: string;
  watermark_text?: string;
  groups?: LeaderGroup[];
};

const CHAIRPERSON_CATALOG: LeaderMember[] = [
  {
    year: "1959",
    name: "Archbishop Perraudin",
    role: "Founding Chairperson",
    period: "13 yrs",
    duration: 13,
    photo_url: "img/Chairperson/perraudin.jpg",
  },
  {
    year: "1972",
    name: "H.E. Mgr. Jean Baptiste Gahamanyi",
    role: "Chairperson",
    period: "25 yrs",
    duration: 25,
    photo_url: "img/Chairperson/gahamanyi.png",
  },
  {
    year: "1997",
    name: "H.E. Mgr. Thaddée Ntihinyurwa",
    role: "Chairperson",
    period: "25 yrs",
    duration: 25,
  },
  {
    year: "2022",
    name: "H.E. Mgr. Anaclet Mwumvaneza",
    role: "Chairperson — Nyundo Diocese",
    period: "Present",
    duration: 4,
    featured: true,
    photo_url: "img/Chairperson/anaclet.jpg",
  },
];

const SECRETARY_CATALOG: LeaderMember[] = [
  {
    year: "1961",
    name: "Father Arthur Dejemeppe",
    role: "Secretary General",
    period: "11 yrs",
    duration: 11,
    photo_url: "img/Secretary Generals/Arthur Dejemeppe.jpg",
  },
  {
    year: "1972",
    name: "Father Roger Pien",
    role: "Secretary General",
    period: "1 yr",
    duration: 1,
    photo_url: "img/Secretary Generals/Roger Pien.jpg",
  },
  {
    year: "1973",
    name: "Father Cyriaque Munyansanga",
    role: "Secretary General",
    period: "4 yrs",
    duration: 4,
    photo_url: "img/Secretary Generals/Cyriaque Munyansanga.png",
  },
  {
    year: "1977",
    name: "Father Carles Maria Giol",
    role: "Secretary General",
    period: "1 yr",
    duration: 1,
    photo_url: "img/Secretary Generals/Carles Maria Giol.png",
  },
  {
    year: "1978",
    name: "Father Michel Descombes",
    role: "Secretary General",
    period: "17 yrs",
    duration: 17,
    photo_url: "img/Secretary Generals/Descombers.jpg",
  },
  {
    year: "1995",
    name: "Father Callixte Twagirayezu",
    role: "Secretary General",
    period: "1 yr",
    duration: 1,
    photo_url: "img/Secretary Generals/Callixte Twagirayezu.jpg",
  },
  {
    year: "1996",
    name: "Msgr. Oreste Incimatata",
    role: "Secretary General",
    period: "17 yrs",
    duration: 17,
    photo_url: "img/Secretary Generals/Mgr. ORESTE INCIMATATA.jpg",
  },
  {
    year: "2013",
    name: "H.E. Mgr. Anaclet Mwumvaneza",
    role: "Secretary General",
    period: "3 yrs",
    duration: 3,
    photo_url: "img/Secretary Generals/anaclet.jpg",
  },
  {
    year: "2016",
    name: "H.E. Mgr. JMV Twagirayezu",
    role: "Secretary General",
    period: "7 yrs",
    duration: 7,
    photo_url: "img/Secretary Generals/JMV Twagirayezu.jpg",
  },
  {
    year: "2023",
    name: "Father Oscar Kagimbura",
    role: "Secretary General",
    period: "Present",
    duration: 3,
    featured: true,
    photo_url: "img/Secretary Generals/Oscar Kagimbura.png",
  },
];

const FULL_CATALOG = [...CHAIRPERSON_CATALOG, ...SECRETARY_CATALOG];

function encodePublicSrc(url: string) {
  const t = url.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  const path = t.startsWith("/") ? t : `/${t}`;
  return encodeURI(path);
}

function normalizeLeaderName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(
      /\b(h|he|his|excellency|mgr|msgr|monsignor|father|fr|rev|reverend|archbishop|bishop)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function givenNamesOverlap(a: string[], b: string[]) {
  if (!a.length || !b.length) return true;
  for (const token of a) {
    for (const other of b) {
      if (token === other || token.startsWith(other) || other.startsWith(token)) {
        return true;
      }
    }
  }
  const initialsA = a.map((t) => t[0]).join("");
  const initialsB = b.map((t) => t[0]).join("");
  if (a.length === 1 && a[0].length <= 4 && initialsB === a[0]) return true;
  if (b.length === 1 && b[0].length <= 4 && initialsA === b[0]) return true;
  return false;
}

function findCatalogMatch(
  member: LeaderMember,
  catalog: LeaderMember[],
): LeaderMember | undefined {
  const name = member.name?.trim();
  if (!name) return undefined;

  const year = String(member.year ?? "").trim();
  const normalized = normalizeLeaderName(name);
  const tokens = normalized.split(" ").filter(Boolean);
  const surname = tokens[tokens.length - 1];
  const given = tokens.slice(0, -1);

  const score = (candidate: LeaderMember) => {
    const candidateName = candidate.name?.trim() ?? "";
    const candidateNorm = normalizeLeaderName(candidateName);
    const candidateTokens = candidateNorm.split(" ").filter(Boolean);
    const candidateSurname = candidateTokens[candidateTokens.length - 1];
    let points = 0;

    if (candidateName === name) points += 8;
    if (candidateNorm === normalized) points += 6;
    if (surname && candidateSurname === surname) points += 3;
    if (
      surname &&
      candidateSurname === surname &&
      givenNamesOverlap(given, candidateTokens.slice(0, -1))
    ) {
      points += 4;
    }
    if (year && String(candidate.year ?? "") === year) points += 5;
    return points;
  };

  let best: LeaderMember | undefined;
  let bestScore = 0;
  for (const candidate of catalog) {
    const points = score(candidate);
    if (points > bestScore) {
      best = candidate;
      bestScore = points;
    }
  }

  return bestScore >= 3 ? best : undefined;
}

function catalogForGroup(label?: string) {
  const text = (label || "").toLowerCase();
  if (text.includes("secretary")) return SECRETARY_CATALOG;
  if (text.includes("chair")) return CHAIRPERSON_CATALOG;
  return FULL_CATALOG;
}

function shortPeriodLabel(
  period: string | undefined,
  duration: number | undefined,
  featured: boolean | undefined,
  startYear: string | undefined,
  endYear: string | undefined,
) {
  const raw = period?.trim() ?? "";
  if (raw) {
    const afterDot = raw.split("·").pop()?.trim() ?? raw;
    if (/present/i.test(afterDot) && !/\d+\s*yrs?/i.test(afterDot)) {
      return "Present";
    }
    const yrs = afterDot.match(/(\d+)\s*yrs?/i);
    if (yrs) {
      const n = Number(yrs[1]);
      return n === 1 ? "1 yr" : `${n} yrs`;
    }
    if (/^present$/i.test(afterDot)) return "Present";
    return afterDot;
  }

  if (featured) return "Present";

  if (typeof duration === "number" && duration > 0) {
    return duration === 1 ? "1 yr" : `${duration} yrs`;
  }

  const start = Number.parseInt(String(startYear ?? ""), 10);
  const end = Number.parseInt(String(endYear ?? ""), 10);
  if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
    const yrs = end - start;
    return yrs === 1 ? "1 yr" : `${yrs} yrs`;
  }

  return "";
}

function enrichMembers(
  members: LeaderMember[],
  catalog: LeaderMember[] = FULL_CATALOG,
): LeaderMember[] {
  return members.map((member, index) => {
    const match = findCatalogMatch(member, catalog);
    const next = members[index + 1];
    const year = String(member.year ?? match?.year ?? "").trim();
    const nextYear = String(next?.year ?? "").trim();
    const featured = Boolean(member.featured ?? match?.featured);
    const duration =
      (typeof member.duration === "number" && member.duration > 0
        ? member.duration
        : undefined) ??
      match?.duration ??
      (() => {
        const start = Number.parseInt(year, 10);
        const end = Number.parseInt(nextYear, 10);
        if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
          return end - start;
        }
        return undefined;
      })();

    const period = shortPeriodLabel(
      member.period || match?.period,
      duration,
      featured,
      year,
      nextYear || (featured ? undefined : undefined),
    );

    return {
      ...member,
      year: year || member.year,
      period: period || undefined,
      duration,
      featured,
      photo_url: member.photo_url || match?.photo_url,
      role: member.role || match?.role,
    };
  });
}

function LeaderNode({
  year,
  name,
  role,
  period,
  duration,
  featured,
  photo_url,
  index,
  onMouseEnter,
  onMouseLeave,
}: {
  year: string;
  name: string;
  role: string;
  period?: string;
  duration?: number;
  featured?: boolean;
  photo_url?: string;
  index: number;
  onMouseEnter?: (
    e: React.MouseEvent<HTMLDivElement>,
    src: string,
    name: string,
    role: string,
  ) => void;
  onMouseLeave?: () => void;
}) {
  const src = photo_url?.trim() ? encodePublicSrc(photo_url.trim()) : "";
  const isAbove = index % 2 === 0;
  const durAttr = duration && duration > 0 ? duration : 10;

  return (
    <div
      className={`ldr-node ${isAbove ? "ldr-node--above" : "ldr-node--below"} ${featured ? "ldr-node--current" : ""}`}
      style={{ "--dur": durAttr } as React.CSSProperties}
      role="listitem"
      onMouseEnter={(e) => onMouseEnter?.(e, src, name, role)}
      onMouseLeave={onMouseLeave}
    >
      <div className="ldr-card">
        <div className="ldr-photo">
          {src ? (
            <img
              src={src}
              alt={name.trim() ? name : role.trim() ? role : "Leader portrait"}
              loading="lazy"
            />
          ) : (
            <div className="ldr-photo-placeholder">
              <i className="fa-solid fa-user-tie" aria-hidden />
            </div>
          )}
        </div>
        <div className="ldr-card-text">
          <div className="ldr-name">{name}</div>
          {role && role !== "Chairperson" && role !== "Secretary General" ? (
            <div className="ldr-role">{role}</div>
          ) : null}
          {period ? <div className="ldr-period">{period}</div> : null}
          {featured ? <span className="ldr-current-badge">Current</span> : null}
        </div>
      </div>
      <div className="ldr-stem" aria-hidden />
      <div className="ldr-dot" aria-hidden />
      <div className="ldr-year-tag">{year}</div>
    </div>
  );
}

function LeaderScrollTimeline({
  timelineNodes,
  ariaLabel,
  onNodeEnter,
  onNodeLeave,
}: {
  timelineNodes: LeaderMember[];
  ariaLabel: string;
  onNodeEnter?: (
    e: React.MouseEvent<HTMLDivElement>,
    src: string,
    name: string,
    role: string,
  ) => void;
  onNodeLeave?: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);
  const reduceMotionRef = useRef(false);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    stopLoop();
    if (reduceMotionRef.current) return;

    const tick = () => {
      const el = scrollRef.current;
      if (!el || pausedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 4) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (el.scrollLeft >= maxScroll - 1) {
        el.scrollLeft = 0;
      } else {
        el.scrollLeft += 0.45;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [stopLoop]);

  const pauseAuto = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const resumeAuto = useCallback(
    (delayMs = 0) => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
      if (delayMs <= 0) {
        pausedRef.current = false;
        return;
      }
      resumeTimerRef.current = setTimeout(() => {
        pausedRef.current = false;
        resumeTimerRef.current = null;
      }, delayMs);
    },
    [],
  );

  const scrollBy = useCallback(
    (direction: "prev" | "next") => {
      const container = scrollRef.current;
      if (!container) return;
      pauseAuto();
      const distance = Math.max(container.clientWidth * 0.7, 220);
      container.scrollBy({
        left: direction === "next" ? distance : -distance,
        behavior: "smooth",
      });
      resumeAuto(3500);
    },
    [pauseAuto, resumeAuto],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = mq.matches;
    const onMotion = () => {
      reduceMotionRef.current = mq.matches;
      if (mq.matches) stopLoop();
      else startLoop();
    };
    mq.addEventListener?.("change", onMotion);

    startLoop();

    return () => {
      mq.removeEventListener?.("change", onMotion);
      stopLoop();
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [startLoop, stopLoop]);

  return (
    <div
      className="ldr-scroll-wrap"
      onMouseEnter={pauseAuto}
      onMouseLeave={() => resumeAuto(0)}
      onFocusCapture={pauseAuto}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          resumeAuto(600);
        }
      }}
    >
      <button
        className="ldr-arrow ldr-prev"
        aria-label="Previous"
        type="button"
        onClick={() => scrollBy("prev")}
      >
        <i className="fa-solid fa-chevron-left" aria-hidden />
      </button>
      <div
        className="ldr-scroll"
        ref={scrollRef}
        onPointerDown={pauseAuto}
        onWheel={pauseAuto}
        onTouchStart={pauseAuto}
      >
        <div className="ldr-timeline" role="list" aria-label={ariaLabel}>
          {timelineNodes.map((m, mi) => (
            <LeaderNode
              key={`${m.year}-${m.name}-${mi}`}
              index={mi}
              year={String(m.year ?? "")}
              name={String(m.name ?? "")}
              role={String(m.role ?? "")}
              period={m.period}
              duration={m.duration}
              featured={m.featured}
              photo_url={m.photo_url}
              onMouseEnter={onNodeEnter}
              onMouseLeave={onNodeLeave}
            />
          ))}
        </div>
      </div>
      <button
        className="ldr-arrow ldr-next"
        aria-label="Next"
        type="button"
        onClick={() => scrollBy("next")}
      >
        <i className="fa-solid fa-chevron-right" aria-hidden />
      </button>
    </div>
  );
}

export default function LeadershipGridSection({
  eyebrow,
  eyebrow_icon = "fa-scroll",
  title,
  subtitle,
  anchor_id = "leadership",
  watermark_text = "SINCE 1959",
  groups = [],
}: Props) {
  const wm =
    typeof watermark_text === "string" && watermark_text.trim() !== ""
      ? watermark_text.trim()
      : "SINCE 1959";

  const [popup, setPopup] = useState<{
    visible: boolean;
    x: number;
    y: number;
    flip: boolean;
    src: string;
    name: string;
    role: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    flip: false,
    src: "",
    name: "",
    role: "",
  });

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setPopup((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    src: string,
    name: string,
    role: string,
  ) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!src) return;

    const photoEl = e.currentTarget.querySelector(".ldr-photo") as HTMLElement | null;
    if (!photoEl) return;

    const rect = photoEl.getBoundingClientRect();
    const popWidth = 200;
    const popHeight = 305;
    const gap = 14;

    let left = rect.left + rect.width / 2 - popWidth / 2;
    let top = rect.top - popHeight - gap;
    let flip = false;

    if (left < 8) left = 8;
    if (left + popWidth > window.innerWidth - 8) left = window.innerWidth - popWidth - 8;

    if (top < 8) {
      top = rect.bottom + gap;
      flip = true;
    }

    setPopup({ visible: true, x: left, y: top, flip, src, name, role });
  };

  const handleMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => {
      setPopup((prev) => ({ ...prev, visible: false }));
    }, 120);
  };

  const fallbackGroups: LeaderGroup[] = [
    {
      subgroup_label: "Chairpersons",
      subgroup_icon: "fa-crown",
      era_span: "1959 — Present",
      members: CHAIRPERSON_CATALOG,
    },
    {
      subgroup_label: "Secretary Generals",
      subgroup_icon: "fa-person-chalkboard",
      era_span: "1961 — Present",
      members: SECRETARY_CATALOG,
    },
  ];

  const renderGroups = groups?.length ? groups : fallbackGroups;
  const eyebrowIc = faSolidIconClass(eyebrow_icon);
  const showIntro = Boolean(groups?.length);

  return (
    <section
      className="section-warm ldr-section"
      id={anchor_id || undefined}
      data-watermark={wm}
    >
      <div className="container">
        <div className="head-center">
          {showIntro && eyebrow ? (
            <div className="sub-section-label">
              {eyebrowIc ? <i className={eyebrowIc} aria-hidden /> : null} {eyebrow}
            </div>
          ) : null}
          {showIntro && title ? (
            <h2 className="sub-section-title">{title}</h2>
          ) : (
            <h2 className="sub-section-title">A Legacy of Faithful Service</h2>
          )}
          {showIntro && subtitle ? (
            <p className="sub-section-subtitle">{subtitle}</p>
          ) : null}
        </div>

        {renderGroups.map((group, gi) => {
          const entries = group.members || [];
          const timelineNodes = enrichMembers(
            entries.filter((m) => Boolean((m.year || m.name)?.trim())),
            catalogForGroup(group.subgroup_label),
          );
          if (!timelineNodes.length) return null;

          const subgroupIc = faSolidIconClass(group.subgroup_icon ?? "");

          return (
            <div className="ldr-era-block" key={gi}>
              <div className="ldr-era-header">
                <div className="ldr-era-title">
                  {subgroupIc ? <i className={subgroupIc} aria-hidden /> : null}{" "}
                  {group.subgroup_label ?? ""}
                </div>
                {group.era_span?.trim() ? (
                  <span className="ldr-era-span">{group.era_span.trim()}</span>
                ) : null}
              </div>
              <LeaderScrollTimeline
                timelineNodes={timelineNodes}
                ariaLabel={group.subgroup_label || "Leadership timeline"}
                onNodeEnter={handleMouseEnter}
                onNodeLeave={handleMouseLeave}
              />
            </div>
          );
        })}
      </div>
      {popup.visible && popup.src ? (
        <div
          id="ldrPopup"
          className="visible"
          style={{ left: popup.x, top: popup.y, position: "fixed" }}
          onMouseEnter={() => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="ldr-popup-inner">
            <div className="ldr-popup-img-wrap">
              <img src={popup.src} alt={popup.name} />
            </div>
            <div className="ldr-popup-info">
              <div className="ldr-popup-name">{popup.name}</div>
              <div className="ldr-popup-role">{popup.role}</div>
            </div>
          </div>
          <div
            className="ldr-popup-caret"
            style={{
              bottom: popup.flip ? "auto" : "-8px",
              top: popup.flip ? "-8px" : "auto",
              transform: popup.flip
                ? "translateX(-50%) rotate(225deg)"
                : "translateX(-50%) rotate(45deg)",
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
