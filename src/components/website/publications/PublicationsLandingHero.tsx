import PageHeroSection from "@/components/website/sections/PageHeroSection";

export type PublicationsLandingHeroProps = {
  eyebrow: string;
  headlinePrefix: string;
  headlineAccent: string;
  intro: string;
  heroImageUrl?: string | null;
};

const DEFAULT_HERO_IMAGE = "/img/publications-hero.jpg";

export default function PublicationsLandingHero({
  eyebrow,
  headlinePrefix,
  headlineAccent,
  intro,
  heroImageUrl,
}: PublicationsLandingHeroProps) {
  const imageUrl =
    typeof heroImageUrl === "string" && heroImageUrl.trim()
      ? heroImageUrl.trim()
      : DEFAULT_HERO_IMAGE;

  return (
    <PageHeroSection
      imageUrl={imageUrl}
      eyebrow={eyebrow || "Knowledge & Transparency"}
      heading={`${(headlinePrefix || "Publications &").trim()} ${(headlineAccent || "Resources").trim()}`}
      headingAccent={(headlineAccent || "Resources").trim()}
      subheading={intro}
      breadcrumbLabel="Publications"
    />
  );
}
