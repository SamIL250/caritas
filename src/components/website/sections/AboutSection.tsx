'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DEFAULT_SECTION_CONTENT } from '@/lib/constants';

export interface HomeAboutPillar {
  icon: string;
  title: string;
  body: string;
  footer?: string;
  chips?: string[];
  cta_label?: string;
  cta_href?: string;
}

export interface HomeAboutSectionProps {
  badge_est?: string;
  badge_location?: string;
  heading_line1?: string;
  heading_line2_accent?: string;
  history_label?: string;
  paragraph_html?: string[];
  story_cta?: { label?: string; href?: string };
  quote_text?: string;
  quote_attribution?: string;
  milestones?: string[];
  pillars?: HomeAboutPillar[];
  stats_bar?: {
    items?: { value: string; label: string }[];
    cta_label?: string;
    cta_href?: string;
  };
  /** Legacy `home_about` rows (pre–red card layout) — merged at runtime */
  meta_est?: string;
  meta_location?: string;
  tagline_line1?: string;
  tagline_line2?: string;
  title_dek?: string;
  lead_start?: string;
  lead_strong?: string;
  lead_end?: string;
  timeline?: { year?: string; text?: string }[];
  stats?: { value?: string; label?: string; icon?: string }[];
  primary_cta?: { label?: string; href?: string };
}

type FullProps = Required<
  Omit<HomeAboutSectionProps, 'pillars' | 'paragraph_html' | 'milestones' | 'stats_bar'>
> & {
  paragraph_html: string[];
  milestones: string[];
  pillars: HomeAboutPillar[];
  stats_bar: {
    items: { value: string; label: string }[];
    cta_label: string;
    cta_href: string;
  };
};

const base = DEFAULT_SECTION_CONTENT.home_about as unknown as FullProps;

