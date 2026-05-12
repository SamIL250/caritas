import React from "react";

import type { Json } from "@/types/database.types";

import TextBlock from "@/components/website/sections/TextBlock";
import ProgramCards from "@/components/website/sections/ProgramCards";
import NewsCards from "@/components/website/sections/NewsCards";
import CTA from "@/components/website/sections/CTA";
import PartnersSection from "@/components/website/sections/PartnersSection";
import ContactInfo from "@/components/website/sections/ContactInfo";
import Gallery from "@/components/website/sections/Gallery";
import ImageGrid from "@/components/website/sections/ImageGrid";
import Divider from "@/components/website/sections/Divider";
import OurLocationSection from "@/components/website/sections/OurLocationSection";
import StatsBannerSection from "@/components/website/sections/StatsBannerSection";
import FeaturedQuoteSection from "@/components/website/sections/FeaturedQuoteSection";
import TimelineSection from "@/components/website/sections/TimelineSection";
import PillarCardsSection from "@/components/website/sections/PillarCardsSection";
import ValuesGridSection from "@/components/website/sections/ValuesGridSection";
import NetworkSection from "@/components/website/sections/NetworkSection";
import LeadershipGridSection from "@/components/website/sections/LeadershipGridSection";
import AboutSection from "@/components/website/sections/AboutSection";
import VideoGallerySection from "@/components/website/sections/VideoGallerySection";
import DioceseMapSection from "@/components/website/sections/DioceseMapSection";

export type PublicSectionRow = {
  id: string;
  type: string;
  content?: Json | null;
};

/** Maps CMS section_type values to website section components (home + inner pages). */
const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  text_block: TextBlock,
  program_cards: ProgramCards,
  news_cards: NewsCards,
  cta: CTA,
  partners: PartnersSection,
  contact_info: ContactInfo,
  gallery: Gallery,
  image_grid: ImageGrid,
  divider: Divider,
  map_section: OurLocationSection,
  stats_banner: StatsBannerSection,
  featured_quote: FeaturedQuoteSection,
  timeline: TimelineSection,
  pillar_cards: PillarCardsSection,
  values_grid: ValuesGridSection,
  network_section: NetworkSection,
  leadership_grid: LeadershipGridSection,
  home_about: AboutSection,
  video_gallery: VideoGallerySection,
  diocese_map_section: DioceseMapSection,
};

export function renderWebsiteSection(section: PublicSectionRow) {
  const { type, content } = section;
  const Component = SECTION_COMPONENTS[type];
  if (!Component) return null;
  const props =
    content && typeof content === "object" && !Array.isArray(content)
      ? (content as Record<string, unknown>)
      : {};
  return <Component key={section.id} {...props} />;
}

export function renderWebsiteSections(
  sections: PublicSectionRow[] | null | undefined,
) {
  if (!sections?.length) return null;
  return sections.map((section) => renderWebsiteSection(section));
}
