import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageHeroSection from "@/components/website/sections/PageHeroSection";
import ContactInfo from "@/components/website/sections/ContactInfo";
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
      (page?.title ? `${page.title} | Caritas Rwanda` : "Contact Us | Caritas Rwanda"),
    description:
      meta.seo_description ||
      "Get in touch with Caritas Rwanda — send us a message and our team will respond within 24 hours.",
  };
}

export default async function ContactPage() {
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "contact")
    .single();

  const pageId = page?.id;

  let heroRow: Record<string, unknown> | null = null;
  let sections: any[] = [];

  if (pageId) {
    const { data: hero } = await supabase
      .from("hero_content")
      .select("*")
      .eq("page_id", pageId)
      .maybeSingle();
    heroRow = hero as Record<string, unknown> | null;

    const { data: s } = await supabase
      .from("sections")
      .select("*")
      .eq("page_id", pageId)
      .eq("visible", true)
      .order("order", { ascending: true });
    sections = s || [];

    const hasContactInfo = sections.some((s: any) => s.type === "contact_info");
    if (!hasContactInfo) {
      const { ensureContactPageSections } = await import(
        "@/app/actions/init-contact-sections"
      );
      await ensureContactPageSections(pageId);
      const { data: refreshed } = await supabase
        .from("sections")
        .select("*")
        .eq("page_id", pageId)
        .eq("visible", true)
        .order("order", { ascending: true });
      sections = refreshed || [];
    }
  }

  const options =
    heroRow?.options &&
    typeof heroRow.options === "object" &&
    !Array.isArray(heroRow.options)
      ? (heroRow.options as Record<string, unknown>)
      : {};

  const eyebrow =
    typeof options?.badge_text === "string" && options.badge_text.trim() !== ""
      ? options.badge_text
      : "Get In Touch";

  const heading = String(heroRow?.heading || "Contact Us");
  const headingAccent =
    typeof options?.heading_accent === "string" ? options.heading_accent : "";

  const subheading = String(
    heroRow?.subheading ||
      "Please reach out to our headquarters in Kigali for any inquiries. We look forward to connecting with you."
  );

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
            ? n.icon.replace(/^fa-solid\\s+/i, "").trim() || undefined
            : undefined,
      }))
    : [];

  const contactRow = sections.find((s: any) => s.type === "contact_info");
  const otherSections = sections.filter(
    (s: any) => s.type !== "contact_info" && s.type !== "map_section"
  );

  const contactProps =
    contactRow?.content &&
    typeof contactRow.content === "object" &&
    !Array.isArray(contactRow.content)
      ? (contactRow.content as Record<string, unknown>)
      : {};

  return (
    <>
      <PageHeroSection
        eyebrow={eyebrow}
        heading={heading}
        headingAccent={headingAccent}
        subheading={subheading}
        imageUrl={imageUrl}
        breadcrumbLabel="Contact"
        quickNav={quickNav}
      />

      <ContactInfo {...contactProps} />

      {otherSections.map((section: any) => {
        return renderWebsiteSection(section);
      })}
    </>
  );
}
