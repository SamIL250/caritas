'use client';

import ImpactAtGlanceSection from './sections/ImpactAtGlanceSection';
import type { ImpactAtGlanceContent } from './sections/ImpactAtGlanceSection';

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
  impactContent,
}: {
  sections: MetricsSection[];
  impactContent: ImpactAtGlanceContent;
}) {
  const programTabKeys = ['health', 'social', 'development', 'admin'];
  const programSections = sections.filter((s) => programTabKeys.includes(s.tab_key));

  return (
    <div className="metrics-page-content">
      <ImpactAtGlanceSection
        {...impactContent}
        allProgramSections={programSections.map(s => ({
          tab_key: s.tab_key,
          tab_label: s.tab_label,
          tab_icon: s.tab_icon,
          content: s.content,
        }))}
      />
    </div>
  );
}
