'use client';

import { useState, useMemo } from 'react';
import MetricsStatCards, { StatCard } from './sections/MetricsStatCards';
import MetricsProgramCard, { ProgramTabContent } from './sections/MetricsProgramCard';
import MetricsReachGrid, { ReachTabContent } from './sections/MetricsReachGrid';

export type MetricsSection = {
  id: string;
  tab_key: string;
  tab_label: string;
  tab_icon: string;
  visible: boolean;
  content: any; // specific content based on tab
};

export default function MetricsPageClient({
  sections,
  statCards,
}: {
  sections: MetricsSection[];
  statCards: StatCard[];
}) {
  const visibleSections = useMemo(() => sections.filter((s) => s.visible), [sections]);
  const [activeTab, setActiveTab] = useState<string>(visibleSections[0]?.tab_key || '');

  const activeSection = visibleSections.find((s) => s.tab_key === activeTab);

  if (visibleSections.length === 0) {
    return <div className="text-center py-20 text-stone-500">No metrics sections configured.</div>;
  }

  return (
    <div className="metrics-page-content">
      {/* Sticky Tab Bar */}
      <div className="metrics-tab-nav-wrapper">
        <div className="metrics-tab-nav">
          {visibleSections.map((s) => (
            <button
              key={s.id}
              className={`metrics-tab-btn ${activeTab === s.tab_key ? 'active' : ''}`}
              onClick={() => setActiveTab(s.tab_key)}
            >
              <i className={`fa-solid ${s.tab_icon}`} aria-hidden />
              <span>{s.tab_label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panel */}
      <div className="metrics-tab-panel-wrapper">
        {activeSection && (
          <div className="metrics-tab-panel animate-fade-in" key={activeSection.id}>
            {activeSection.tab_key === 'overview' ? (
              <div className="metrics-overview-tab">
                <div className="metrics-overview-header">
                  <h3 className="metrics-panel-title">{activeSection.content.heading || 'Organisation Overview'}</h3>
                  <p className="metrics-panel-sub">{activeSection.content.subheading}</p>
                </div>
                {statCards.length > 0 ? <MetricsStatCards cards={statCards} /> : null}
              </div>
            ) : activeSection.tab_key === 'reach' ? (
              <MetricsReachGrid content={activeSection.content as ReachTabContent} />
            ) : (
              <MetricsProgramCard content={activeSection.content as ProgramTabContent} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
