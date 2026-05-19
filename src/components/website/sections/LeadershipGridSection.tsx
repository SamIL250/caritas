"use client";

import React, { useRef } from "react";
import { faSolidIconClass } from "@/lib/fontawesome";

export type LeaderMember = {
  era_gap?: boolean;
  era_label?: string;
  year?: string;
  name?: string;
  role?: string;
  featured?: boolean;
  photo_url?: string;
};

export type LeaderGroup = {
  subgroup_label?: string;
  subgroup_icon?: string;
  /** Pill on the right of the row header, e.g. "1959 — Present" */
  era_span?: string;
  members?: LeaderMember[];
};

type Props = {
  eyebrow?: string;
  eyebrow_icon?: string;
  title?: string;
  subtitle?: string;
  anchor_id?: string;
  /** Large faint watermark behind the section (data attribute on section) */
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

function LeaderEraGap({ label }: { label: string }) {
  const lines = label.split(/\n/).filter(Boolean);
  return (
    <div className="ldr-era-gap" role="listitem" aria-label={label}>
      <div className="ldr-era-gap-label">
        {lines.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 ? <br /> : null}
            {line}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function LeaderNode({
  year,
  name,
  role,
  featured,
  photo_url,
}: {
  year: string;
  name: string;
  role: string;
  featured?: boolean;
  photo_url?: string;
}) {
  const src = photo_url?.trim() ? encodePublicSrc(photo_url.trim()) : "";

  return (
    <div className={`ldr-node ${featured ? "ldr-node--current" : ""}`} role="listitem">
      <div className="ldr-photo">
        {src ? (
          <img src={src} alt={name.trim() ? name : role.trim() ? role : "Leader portrait"} />
        ) : (
          <div className="ldr-photo-placeholder">
            <i className="fa-solid fa-user-tie" aria-hidden />
          </div>
        )}
      </div>
      <div className="ldr-connector" aria-hidden />
      <div className="ldr-dot" aria-hidden />
      <div className="ldr-year-label">{year}</div>
      <div className="ldr-name">{name}</div>
      <div className="ldr-role">{role}</div>
      {featured ? <span className="ldr-current-badge">Current</span> : null}
    </div>
  );
}

function LeaderScrollTimeline({
  group,
  timelineNodes,
  ariaLabel,
}: {
  group: LeaderGroup;
  timelineNodes: (LeaderMember & { era_gap?: boolean })[];
  ariaLabel: string;
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
      <button className="ldr-arrow ldr-prev" aria-label="Previous" type="button" onClick={() => scrollBy("prev")}> 
        <i className="fa-solid fa-chevron-left" aria-hidden />
      </button>
      <div className="ldr-scroll" ref={scrollRef}>
        <div className="ldr-timeline" role="list" aria-label={ariaLabel}>
          {timelineNodes.map((m, mi) =>
            m.era_gap ? (
              <LeaderEraGap key={`gap-${group.subgroup_label}-${mi}`} label={m.era_label!.trim()} />
            ) : (
              <LeaderNode
                key={`${m.year}-${m.name}-${mi}`}
                year={String(m.year ?? "")}
                name={String(m.name ?? "")}
                role={String(m.role ?? "")}
                featured={m.featured}
                photo_url={m.photo_url}
              />
            ),
          )}
        </div>
      </div>
      <button className="ldr-arrow ldr-next" aria-label="Next" type="button" onClick={() => scrollBy("next")}> 
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
  // If no dynamic groups are provided, render the original static markup
  // taken from the legacy `original-website/about.html` so the design
  // matches the source exactly.
  if (!groups || groups.length === 0) {
    return (
      <section className="section-warm ldr-section" id={anchor_id || undefined} data-watermark={wm}>
        <div className="container">
          <div className="head-center">
            <h2 className="sub-section-title">A Legacy of Faithful Service</h2>
          </div>

          {/* CHAIRPERSONS TIMELINE (static) */}
          <div className="ldr-era-block">
            <div className="ldr-era-header">
              <div className="ldr-era-title"><i className="fa-solid fa-crown" aria-hidden /> Chairpersons</div>
              <span className="ldr-era-span">1959 — Present</span>
            </div>
            <div className="ldr-scroll-wrap">
              <div className="ldr-scroll">
                <div className="ldr-timeline">
                  <div className="ldr-node">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Chairperson/perraudin.jpg")} alt="Archbishop Perraudin" style={{objectPosition: 'center top'}} />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">1959</div>
                    <div className="ldr-name">Archbishop Perraudin</div>
                    <div className="ldr-role">Founding Chairperson</div>
                  </div>

                  <div className="ldr-node">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Chairperson/gahamanyi.png")} alt="H.E. Mgr. Jean Baptiste Gahamanyi" />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">1972</div>
                    <div className="ldr-name">H.E. Mgr. Jean Baptiste Gahamanyi</div>
                    <div className="ldr-role">Chairperson</div>
                  </div>

                  <div className="ldr-node">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Chairperson/Myr%20Thadd%C3%A9e%20Ntihinyurwa.png")} alt="H.E. Mgr. Thaddée Ntihinyurwa" style={{objectPosition: 'center top'}} />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">1997</div>
                    <div className="ldr-name">H.E. Mgr. Thaddée Ntihinyurwa</div>
                    <div className="ldr-role">Chairperson</div>
                  </div>

                  <div className="ldr-node ldr-node--current">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Chairperson/anaclet.jpg")} alt="H.E. Mgr. Anaclet Mwumvaneza" />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">2022</div>
                    <div className="ldr-name">H.E. Mgr. Anaclet Mwumvaneza</div>
                    <div className="ldr-role">Chairperson — Nyundo Diocese</div>
                    <span className="ldr-current-badge">Current</span>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* SECRETARY GENERALS TIMELINE (static) */}
          <div className="ldr-era-block">
            <div className="ldr-era-header">
              <div className="ldr-era-title"><i className="fa-solid fa-person-chalkboard" aria-hidden /> Secretary Generals</div>
              <span className="ldr-era-span">1961 — Present</span>
            </div>
            <div className="ldr-scroll-wrap">
              <button className="ldr-arrow ldr-prev" aria-label="Previous" type="button"><i className="fa-solid fa-chevron-left" aria-hidden /></button>
              <div className="ldr-scroll">
                <div className="ldr-timeline">
                  <div className="ldr-node">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Secretary%20Generals/Arthur%20Dejemeppe.jpg")} alt="Father Arthur Dejemeppe" />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">1961</div>
                    <div className="ldr-name">Father Arthur Dejemeppe</div>
                    <div className="ldr-role">Secretary General</div>
                  </div>

                  <div className="ldr-node">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Secretary%20Generals/Roger%20Pien.jpg")} alt="Father Roger Pien" />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">1972</div>
                    <div className="ldr-name">Father Roger Pien</div>
                    <div className="ldr-role">Secretary General</div>
                  </div>

                  <div className="ldr-node">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Secretary%20Generals/Cyriaque%20Munyansanga.png")} alt="Father Cyriaque Munyansanga" />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">1973</div>
                    <div className="ldr-name">Father Cyriaque Munyansanga</div>
                    <div className="ldr-role">Secretary General</div>
                  </div>

                  <div className="ldr-node">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Secretary%20Generals/Carles%20Maria%20Giol.png")} alt="Father Carles Maria Giol" />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">1977</div>
                    <div className="ldr-name">Father Carles Maria Giol</div>
                    <div className="ldr-role">Secretary General</div>
                  </div>

                  <div className="ldr-node">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Secretary%20Generals/Descombers.jpg")} alt="Father Michel Descombes" />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">1978</div>
                    <div className="ldr-name">Father Michel Descombes</div>
                    <div className="ldr-role">Secretary General</div>
                  </div>

                  <div className="ldr-node">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Secretary%20Generals/Callixte%20Twagirayezu.jpg")} alt="Father Callixte Twagirayezu" />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">1995</div>
                    <div className="ldr-name">Father Callixte Twagirayezu</div>
                    <div className="ldr-role">Secretary General</div>
                  </div>

                  <div className="ldr-node">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Secretary%20Generals/Mgr.%20ORESTE%20INCIMATATA.jpg")} alt="Monsignor Oreste Incimatata" />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">1996</div>
                    <div className="ldr-name">Msgr. Oreste Incimatata</div>
                    <div className="ldr-role">Secretary General</div>
                  </div>

                  <div className="ldr-node">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Secretary%20Generals/anaclet.jpg")} alt="H.E. Mgr. Anaclet Mwumvaneza" />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">2013</div>
                    <div className="ldr-name">H.E. Mgr. Anaclet Mwumvaneza</div>
                    <div className="ldr-role">Secretary General</div>
                  </div>

                  <div className="ldr-node">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Secretary%20Generals/JMV%20Twagirayezu.jpg")} alt="H.E. Mgr. Jean Marie Vianney Twagirayezu" />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">2016</div>
                    <div className="ldr-name">H.E. Mgr. JMV Twagirayezu</div>
                    <div className="ldr-role">Secretary General</div>
                  </div>

                  <div className="ldr-node ldr-node--current">
                    <div className="ldr-photo">
                      <img src={encodePublicSrc("img/Secretary%20Generals/Oscar%20Kagimbura.png")} alt="Father Oscar Kagimbura" />
                    </div>
                    <div className="ldr-connector" />
                    <div className="ldr-dot" />
                    <div className="ldr-year-label">2023</div>
                    <div className="ldr-name">Father Oscar Kagimbura</div>
                    <div className="ldr-role">Secretary General</div>
                    <span className="ldr-current-badge">Current</span>
                  </div>

                </div>
              </div>
              <button className="ldr-arrow ldr-next" aria-label="Next" type="button"><i className="fa-solid fa-chevron-right" aria-hidden /></button>
            </div>
          </div>

        </div>
      </section>
    );
  }

  const eyebrowIc = faSolidIconClass(eyebrow_icon);
  const wm =
    typeof watermark_text === "string" && watermark_text.trim() !== ""
      ? watermark_text.trim()
      : "SINCE 1959";

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
          const timelineNodes = entries.filter((m) =>
            m.era_gap ? Boolean(m.era_label?.trim()) : Boolean((m.year || m.name)?.trim()),
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
                group={group}
                timelineNodes={timelineNodes}
                ariaLabel={group.subgroup_label || "Leadership timeline"}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
