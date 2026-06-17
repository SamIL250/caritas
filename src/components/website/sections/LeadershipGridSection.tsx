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
          <div className="ldr-role">{role}</div>
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
    return () => window.removeEventListener('scroll', handleScroll);
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
                <div className="ldr-timeline">
                  <div className="ldr-node ldr-node--above" style={{ "--dur": 13 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <img
                          src={encodePublicSrc("img/Chairperson/perraudin.jpg")}
                          alt="Archbishop Perraudin"
                          style={{ objectPosition: "center top" }}
                        />
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">Archbishop Perraudin</div>
                        <div className="ldr-role">Founding Chairperson</div>
                        <div className="ldr-period">1959 — 1972 · 13 yrs</div>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">1959</div>
                  </div>

                  <div className="ldr-node ldr-node--below" style={{ "--dur": 25 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <img
                          src={encodePublicSrc("img/Chairperson/gahamanyi.png")}
                          alt="H.E. Mgr. Jean Baptiste Gahamanyi"
                        />
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">H.E. Mgr. Jean Baptiste Gahamanyi</div>
                        <div className="ldr-role">Chairperson</div>
                        <div className="ldr-period">1972 — 1997 · 25 yrs</div>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">1972</div>
                  </div>

                  <div className="ldr-node ldr-node--above" style={{ "--dur": 25 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <div className="ldr-photo-placeholder">
                          <i className="fa-solid fa-user-tie" aria-hidden />
                        </div>
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">H.E. Mgr. Thaddée Ntihinyurwa</div>
                        <div className="ldr-role">Chairperson</div>
                        <div className="ldr-period">1997 — 2022 · 25 yrs</div>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">1997</div>
                  </div>

                  <div className="ldr-node ldr-node--below ldr-node--current" style={{ "--dur": 4 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <img
                          src={encodePublicSrc("img/Chairperson/anaclet.jpg")}
                          alt="H.E. Mgr. Anaclet Mwumvaneza"
                        />
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">H.E. Mgr. Anaclet Mwumvaneza</div>
                        <div className="ldr-role">Chairperson — Nyundo Diocese</div>
                        <div className="ldr-period">2022 — Present</div>
                        <span className="ldr-current-badge">Current</span>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">2022</div>
                  </div>
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
                <div className="ldr-timeline">
                  <div className="ldr-node ldr-node--above" style={{ "--dur": 11 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <img
                          src={encodePublicSrc("img/Secretary%20Generals/Arthur%20Dejemeppe.jpg")}
                          alt="Father Arthur Dejemeppe"
                        />
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">Father Arthur Dejemeppe</div>
                        <div className="ldr-role">Secretary General</div>
                        <div className="ldr-period">1961 — 1972 · 11 yrs</div>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">1961</div>
                  </div>

                  <div className="ldr-node ldr-node--below" style={{ "--dur": 1 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <img
                          src={encodePublicSrc("img/Secretary%20Generals/Roger%20Pien.jpg")}
                          alt="Father Roger Pien"
                        />
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">Father Roger Pien</div>
                        <div className="ldr-role">Secretary General</div>
                        <div className="ldr-period">1972 — 1973 · 1 yr</div>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">1972</div>
                  </div>

                  <div className="ldr-node ldr-node--above" style={{ "--dur": 4 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <img
                          src={encodePublicSrc("img/Secretary%20Generals/Cyriaque%20Munyansanga.png")}
                          alt="Father Cyriaque Munyansanga"
                        />
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">Father Cyriaque Munyansanga</div>
                        <div className="ldr-role">Secretary General</div>
                        <div className="ldr-period">1973 — 1977 · 4 yrs</div>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">1973</div>
                  </div>

                  <div className="ldr-node ldr-node--below" style={{ "--dur": 1 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <img
                          src={encodePublicSrc("img/Secretary%20Generals/Carles%20Maria%20Giol.png")}
                          alt="Father Carles Maria Giol"
                        />
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">Father Carles Maria Giol</div>
                        <div className="ldr-role">Secretary General</div>
                        <div className="ldr-period">1977 — 1978 · 1 yr</div>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">1977</div>
                  </div>

                  <div className="ldr-node ldr-node--above" style={{ "--dur": 17 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <img
                          src={encodePublicSrc("img/Secretary%20Generals/Descombers.jpg")}
                          alt="Father Michel Descombes"
                        />
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">Father Michel Descombes</div>
                        <div className="ldr-role">Secretary General</div>
                        <div className="ldr-period">1978 — 1995 · 17 yrs</div>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">1978</div>
                  </div>

                  <div className="ldr-node ldr-node--below" style={{ "--dur": 1 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <img
                          src={encodePublicSrc("img/Secretary%20Generals/Callixte%20Twagirayezu.jpg")}
                          alt="Father Callixte Twagirayezu"
                        />
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">Father Callixte Twagirayezu</div>
                        <div className="ldr-role">Secretary General</div>
                        <div className="ldr-period">1995 — 1996 · 1 yr</div>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">1995</div>
                  </div>

                  <div className="ldr-node ldr-node--above" style={{ "--dur": 17 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <img
                          src={encodePublicSrc("img/Secretary%20Generals/Mgr.%20ORESTE%20INCIMATATA.jpg")}
                          alt="Monsignor Oreste Incimatata"
                        />
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">Msgr. Oreste Incimatata</div>
                        <div className="ldr-role">Secretary General</div>
                        <div className="ldr-period">1996 — 2013 · 17 yrs</div>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">1996</div>
                  </div>

                  <div className="ldr-node ldr-node--below" style={{ "--dur": 3 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <img
                          src={encodePublicSrc("img/Secretary%20Generals/anaclet.jpg")}
                          alt="H.E. Mgr. Anaclet Mwumvaneza"
                        />
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">H.E. Mgr. Anaclet Mwumvaneza</div>
                        <div className="ldr-role">Secretary General</div>
                        <div className="ldr-period">2013 — 2016 · 3 yrs</div>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">2013</div>
                  </div>

                  <div className="ldr-node ldr-node--above" style={{ "--dur": 7 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <img
                          src={encodePublicSrc("img/Secretary%20Generals/JMV%20Twagirayezu.jpg")}
                          alt="H.E. Mgr. Jean Marie Vianney Twagirayezu"
                        />
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">H.E. Mgr. JMV Twagirayezu</div>
                        <div className="ldr-role">Secretary General</div>
                        <div className="ldr-period">2016 — 2023 · 7 yrs</div>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">2016</div>
                  </div>

                  <div className="ldr-node ldr-node--below ldr-node--current" style={{ "--dur": 3 } as React.CSSProperties}>
                    <div className="ldr-card">
                      <div className="ldr-photo">
                        <img
                          src={encodePublicSrc("img/Secretary%20Generals/Oscar%20Kagimbura.png")}
                          alt="Father Oscar Kagimbura"
                        />
                      </div>
                      <div className="ldr-card-text">
                        <div className="ldr-name">Father Oscar Kagimbura</div>
                        <div className="ldr-role">Secretary General</div>
                        <div className="ldr-period">2023 — Present</div>
                        <span className="ldr-current-badge">Current</span>
                      </div>
                    </div>
                    <div className="ldr-stem" aria-hidden />
                    <div className="ldr-dot" aria-hidden />
                    <div className="ldr-year-tag">2023</div>
                  </div>
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
