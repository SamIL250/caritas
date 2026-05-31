import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PageHeroSection from '@/components/website/sections/PageHeroSection';
import MetricsKpiStrip from '@/components/website/sections/MetricsKpiStrip';
import MetricsPageClient from '@/components/website/MetricsPageClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: page } = await supabase
    .from('pages')
    .select('title, meta')
    .eq('slug', 'metrics')
    .single();

  const meta = page?.meta as Record<string, any>;

  return {
    title: meta?.seo_title ?? (page?.title ? `${page.title} — Caritas Rwanda` : "Impact Metrics — Caritas Rwanda"),
    description: meta?.seo_description ?? "A transparent, data-driven overview of Caritas Rwanda's reach, outcomes, and ongoing projects across all nine dioceses and four programme pillars.",
  };
}

export default async function MetricsPage() {
  const supabase = await createClient();

  // 1. Fetch Page
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'metrics')
    .single();

  if (!page || page.status !== 'published') {
    notFound();
  }

  // 2. Fetch Hero
  const { data: heroRow } = await supabase
    .from('hero_content')
    .select('*')
    .eq('page_id', page.id)
    .single();

  const heroImage = typeof heroRow?.image_url === 'string' ? heroRow.image_url.trim() : '';
  const heading = String(heroRow?.heading ?? "Impact Metrics & Programme Data");
  const subheading = String(heroRow?.subheading ?? "");

  const options = typeof heroRow?.options === 'object' && heroRow.options !== null ? heroRow.options : {};
  const badgeText = 'badge_text' in options ? String(options.badge_text) : 'Data & Transparency';
  const headingAccent = 'heading_accent' in options ? String(options.heading_accent) : '& Programme Data';

  // Fetch All Generic Sections
  const { data: allSections } = await supabase
    .from('sections')
    .select('*')
    .eq('page_id', page.id)
    .order('order', { ascending: true });

  const kpis = (allSections?.find(s => s.type === 'metrics_kpis')?.content as any)?.items || [];
  const statCards = (allSections?.find(s => s.type === 'metrics_stat_cards')?.content as any)?.items || [];
  const tabSections = allSections?.filter(s => ['metrics_overview', 'metrics_program', 'metrics_reach'].includes(s.type)) || [];
  
  // Re-map the generic sections to match the expected legacy tab sections format
  const sections = tabSections.map(s => {
    const c = s.content as any;
    return {
      id: s.id,
      tab_key: c.tab_key,
      tab_label: c.tab_label,
      tab_icon: c.tab_icon,
      visible: s.visible,
      sort_order: s.order,
      content: c
    };
  }).filter(s => s.visible);

  return (
    <div className="metrics-page min-h-screen bg-white">
      <PageHeroSection
        imageUrl={heroImage}
        eyebrow={badgeText}
        heading={heading}
        headingAccent={headingAccent}
        subheading={subheading}
        breadcrumbLabel="Impact Metrics"
      />

      {/* Hero KPIs Strip — Full Viewport */}
      {kpis && kpis.length > 0 ? (
        <section className="metrics-kpi-section">
          <div className="metrics-kpi-section-inner">
            <MetricsKpiStrip items={kpis as any} />
          </div>
        </section>
      ) : null}

      {/* Tabs and Content — Full Viewport */}
      <section className="metrics-tabs-section">
        <div className="metrics-tabs-section-inner">
          <MetricsPageClient
            sections={(sections as any) || []}
            statCards={(statCards as any) || []}
          />
        </div>
      </section>
    </div>
  );
}
