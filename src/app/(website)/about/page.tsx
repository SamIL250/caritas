import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { renderWebsiteSection } from "@/lib/public-page-sections";
import AboutPageSwitcher from "@/components/website/about/AboutPageSwitcher";
import HistoryBentoSection from "@/components/website/sections/HistoryBentoSection";
import MissionVisionValuesSection from "@/components/website/sections/MissionVisionValuesSection";
import {
  parseMissionVisionContent,
  parseValuesGridContent,
} from "@/lib/mission-vision-values";
import { ABOUT_SECTION_NAV, hrefToAboutAnchor } from "@/lib/about-section-nav";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("title, meta")
    .eq("slug", "about")
    .single();

  const meta = (page?.meta || {}) as {
    seo_title?: string;
    seo_description?: string;
  };

  return {
    title:
      meta.seo_title ||
      (page?.title ? `${page.title} — Caritas Rwanda` : "About Us — Caritas Rwanda"),
    description:
      meta.seo_description ||
      "Discover Caritas Rwanda's history, mission, values, and nationwide humanitarian network.",
  };
}

function sectionContent(content: unknown): Record<string, unknown> {
  return content && typeof content === "object" && !Array.isArray(content)
    ? (content as Record<string, unknown>)
    : {};
}

function anchorFromSection(section: { type: string; content?: unknown }): string | null {
  const c = sectionContent(section.content);
  if (typeof c.anchor_id === "string" && c.anchor_id.trim()) {
    return c.anchor_id.trim();
  }

  switch (section.type) {
    case "timeline":
      return "history";
    case "pillar_cards":
      return "mission";
    case "values_grid":
      return "values";
    case "network_section":
    case "diocese_map_section":
      return "network";
    case "leadership_grid":
      return "leadership";
    default:
      return null;
  }
}

export default async function AboutPage() {
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "about")
    .single();

  if (!page || typeof page.id !== "string") {
    return notFound();
  }

  const pageId = page.id;

  const { data: hero } = await supabase
    .from("hero_content")
    .select("*")
    .eq("page_id", pageId)
    .maybeSingle();

  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .eq("page_id", pageId)
    .eq("visible", true)
    .order("order", { ascending: true });

  const heroRow = hero as Record<string, unknown> | null;
  const options =
    heroRow?.options &&
    typeof heroRow.options === "object" &&
    !Array.isArray(heroRow.options)
      ? (heroRow.options as Record<string, unknown>)
      : {};

  const eyebrow =
    typeof options?.badge_text === "string" && options.badge_text.trim() !== ""
      ? options.badge_text
      : "About Caritas Rwanda";

  const heading = String(heroRow?.heading ?? "");
  const headingAccent =
    typeof options?.heading_accent === "string" ? options.heading_accent : "";

  const subheading = String(heroRow?.subheading ?? "");

  const imageUrl =
    typeof heroRow?.image_url === "string" && heroRow.image_url.trim() !== ""
      ? heroRow.image_url
      : "/img/slide1.webp";

  const canonicalNavLabels = Object.fromEntries(
    ABOUT_SECTION_NAV.map((item) => [hrefToAboutAnchor(item.href), item.label]),
  ) as Record<string, string>;

  const rawNav = options.quick_nav as
    | Array<{ label: string; href: string; icon?: string }>
    | undefined;
  const quickNav = Array.isArray(rawNav)
    ? rawNav.map((n) => ({
        label: n.label,
        href: n.href,
        icon:
          typeof n.icon === "string"
            ? n.icon.replace(/^fa-solid\s+/i, "").trim() || undefined
            : undefined,
      }))
    : [];

  const sectionsArr = sections ?? [];

  const panels: Record<string, ReactNode> = {};

  for (const section of sectionsArr) {
    const anchor = anchorFromSection(section);
    if (!anchor || panels[anchor]) continue;

    switch (section.type) {
      case "stats_banner":
      case "featured_quote":
      case "contact_info":
      case "map_section":
        break;
      case "timeline":
        panels[anchor] = <HistoryBentoSection key={section.id} />;
        break;
      case "pillar_cards":
        panels[anchor] = (
          <MissionVisionValuesSection
            key={section.id}
            showValues={false}
            {...parseMissionVisionContent(section.content)}
          />
        );
        break;
      case "values_grid":
        panels[anchor] = (
          <MissionVisionValuesSection
            key={section.id}
            showMissionVision={false}
            {...parseValuesGridContent(section.content)}
          />
        );
        break;
      case "network_section":
      case "diocese_map_section":
      case "leadership_grid":
        panels[anchor] = renderWebsiteSection(section);
        break;
      default:
        break;
    }
  }

  if (!panels.mission) {
    panels.mission = (
      <MissionVisionValuesSection key="mission-fallback" showValues={false} />
    );
  }

  if (!panels.values) {
    panels.values = (
      <MissionVisionValuesSection key="values-fallback" showMissionVision={false} />
    );
  }

  const panelAnchors = new Set(Object.keys(panels));
  const quickNavSource = quickNav.length > 0 ? quickNav : [...ABOUT_SECTION_NAV];
  const filteredQuickNav = quickNavSource
    .filter((item) => panelAnchors.has(hrefToAboutAnchor(item.href)))
    .map((item) => {
      const anchor = hrefToAboutAnchor(item.href);
      const canonicalLabel = canonicalNavLabels[anchor];
      return canonicalLabel ? { ...item, label: canonicalLabel } : item;
    });

  return (
    <AboutPageSwitcher
      hero={{
        eyebrow,
        heading,
        headingAccent,
        subheading,
        imageUrl,
        breadcrumbLabel: "About Us",
      }}
      quickNav={filteredQuickNav}
      panels={panels}
    />
  );
}