function isLegacyShape(raw: Partial<HomeAboutSectionProps>): boolean {
  return (
    !!raw &&
    typeof raw === 'object' &&
    'tagline_line1' in raw &&
    !('paragraph_html' in raw && Array.isArray((raw as HomeAboutSectionProps).paragraph_html))
  );
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function mergeContent(raw: HomeAboutSectionProps = {}): FullProps {
  if (isLegacyShape(raw)) {
    const legacy = raw;
    const milestones = (legacy.timeline || [])
      .map((row) => {
        const y = (row.year || '').trim();
        const t = stripHtml(row.text || '');
        if (y && t) return `${y} — ${t}`;
        return t || y;
      })
      .filter(Boolean);

    const statsItems = (legacy.stats || [])
      .map((s) => ({
        value: String(s.value ?? '').trim(),
        label: String(s.label ?? '').trim(),
      }))
      .filter((s) => s.value || s.label);

    const leadHtml = `${legacy.lead_start ?? ''}<strong>${legacy.lead_strong ?? ''}</strong>${legacy.lead_end ?? ''}`.trim();

    return {
      ...base,
      badge_est: legacy.meta_est ?? base.badge_est,
      badge_location: legacy.meta_location ?? base.badge_location,
      heading_line1: legacy.tagline_line1 ?? base.heading_line1,
      heading_line2_accent: legacy.tagline_line2 ?? base.heading_line2_accent,
      history_label:
        legacy.title_dek && legacy.title_dek.trim().length < 120
          ? legacy.title_dek.trim()
          : base.history_label,
      paragraph_html: [
        leadHtml.length > 12 ? leadHtml : base.paragraph_html[0],
        base.paragraph_html[1],
      ],
      story_cta: {
        label: legacy.primary_cta?.label ?? base.story_cta.label,
        href: legacy.primary_cta?.href ?? base.story_cta.href,
      },
      milestones: milestones.length ? milestones : base.milestones,
      stats_bar: {
        ...base.stats_bar,
        items: statsItems.length >= 2 ? statsItems : base.stats_bar.items,
      },
    };
  }

  const next = { ...base, ...raw } as FullProps;

  if (raw.paragraph_html?.length === 2) {
    next.paragraph_html = [String(raw.paragraph_html[0]), String(raw.paragraph_html[1])];
  } else if (raw.paragraph_html?.length === 1) {
    next.paragraph_html = [String(raw.paragraph_html[0]), base.paragraph_html[1]];
  } else {
    next.paragraph_html = base.paragraph_html;
  }

  next.milestones = raw.milestones?.length ? raw.milestones.map(String) : base.milestones;

  const srcPillars = raw.pillars?.length === 3 ? raw.pillars : base.pillars;
  next.pillars = srcPillars.map((p, i) => ({
    ...base.pillars[Math.min(i, base.pillars.length - 1)],
    ...p,
    chips: Array.isArray(p.chips) ? p.chips : base.pillars[i]?.chips ?? [],
  }));

  next.stats_bar = {
    items: raw.stats_bar?.items?.length ? raw.stats_bar.items : base.stats_bar.items,
    cta_label: raw.stats_bar?.cta_label ?? base.stats_bar.cta_label,
    cta_href: raw.stats_bar?.cta_href ?? base.stats_bar.cta_href,
  };

  next.story_cta = {
    label: raw.story_cta?.label ?? base.story_cta.label,
    href: raw.story_cta?.href ?? base.story_cta.href,
  };

  next.quote_text = raw.quote_text ?? base.quote_text;
  next.quote_attribution = raw.quote_attribution ?? base.quote_attribution;

  return next;
}

function PillLink({ href, label, className }: { href: string; label: string; className?: string }) {
  const inner = (
    <>
      {label} <i className="fa-solid fa-arrow-right" aria-hidden />
    </>
  );
  const cls = className ?? 'btn-pill';
  if (href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {inner}
    </a>
  );
}

export default function AboutSection(props: HomeAboutSectionProps = {}) {
  const c = mergeContent(props);
  const [activeIndex, setActiveIndex] = useState(0);
  const currentPillar = c.pillars[activeIndex] || c.pillars[0];
  const tabLabels = ['Vision', 'Mission', 'Values'] as const;
  const tabKeys = ['vision', 'mission', 'values'] as const;

  return (
    <section className="cr-home-about" id="about" aria-labelledby="cha-about-heading">
      <div className="about-card">
        <div className="about-header-split">
          {/* Left: Identity & History */}
          <div className="about-header-main">
            <div className="about-badge-row">
              <span className="about-est-badge">
                <i className="fa-solid fa-circle-dot" aria-hidden /> {c.badge_est}
              </span>
              <span className="about-est-badge">
                <i className="fa-solid fa-church" aria-hidden /> {c.badge_location}
              </span>
            </div>
            <h2 className="about-heading" id="cha-about-heading">
              {c.heading_line1}
              <br />
              <span className="about-heading-accent">{c.heading_line2_accent}</span>
            </h2>
            <p className="about-subheading">{c.history_label}</p>
            {c.paragraph_html.map((html, idx) => (
              <div
                key={idx}
                className="about-header-desc"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ))}
            <blockquote className="about-inline-quote">
              <p>{c.quote_text}</p>
              <cite>{c.quote_attribution}</cite>
            </blockquote>
            <PillLink href={c.story_cta.href} label={c.story_cta.label} />
          </div>

          {/* Right: VMC Interactive Panel */}
          <div className="about-vmc-panel">
            <div className="vmc-tabs" role="tablist" aria-label="Organization pillars">
              {c.pillars.map((pillar, idx) => (
                <button
                  key={idx}
                  className={`vmc-tab${activeIndex === idx ? ' active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                  role="tab"
                  aria-selected={activeIndex === idx}
                >
                  <i className={pillar.icon || 'fa-regular fa-eye'} aria-hidden />
                  {' '}{tabLabels[idx]}
                </button>
              ))}
            </div>
            <div className="vmc-content">
              <div className="vmc-icon-wrap">
                <i className={currentPillar.icon || 'fa-regular fa-eye'} aria-hidden />
              </div>
              <h3 className="vmc-title">{currentPillar.title}</h3>
              <p className="vmc-desc" dangerouslySetInnerHTML={{ __html: currentPillar.body }} />
              {currentPillar.footer && (
                <span className="vmc-tagline">{currentPillar.footer}</span>
              )}
              {currentPillar.chips && currentPillar.chips.length > 0 && (
                <div className="vmc-chips">
                  {currentPillar.chips.map((chip, ci) => (
                    <span key={ci} className="vmc-chip">{chip}</span>
                  ))}
                </div>
              )}
              {currentPillar.cta_label && currentPillar.cta_href && (
                <PillLink
                  href={currentPillar.cta_href}
                  label={currentPillar.cta_label}
                  className="vmc-cta"
                />
              )}
            </div>
            <div className="vmc-dots" aria-hidden="true">
              {c.pillars.map((_, idx) => (
                <span
                  key={idx}
                  className={`vmc-dot${activeIndex === idx ? ' active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="about-stats-bar">
          <div className="stats-group">
            {c.stats_bar.items.map((stat, idx) => (
              <div key={idx} className="stat-item">
                <span className="stat-num">{stat.value}</span>
                <span className="stat-text">{stat.label}</span>
              </div>
            ))}
          </div>
          <PillLink href={c.stats_bar.cta_href} label={c.stats_bar.cta_label} />
        </div>
      </div>
    </section>
  );
}
