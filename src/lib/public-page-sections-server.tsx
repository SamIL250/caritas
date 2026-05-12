import FeaturedCampaignSection from "@/components/website/sections/FeaturedCampaignSection";

import type { Json } from "@/types/database.types";

import type { PublicSectionRow } from "@/lib/public-page-sections";
import { renderWebsiteSection } from "@/lib/public-page-sections";

function sectionProps(content: Json | null | undefined): Record<string, unknown> {
  return content && typeof content === "object" && !Array.isArray(content)
    ? (content as Record<string, unknown>)
    : {};
}

/** Server-only: includes async FeaturedCampaignSection (Supabase server client). Do not import from client modules. */
export function renderWebsiteSectionWithFeatured(section: PublicSectionRow) {
  const { type, content } = section;
  if (type === "featured_campaign") {
    const props = sectionProps(content);
    return <FeaturedCampaignSection key={section.id} {...props} />;
  }
  return renderWebsiteSection(section);
}

export function renderWebsiteSectionsWithFeatured(sections: PublicSectionRow[] | null | undefined) {
  if (!sections?.length) return null;
  return sections.map((s) => renderWebsiteSectionWithFeatured(s));
}
