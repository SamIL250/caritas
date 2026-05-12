import React from "react";
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

export default function LeadershipGridSection({
  eyebrow,
  eyebrow_icon = "fa-scroll",
  title,
  subtitle,
  anchor_id = "leadership",
  watermark_text = "SINCE 1959",
  groups = [],
}: Props) {
  if (!groups.length) return null;

  const hasAny = groups.some((g) =>
    (g.members || []).some((m) =>
      m.era_gap ? Boolean(m.era_label?.trim()) : Boolean((m.year || m.name)?.trim()),
    ),
  );
  if (!hasAny) return null;

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
              <div className="ldr-scroll-wrap">
                <div className="ldr-scroll">
                  <div
                    className="ldr-timeline"
                    role="list"
                    aria-label={group.subgroup_label || "Leadership timeline"}
                  >
                    {timelineNodes.map((m, mi) =>
                      m.era_gap ? (
                        <LeaderEraGap key={`gap-${gi}-${mi}`} label={m.era_label!.trim()} />
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
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
