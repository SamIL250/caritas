import PageHeroSection from "@/components/website/sections/PageHeroSection";

export type PublicationsLandingHeroProps = {
  eyebrow: string;
  headlinePrefix: string;
  headlineAccent: string;
  intro: string;
};

export default function PublicationsLandingHero({
  eyebrow,
  headlinePrefix,
  headlineAccent,
  intro,
}: PublicationsLandingHeroProps) {
  // original-website/publications.html uses img/slide2.jpg for the hero background
  return (
    <PageHeroSection
      imageUrl="/img/slide2.webp"
      eyebrow={eyebrow || "Resources & Research"}
      heading={`${(headlinePrefix || "Publications &").trim()} ${(headlineAccent || "Resources").trim()}`}
      headingAccent={(headlineAccent || "Resources").trim()}
      subheading={intro}
      breadcrumbLabel="Publications"
    />
  );
}
