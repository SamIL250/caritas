import PageHeroSection from "@/components/website/sections/PageHeroSection";

export type ProgramsLandingHeroProps = {
  eyebrow: string;
  headlinePrefix: string;
  headlineAccent: string;
  intro: string;
  heroImageUrl?: string | null;
};

export default function ProgramsLandingHero({
  eyebrow,
  headlinePrefix,
  headlineAccent,
  intro,
  heroImageUrl,
}: ProgramsLandingHeroProps) {
  const imageUrl =
    typeof heroImageUrl === "string" && heroImageUrl.trim()
      ? heroImageUrl.trim()
      : "/img/slide3.webp";
  return (
    <PageHeroSection
      imageUrl={imageUrl}
      eyebrow={eyebrow || "What We Do"}
      heading={`${(headlinePrefix || "Programs that").trim()} ${(headlineAccent || "Transform Lives").trim()}`}
      headingAccent={(headlineAccent || "Transform Lives").trim()}
      subheading={intro}
      breadcrumbLabel="Programs"
    />
  );
}
