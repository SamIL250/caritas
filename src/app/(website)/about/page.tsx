import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { renderWebsiteSection } from "@/lib/public-page-sections";
import PageHeroSection from "@/components/website/sections/PageHeroSection";
import ChairpersonSection from "@/components/website/sections/ChairpersonSection";
import HistoryBentoSection from "@/components/website/sections/HistoryBentoSection";
import MissionVisionValuesSection from "@/components/website/sections/MissionVisionValuesSection";

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
      "Discover Caritas Rwanda’s history, mission, values, and nationwide humanitarian network.",
  };
}

function sectionContent(
  content: unknown,
): Record<string, unknown> {
  return content && typeof content === "object" && !Array.isArray(content)
    ? (content as Record<string, unknown>)
    : {};
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

  return (
    <div className="about-page-content">
      <PageHeroSection
        eyebrow={eyebrow}
        heading={heading}
        headingAccent={headingAccent}
        subheading={subheading}
        imageUrl={imageUrl}
        breadcrumbLabel="About Us"
        quickNav={quickNav}
      />
      {sectionsArr.flatMap((section) => {
        switch (section.type) {
          case "stats_banner":
            return [];
          case "featured_quote": {
            const c = sectionContent(section.content);
            return [
              <ChairpersonSection
                key={section.id}
                name={c.name as string}
                title={c.subtitle as string}
                quote={c.quote as string}
                meta={c.meta as string}
                photoUrl={(c.photo_url as string) || "/img/Chairperson/anaclet.jpg"}
              />,
            ];
          }
          case "timeline":
            return [<HistoryBentoSection key={section.id} />];
          case "pillar_cards":
            return [];
          case "values_grid":
            return [<MissionVisionValuesSection key={section.id} />];
          case "network_section":
            return [renderWebsiteSection(section)];
          case "leadership_grid":
            return [renderWebsiteSection(section)];
          default:
            return [renderWebsiteSection(section)];
        }
      })}
    </div>
  );
}
