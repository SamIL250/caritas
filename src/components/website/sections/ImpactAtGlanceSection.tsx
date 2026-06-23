'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export type KpiItem = {
  value: string;
  label: string;
  color?: string;
  size?: 'xs' | 'sm' | 'lg' | 'xl';
};

export type ProgramStat = {
  value: string;
  label: string;
  size?: 'xs' | 'sm' | 'lg' | 'xl';
};

export type ProgramLink = {
  tab_key: string;
  tab_label: string;
  tab_icon: string;
  name: string;
  description: string;
  icon: string;
  accent_color: string;
  slug?: string;
  stats?: ProgramStat[];
};

export type ImpactAtGlanceContent = {
  label?: string;
  title?: string;
  title_accent?: string;
  kpis?: KpiItem[];
  programs?: ProgramLink[];
};

/* Map metrics tab_key → programs page category slug */
const tabKeyToSlug: Record<string, string> = {
  health: 'health',
  social: 'social-welfare',
  development: 'development',
  admin: 'finance-administration',
};

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function ImpactAtGlanceSection({
  label,
  title,
  title_accent,
  kpis,
  programs,
  allProgramSections,
}: ImpactAtGlanceContent & {
  allProgramSections?: { tab_key: string; tab_label: string; tab_icon: string; content: any }[];
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const ddRef = useRef<HTMLDivElement>(null);

  const bubbleKpis = kpis || [];
  const modalKpis = kpis || [];

  const programLinks: ProgramLink[] =
    programs && programs.length > 0
      ? programs
      : (allProgramSections || []).map((s) => {
          const c = s.content as any;
          return {
            tab_key: s.tab_key,
            tab_label: s.tab_label,
            tab_icon: s.tab_icon || 'fa-chart-bar',
            name: c?.name || s.tab_label,
            description: c?.description || '',
            icon: c?.icon || s.tab_icon || 'fa-chart-bar',
            accent_color: c?.accent_color || '#911313',
            slug: tabKeyToSlug[s.tab_key] || s.tab_key,
            stats: c?.stats || [],
          };
        });

  const selectedProgramData = selectedProgram
    ? programLinks.find(p => (p.slug || tabKeyToSlug[p.tab_key] || p.tab_key) === selectedProgram)
    : null;

  function toggleDropdown() {
    setShowDropdown((v) => !v);
  }

  function closeDropdown() {
    setShowDropdown(false);
  }

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape' && showDropdown) {
        closeDropdown();
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showDropdown]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ddRef.current && !ddRef.current.contains(e.target as Node) && showDropdown) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  if (!kpis || kpis.length === 0) return null;

  return (
    <>
      <div className="ig-banner sr">
        <div className="ig-banner-orb1"></div>
        <div className="ig-banner-orb2"></div>
        <div className="ig-banner-inner">
          <div className="ig-banner-label">&#9654; {label || 'Impact at a Glance'} &#9654;</div>
          <div className="ig-banner-title">
            {title || 'Caritas Rwanda by the'} <span>{title_accent || 'Numbers'}</span>
          </div>
          <div className="ig-bubbles">
            {bubbleKpis.map((kpi, i) => {
              const defaultSizes = ['sm', 'lg', 'xl', 'lg', 'sm'];
              const sizeClass = kpi.size ? `ig-bubble-${kpi.size}` : `ig-bubble-${defaultSizes[i] || 'sm'}`;
              const offsetClasses = ['ig-bubble-offset', '', '', '', 'ig-bubble-offset'];
              const color = kpi.color || '#ff9a6c';
              return (
                <div
                  key={i}
                  className={`ig-bubble ${sizeClass} ${offsetClasses[i] || ''}`}
                  style={{
                    background: hexToRgba(color, 0.35),
                    borderColor: hexToRgba(color, 0.3),
                  }}
                >
                  <div className="ig-bubble-val">{kpi.value}</div>
                  <div className="ig-bubble-lbl">{kpi.label}</div>
                </div>
              );
            })}
          </div>

          {programLinks.length > 0 && (
            <div className="rm-wrap" ref={ddRef}>
              <button className="rm-btn" onClick={toggleDropdown} type="button">
                <i className="fa-solid fa-grid-2" aria-hidden></i> Read More{' '}
                <i
                  className={`fa-solid fa-chevron-down rm-caret ${showDropdown ? 'rm-caret-open' : ''}`}
                  aria-hidden
                ></i>
              </button>
              <div className={`rm-panel ${showDropdown ? 'rm-panel-open' : ''}`}>
                {programLinks.map((p) => {
                  const programSlug = p.slug || tabKeyToSlug[p.tab_key] || p.tab_key;
                  const accent = p.accent_color || '#911313';
                  return (
                    <button
                      key={p.tab_key}
                      type="button"
                      className="rm-card"
                      style={{
                        borderColor: hexToRgba(accent, 0.15),
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        el.style.borderColor = hexToRgba(accent, 0.35);
                        el.style.background = hexToRgba(accent, 0.04);
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.borderColor = hexToRgba(accent, 0.15);
                        el.style.background = '';
                      }}
                      onClick={() => setSelectedProgram(programSlug)}
                      aria-label={`View ${p.name} programs impact`}
                    >
                      <div
                        className="rm-card-icon"
                        style={{
                          background: hexToRgba(accent, 0.1),
                          color: accent,
                        }}
                      >
                        <i className={`fa-solid ${p.icon}`} aria-hidden></i>
                      </div>
                      <div className="rm-card-name" style={{ color: accent }}>{p.name}</div>
                      <div className="rm-card-desc">{p.description}</div>
                      <div className="rm-card-arrow" style={{ color: accent }}>
                        <i className="fa-solid fa-arrow-right" aria-hidden></i> View impact stats
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bubbles Modal ── */}
      <div
        id="bubblesModal"
        className={`bubbles-modal ${selectedProgram ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Impact at a Glance"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedProgram(null);
        }}
      >
        <div className="bm-card">
          <button className="bm-close" onClick={() => setSelectedProgram(null)} aria-label="Close">
            <i className="fa-solid fa-xmark"></i>
          </button>
          {selectedProgramData ? (
            <>
              <div className="bm-label">&#9654; {selectedProgramData.name} &#9654;</div>
              <div className="bm-title">{selectedProgramData.name}</div>
              <div className="bm-bubbles">
                {(selectedProgramData.stats || []).map((s, i) => {
                  const defaultClasses = ['bm-xl', 'bm-lg', 'bm-sm', 'bm-xs', 'bm-sm', 'bm-xs'];
                  const sizeClass = s.size ? `bm-${s.size}` : (defaultClasses[i] || 'bm-sm');
                  return (
                    <div key={i} className={`bm-bubble ${sizeClass}`}>
                      <div className="bm-val">{s.value}</div>
                      <div className="bm-lbl">{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="bm-label">&#9654; {label || 'Impact at a Glance'} &#9654;</div>
              <div className="bm-title">
                {title || 'Caritas Rwanda by the'} <span>{title_accent || 'Numbers'}</span>
              </div>
              <div className="bm-bubbles">
                {modalKpis.map((kpi, i) => {
                  const defaultSizes = ['xs', 'sm', 'lg', 'xl', 'lg', 'sm'];
                  const sizeClass = kpi.size ? `bm-${kpi.size}` : `bm-${defaultSizes[i] || 'sm'}`;
                  const color = kpi.color || '#ff9a6c';
                  return (
                    <div
                      key={i}
                      className={`bm-bubble ${sizeClass}`}
                      style={{
                        background: hexToRgba(color, 0.45),
                        borderColor: hexToRgba(color, 0.3),
                      }}
                    >
                      <div className="bm-val">{kpi.value}</div>
                      <div className="bm-lbl">{kpi.label}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          <div className="bm-footer">
            {selectedProgram && (
              <>
                <button
                  className="bm-view-btn bm-explore-btn"
                  onClick={() => {
                    setSelectedProgram(null);
                    setShowDropdown(true);
                  }}
                  type="button"
                >
                  <i className="fa-solid fa-arrow-left"></i> Explore more
                </button>
                <Link
                  href={`/programs#${selectedProgram}`}
                  className="bm-view-btn"
                  onClick={() => setSelectedProgram(null)}
                >
                  Continue to Programme <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
