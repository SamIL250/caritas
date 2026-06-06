'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { KpiItem } from './sections/MetricsKpiStrip';

export type MetricsSection = {
  id: string;
  tab_key: string;
  tab_label: string;
  tab_icon: string;
  visible: boolean;
  content: any;
};

export default function MetricsPageClient({
  sections,
  kpis,
}: {
  sections: MetricsSection[];
  kpis: KpiItem[];
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);

  const programTabKeys = ['health', 'social', 'development', 'admin'];
  const programSections = sections.filter((s) => programTabKeys.includes(s.tab_key));

  /* Map metrics tab_key → programs page category slug */
  const tabKeyToSlug: Record<string, string> = {
    health: 'health',
    social: 'social-welfare',
    development: 'development',
    admin: 'finance-administration',
  };

  function toggleDropdown() {
    setShowDropdown((v) => !v);
  }

  function closeDropdown() {
    setShowDropdown(false);
  }

  /* Close dropdown on Escape / outside-click */
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

  return (
    <div className="metrics-page-content">
      {/* ════ Impact at a Glance — Bubble Banner ════ */}
      {kpis.length > 0 && (
        <div className="ig-banner sr">
          <div className="ig-banner-orb1"></div>
          <div className="ig-banner-orb2"></div>
          <div className="ig-banner-inner">
            <div className="ig-banner-label">&#9654; Impact at a Glance &#9654;</div>
            <div className="ig-banner-title">Caritas Rwanda by the <span>Numbers</span></div>
            <div className="ig-bubbles">
              {kpis.slice(0, 5).map((kpi, i) => {
                /* Reference layout: sm, lg, xl, lg, sm — first & last pushed down */
                const sizeClasses = ['ig-bubble-sm', 'ig-bubble-lg', 'ig-bubble-xl', 'ig-bubble-lg', 'ig-bubble-sm'];
                const offsetClasses = ['ig-bubble-offset', '', '', '', 'ig-bubble-offset'];
                const sizeClass = sizeClasses[i] || 'ig-bubble-sm';
                return (
                  <div key={kpi.id} className={`ig-bubble ${sizeClass} ${offsetClasses[i] || ''}`}>
                    <div className="ig-bubble-val">{kpi.value}</div>
                    <div className="ig-bubble-lbl">{kpi.label}</div>
                  </div>
                );
              })}
            </div>

            {/* ── Read More dropdown ── */}
            <div className="rm-wrap" ref={ddRef}>
              <button className="rm-btn" onClick={toggleDropdown} type="button">
                <i className="fa-solid fa-grid-2" aria-hidden></i> Read More <i className={`fa-solid fa-chevron-down rm-caret ${showDropdown ? 'rm-caret-open' : ''}`} aria-hidden></i>
              </button>
              <div className={`rm-panel ${showDropdown ? 'rm-panel-open' : ''}`}>
                {programSections.map((s) => {
                  const content = s.content as any;
                  const variant = getCardVariant(content.name);
                  const programSlug = tabKeyToSlug[s.tab_key] || s.tab_key;
                  return (
                    <Link
                      key={s.id}
                      href={`/programs#${programSlug}`}
                      className={`rm-card rm-${variant}`}
                      onClick={closeDropdown}
                      aria-label={`View ${content.name} programs`}
                    >
                      <div className="rm-card-icon">
                        <i className={`fa-solid ${content.icon}`} aria-hidden></i>
                      </div>
                      <div className="rm-card-name">{content.name}</div>
                      <div className="rm-card-desc">{content.description}</div>
                      <div className="rm-card-arrow"><i className="fa-solid fa-arrow-right" aria-hidden></i> View programme</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Map program name to CSS variant for the dropdown cards (for colored theming) */
function getCardVariant(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('social') || n.includes('welfare')) return 'sw';
  if (n.includes('health')) return 'health';
  if (n.includes('develop')) return 'dev';
  return 'admin';
}
