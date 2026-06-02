import PageHeroSection from "@/components/website/sections/PageHeroSection";

export type ProgramsLandingHeroProps = {
  eyebrow: string;
  headlinePrefix: string;
  headlineAccent: string;
  intro: string;
};

export default function ProgramsLandingHero({
  eyebrow,
  headlinePrefix,
  headlineAccent,
  intro,
}: ProgramsLandingHeroProps) {
  // original-website/programs.html uses img/slide3.jpg for the hero background
  return (
    <PageHeroSection
      imageUrl="/img/slide3.webp"
      eyebrow={eyebrow || "What We Do"}
      heading={`${(headlinePrefix || "Programs that").trim()} ${(headlineAccent || "Transform Lives").trim()}`}
      headingAccent={(headlineAccent || "Transform Lives").trim()}
      subheading={intro}
      breadcrumbLabel="Programs"
    />
  );
}
