import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageHeroSection from "@/components/website/sections/PageHeroSection";
import { renderWebsiteSection } from "@/lib/public-page-sections";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("title, meta")
    .eq("slug", "contact")
    .single();

  const meta = (page?.meta || {}) as {
    seo_title?: string;
    seo_description?: string;
  };

  return {
    title:
      meta.seo_title ||
      (page?.title ? `${page.title} — Caritas Rwanda` : "Contact Us — Caritas Rwanda"),
    description:
      meta.seo_description ||
      "Get in touch with Caritas Rwanda — reach our headquarters in Kigali, send us a message, or find us on the map.",
  };
}

export default async function ContactPage() {
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "contact")
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
      : "Get in Touch";

  const heading = String(heroRow?.heading ?? "");

  const subheading = String(heroRow?.subheading ?? "");

  const imageUrl =
    typeof heroRow?.image_url === "string" && heroRow.image_url.trim() !== ""
      ? heroRow.image_url
      : "/img/slide1.webp";

  const sectionsArr = sections ?? [];

  return (
    <>
      <PageHeroSection
        eyebrow={eyebrow}
        heading={heading}
        subheading={subheading}
        imageUrl={imageUrl}
        breadcrumbLabel="Contact"
      />
      {sectionsArr.map((section) => renderWebsiteSection(section))}
    </>
  );
}
