import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

// Public Sections
import HeroSection from "@/components/website/sections/HeroSection";
import ProgramCards from "@/components/website/sections/ProgramCards";
import { renderWebsiteSectionWithFeatured } from "@/lib/public-page-sections-server";
import { enrichCtaSectionsWithFeaturedCampaigns } from "@/lib/enrich-cta-featured-campaign";
import type { PublicSectionRow } from "@/lib/public-page-sections";

import AboutSection from "@/components/website/sections/AboutSection";

export default async function LandingPage() {
  const supabase = await createClient();

  // 1. Fetch Page (home)
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'home')
    .single();

  if (!page) {
    return notFound();
  }

  const pageId = (page as { id: string }).id;

  // 2. Fetch Hero
  const { data: hero } = await supabase
    .from('hero_content')
    .select('*')
    .eq('page_id', pageId)
    .single();

  // 3. Fetch Hero Slides
  const { data: slides } = await supabase
    .from('slide_items')
    .select('*')
    .eq('page_id', pageId)
    .eq('visible', true)
    .order('order', { ascending: true });

  // 4. Fetch Sections
  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .eq('page_id', pageId)
    .eq('visible', true)
    .order('order', { ascending: true });

  const enrichedSections = await enrichCtaSectionsWithFeaturedCampaigns(
    supabase,
    (sections ?? []) as PublicSectionRow[],
  );

  const hasProgramSection = enrichedSections?.some((s: any) => s.type === "program_cards");
  const hasHomeAboutSection = enrichedSections?.some((s: any) => s.type === "home_about");

  const heroRow = hero as Record<string, unknown> | null;
  const heroProps =
    heroRow && typeof heroRow === "object"
      ? {
          heading: String(heroRow.heading ?? ""),
          subheading: String(heroRow.subheading ?? ""),
          cta_text: String(heroRow.cta_text ?? ""),
          cta_url: String(heroRow.cta_url ?? ""),
          image_url: String(heroRow.image_url ?? ""),
          options: {
            ...(heroRow.options && typeof heroRow.options === "object" && !Array.isArray(heroRow.options)
              ? heroRow.options
              : {}),
            slides: slides || [],
          },
        }
      : {
          heading: "",
          subheading: "",
          cta_text: "",
          cta_url: "",
          image_url: "",
          options: { slides: slides || [] },
        };

  return (
    <main>
      <HeroSection
        heading={heroProps.heading}
        subheading={heroProps.subheading}
        cta_text={heroProps.cta_text}
        cta_url={heroProps.cta_url}
        image_url={heroProps.image_url}
        options={heroProps.options}
      />

      {/* CMS block or fallback defaults when no home_about row */}
      {!hasHomeAboutSection ? <AboutSection /> : null}

      {/* Default programs block only when no program_cards row exists in CMS */}
      {!hasProgramSection ? <ProgramCards key="fallback-program-cards" /> : null}
      {enrichedSections?.map(renderWebsiteSectionWithFeatured)}
    </main>
  );
}
