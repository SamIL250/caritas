import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageHeroSection from "@/components/website/sections/PageHeroSection";
import { renderWebsiteSectionsWithFeatured } from "@/lib/public-page-sections-server";

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
      : "/img/slide1.png";

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

  return (
    <main className="about-page-content">
      <PageHeroSection
        eyebrow={eyebrow}
        heading={heading}
        headingAccent={headingAccent}
        subheading={subheading}
        imageUrl={imageUrl}
        breadcrumbLabel="About Us"
        quickNav={quickNav}
      />
      {renderWebsiteSectionsWithFeatured(sections)}
    </main>
  );
}
