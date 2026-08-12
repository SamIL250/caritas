import type { ReactNode } from "react";
import PageHeroSection from "@/components/website/sections/PageHeroSection";

export type NewsLandingHeroProps = {
  eyebrow: string;
  headlinePrefix: string;
  headlineAccent: string;
  intro: string;
  heroImageUrl?: string | null;
  breadcrumbLabel?: string;
  children?: ReactNode;
};

const DEFAULT_HERO_IMAGE = "/img/slide4.webp";

/** News / Stories landing hero — same inset PageHero as the public `/news` page. */
export default function NewsLandingHero({
  eyebrow,
  headlinePrefix,
  headlineAccent,
  intro,
  heroImageUrl,
  breadcrumbLabel = "Stories and Updates",
  children,
}: NewsLandingHeroProps) {
  const imageUrl =
    typeof heroImageUrl === "string" && heroImageUrl.trim()
      ? heroImageUrl.trim()
      : DEFAULT_HERO_IMAGE;

  const accent = (headlineAccent || "Updates").trim();
  const prefix = (headlinePrefix || "Stories and").trim();

  return (
    <PageHeroSection
      imageUrl={imageUrl}
      eyebrow={eyebrow || "Latest from Caritas Rwanda"}
      heading={`${prefix} ${accent}`}
      headingAccent={accent}
      subheading={intro}
      breadcrumbLabel={breadcrumbLabel}
    >
      {children}
    </PageHeroSection>
  );
}
