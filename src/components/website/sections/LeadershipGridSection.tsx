"use client";

import React, { useRef, useState, useEffect } from "react";
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

function encodePublicSrc(url: string) {
  const t = url.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  const path = t.startsWith("/") ? t : `/${t}`;
  return encodeURI(path);
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
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>, src: string, name: string, role: string) => void;
  onMouseLeave?: () => void;
}) {
  const src = photo_url?.trim() ? encodePublicSrc(photo_url.trim()) : "";
  const isAbove = index % 2 === 0;
  const durAttr = duration ?? 10;

  return (
    <div
      className={`ldr-node ${isAbove ? "ldr-node--above" : "ldr-node--below"} ${featured ? "ldr-node--current" : ""}`}
      style={{ "--dur": durAttr } as React.CSSProperties}
      role="listitem"
      onMouseEnter={(e) => onMouseEnter && onMouseEnter(e, src, name, role)}
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
  group,
  timelineNodes,
  ariaLabel,
  onNodeEnter,
  onNodeLeave,
}: {
  group: LeaderGroup;
  timelineNodes: LeaderMember[];
  ariaLabel: string;
  onNodeEnter?: (e: React.MouseEvent<HTMLDivElement>, src: string, name: string, role: string) => void;
  onNodeLeave?: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: "prev" | "next") => {
    const container = scrollRef.current;
    if (!container) return;
    const distance = container.clientWidth * 0.7;
    container.scrollBy({ left: direction === "next" ? distance : -distance, behavior: "smooth" });
  };

  return (
    <div className="ldr-scroll-wrap">
      <button
        className="ldr-arrow ldr-prev"
        aria-label="Previous"
        type="button"
        onClick={() => scrollBy("prev")}
      >
        <i className="fa-solid fa-chevron-left" aria-hidden />
      </button>
      <div className="ldr-scroll" ref={scrollRef}>
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

  const chairScrollRef = useRef<HTMLDivElement>(null);
  const secScrollRef = useRef<HTMLDivElement>(null);

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
    x: 0, y: 0, flip: false,
    src: "", name: "", role: "",
  });

  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setPopup(prev => prev.visible ? { ...prev, visible: false } : prev);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Auto-scroll to the current leader (right end) on mount
    const animateScroll = (element: HTMLElement, target: number, duration: number) => {
      const start = element.scrollLeft;
      const change = target - start;
      const startTime = performance.now();

      const animateScrollFrame = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        element.scrollLeft = start + change * ease;
        if (elapsed < duration) {
          requestAnimationFrame(animateScrollFrame);
        }
      };
      requestAnimationFrame(animateScrollFrame);
    };

    const scrollTimeout = setTimeout(() => {
      if (chairScrollRef.current) {
        animateScroll(chairScrollRef.current, chairScrollRef.current.scrollWidth, 2000);
      }
      if (secScrollRef.current) {
        animateScroll(secScrollRef.current, secScrollRef.current.scrollWidth, 2000);
      }
    }, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, src: string, name: string, role: string) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!src) return;

    const photoEl = e.currentTarget.querySelector('.ldr-photo') as HTMLElement;
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
      setPopup(prev => ({ ...prev, visible: false }));
    }, 120);
  };

  const scrollBy = (ref: React.RefObject<HTMLDivElement | null>, direction: "prev" | "next") => {
    const container = ref.current;
    if (!container) return;
    const distance = container.clientWidth * 0.7;
    container.scrollBy({ left: direction === "next" ? distance : -distance, behavior: "smooth" });
  };

  const chairpersonMembers: LeaderMember[] = [
    { year: "1959", name: "Archbishop Perraudin", role: "Founding Chairperson", period: "13 yrs", duration: 13, photo_url: "img/Chairperson/perraudin.jpg" },
    { year: "1972", name: "H.E. Mgr. Jean Baptiste Gahamanyi", role: "Chairperson", period: "25 yrs", duration: 25, photo_url: "img/Chairperson/gahamanyi.png" },
    { year: "1997", name: "H.E. Mgr. Thaddée Ntihinyurwa", role: "Chairperson", period: "25 yrs", duration: 25 },
    { year: "2022", name: "H.E. Mgr. Anaclet Mwumvaneza", role: "Chairperson — Nyundo Diocese", period: "Present", duration: 4, featured: true, photo_url: "img/Chairperson/anaclet.jpg" },
  ];

  const secretaryMembers: LeaderMember[] = [
    { year: "1961", name: "Father Arthur Dejemeppe", role: "Secretary General", period: "11 yrs", duration: 11, photo_url: "img/Secretary%20Generals/Arthur%20Dejemeppe.jpg" },
    { year: "1972", name: "Father Roger Pien", role: "Secretary General", period: "1 yr", duration: 1, photo_url: "img/Secretary%20Generals/Roger%20Pien.jpg" },
    { year: "1973", name: "Father Cyriaque Munyansanga", role: "Secretary General", period: "4 yrs", duration: 4, photo_url: "img/Secretary%20Generals/Cyriaque%20Munyansanga.png" },
    { year: "1977", name: "Father Carles Maria Giol", role: "Secretary General", period: "1 yr", duration: 1, photo_url: "img/Secretary%20Generals/Carles%20Maria%20Giol.png" },
    { year: "1978", name: "Father Michel Descombes", role: "Secretary General", period: "17 yrs", duration: 17, photo_url: "img/Secretary%20Generals/Descombers.jpg" },
    { year: "1995", name: "Father Callixte Twagirayezu", role: "Secretary General", period: "1 yr", duration: 1, photo_url: "img/Secretary%20Generals/Callixte%20Twagirayezu.jpg" },
    { year: "1996", name: "Msgr. Oreste Incimatata", role: "Secretary General", period: "17 yrs", duration: 17, photo_url: "img/Secretary%20Generals/Mgr.%20ORESTE%20INCIMATATA.jpg" },
    { year: "2013", name: "H.E. Mgr. Anaclet Mwumvaneza", role: "Secretary General", period: "3 yrs", duration: 3, photo_url: "img/Secretary%20Generals/anaclet.jpg" },
    { year: "2016", name: "H.E. Mgr. Jean Marie Vianney Twagirayezu", role: "Secretary General", period: "7 yrs", duration: 7, photo_url: "img/Secretary%20Generals/JMV%20Twagirayezu.jpg" },
    { year: "2023", name: "Father Oscar Kagimbura", role: "Secretary General", period: "Present", duration: 3, featured: true, photo_url: "img/Secretary%20Generals/Oscar%20Kagimbura.png" },
  ];

  if (!groups || groups.length === 0) {
    return (
      <section className="section-warm ldr-section" id={anchor_id || undefined} data-watermark={wm}>
        <div className="container">
          <div className="head-center">
            <h2 className="sub-section-title">A Legacy of Faithful Service</h2>
          </div>

          {/* Chairpersons */}
          <div className="ldr-era-block">
            <div className="ldr-era-header">
              <div className="ldr-era-title">
                <i className="fa-solid fa-crown" aria-hidden /> Chairpersons
              </div>
              <span className="ldr-era-span">1959 — Present</span>
            </div>
            <div className="ldr-scroll-wrap">
              <button
                className="ldr-arrow ldr-prev"
                aria-label="Previous"
                type="button"
                onClick={() => scrollBy(chairScrollRef, "prev")}
              >
                <i className="fa-solid fa-chevron-left" aria-hidden />
              </button>
              <div className="ldr-scroll" ref={chairScrollRef}>
                <div className="ldr-timeline" role="list" aria-label="Chairpersons">
                  {chairpersonMembers.map((m, mi) => (
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
                    />
                  ))}
                </div>
              </div>
              <button
                className="ldr-arrow ldr-next"
                aria-label="Next"
                type="button"
                onClick={() => scrollBy(chairScrollRef, "next")}
              >
                <i className="fa-solid fa-chevron-right" aria-hidden />
              </button>
            </div>
          </div>

          {/* Secretary Generals */}
          <div className="ldr-era-block">
            <div className="ldr-era-header">
              <div className="ldr-era-title">
                <i className="fa-solid fa-person-chalkboard" aria-hidden /> Secretary Generals
              </div>
              <span className="ldr-era-span">1961 — Present</span>
            </div>
            <div className="ldr-scroll-wrap">
              <button
                className="ldr-arrow ldr-prev"
                aria-label="Previous"
                type="button"
                onClick={() => scrollBy(secScrollRef, "prev")}
              >
                <i className="fa-solid fa-chevron-left" aria-hidden />
              </button>
              <div className="ldr-scroll" ref={secScrollRef}>
                <div className="ldr-timeline" role="list" aria-label="Secretary Generals">
                  {secretaryMembers.map((m, mi) => (
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
                    />
                  ))}
                </div>
              </div>
              <button
                className="ldr-arrow ldr-next"
                aria-label="Next"
                type="button"
                onClick={() => scrollBy(secScrollRef, "next")}
              >
                <i className="fa-solid fa-chevron-right" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const eyebrowIc = faSolidIconClass(eyebrow_icon);

  return (
    <section
      className="section-warm ldr-section"
      id={anchor_id || undefined}
      data-watermark={wm}
    >
      <div className="container">
        <div className="head-center">
          {eyebrow ? (
            <div className="sub-section-label">
              {eyebrowIc ? <i className={eyebrowIc} aria-hidden /> : null} {eyebrow}
            </div>
          ) : null}
          {title ? <h2 className="sub-section-title">{title}</h2> : null}
          {subtitle ? <p className="sub-section-subtitle">{subtitle}</p> : null}
        </div>

        {groups.map((group, gi) => {
          const entries = group.members || [];
          const timelineNodes = entries.filter((m) => Boolean((m.year || m.name)?.trim()));
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
                group={group}
                timelineNodes={timelineNodes.map(m => {
                  const fallback = [...chairpersonMembers, ...secretaryMembers].find(f => f.name === m.name);
                  return {
                    ...m,
                    period: m.period || fallback?.period,
                    duration: m.duration || fallback?.duration,
                    photo_url: m.photo_url || fallback?.photo_url
                  };
                })}
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
          style={{ left: popup.x, top: popup.y, position: 'fixed' }}
          onMouseEnter={() => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }}
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
              bottom: popup.flip ? 'auto' : '-8px',
              top: popup.flip ? '-8px' : 'auto',
              transform: popup.flip ? 'translateX(-50%) rotate(225deg)' : 'translateX(-50%) rotate(45deg)'
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
