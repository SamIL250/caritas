import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

// Public Sections
import HeroSection from "@/components/website/sections/HeroSection";
import ProgramCards from "@/components/website/sections/ProgramCards";
import AboutSection from "@/components/website/sections/AboutSection";
import ContactWithMapSection from "@/components/website/sections/ContactWithMapSection";
import { renderWebsiteSectionWithFeatured } from "@/lib/public-page-sections-server";
import { enrichCtaSectionsWithFeaturedCampaigns } from "@/lib/enrich-cta-featured-campaign";
import type { PublicSectionRow } from "@/lib/public-page-sections";

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

  // 5. Fetch published news articles for the news_cards section
  const { data: newsArticles } = await supabase
    .from("news_articles")
    .select("id, title, excerpt, image_url, slug, category, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(6);

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
    <>
      <HeroSection
        heading={heroProps.heading}
        subheading={heroProps.subheading}
        cta_text={heroProps.cta_text}
        cta_url={heroProps.cta_url}
        image_url={heroProps.image_url}
        options={heroProps.options}
      />

      {/* Rooted in Faith, Built for People — CMS-driven or fallback defaults */}
      {!hasHomeAboutSection ? <AboutSection /> : null}

      {/* Default programs block only when no program_cards row exists in CMS */}
      {!hasProgramSection ? <ProgramCards key="fallback-program-cards" /> : null}

      {/* All other CMS sections + contact block */}
      {(() => {
        const contactSections = enrichedSections?.filter(
          (s: any) => s.type === 'contact_info' || s.type === 'map_section'
        ) ?? [];
        // Note: video_gallery is intentionally kept in otherSections so it renders
        // from DB via renderWebsiteSectionWithFeatured (VideoGallerySection)
        const otherSections = enrichedSections?.filter(
          (s: any) => s.type !== 'contact_info' && s.type !== 'map_section'
        ) ?? [];

        const contactRow = contactSections.find((s: any) => s.type === 'contact_info');
        const mapRow = contactSections.find((s: any) => s.type === 'map_section');

        // Extract video_gallery to pass its props to news_cards
        const videoGalleryRow = otherSections.find((s: any) => s.type === 'video_gallery');
        const newsCardsRowIndex = otherSections.findIndex((s: any) => s.type === 'news_cards');

        // Remove video_gallery from otherSections since it will be embedded
        // Also remove faq_section from rendering on the homepage
        const finalOtherSections = otherSections.filter((s: any) => 
          s.type !== 'video_gallery' && s.type !== 'faq_section'
        );

        // If both exist, merge videoGalleryProps into news_cards content
        if (videoGalleryRow && newsCardsRowIndex !== -1) {
          const ncIndex = finalOtherSections.findIndex((s: any) => s.type === 'news_cards');
          if (ncIndex !== -1) {
            const nc = finalOtherSections[ncIndex];
            finalOtherSections[ncIndex] = {
              ...nc,
              content: {
                ...(nc.content && typeof nc.content === 'object' && !Array.isArray(nc.content) ? nc.content : {}),
                videoGalleryProps: videoGalleryRow.content,
              }
            };
          }
        }

        // Inject real news articles into the news_cards section
        if (newsArticles && newsArticles.length > 0) {
          const ncIndex = finalOtherSections.findIndex((s: any) => s.type === 'news_cards');
          if (ncIndex !== -1) {
            const nc = finalOtherSections[ncIndex];
            const mapped = (newsArticles as any[]).map((a) => ({
              title: a.title,
              excerpt: a.excerpt || "",
              date: a.published_at
                ? new Date(a.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
                : new Date(a.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
              image_url: a.image_url || "",
              link_url: `/news/${a.slug}`,
              tag: a.category,
              open_in_new: false,
            }));
            finalOtherSections[ncIndex] = {
              ...nc,
              content: {
                ...(nc.content && typeof nc.content === 'object' && !Array.isArray(nc.content) ? nc.content : {}),
                articles: mapped,
              }
            };
          }
        }

        // Keep contact_info and map_section props separate so map fields
        // never overwrite contact text fields (eyebrow, heading_line1, etc.)
        const contactProps =
          contactRow?.content && typeof contactRow.content === 'object' && !Array.isArray(contactRow.content)
            ? (contactRow.content as Record<string, unknown>)
            : {};
        const mapProps =
          mapRow?.content && typeof mapRow.content === 'object' && !Array.isArray(mapRow.content)
            ? (mapRow.content as Record<string, unknown>)
            : {};

        const combinedProps = { ...contactProps, ...mapProps };

        return (
          <>
            {finalOtherSections.map(renderWebsiteSectionWithFeatured)}
            {contactRow || mapRow ? (
              <ContactWithMapSection {...combinedProps} />
            ) : null}
          </>
        );
      })()}
    </>
  );
}
