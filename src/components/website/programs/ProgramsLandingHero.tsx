import PageHeroSection from "@/components/website/sections/PageHeroSection";
import {
  DEFAULT_PROGRAMS_HERO_CAPTION,
  DEFAULT_PROGRAMS_HERO_DEPARTMENTS,
  type ProgramsHeroDepartment,
} from "@/lib/programs-hero-departments";

export type ProgramsHeroPillar = ProgramsHeroDepartment;

export type ProgramsLandingHeroProps = {
  headlinePrefix: string;
  headlineAccent: string;
  intro: string;
  heroImageUrl?: string | null;
  pillars?: ProgramsHeroPillar[];
  caption?: string;
  /** @deprecated Badge is no longer shown on the programs hero. */
  eyebrow?: string;
};

function resolveHeroPillars(pillars?: ProgramsHeroPillar[]): ProgramsHeroPillar[] {
  if (!pillars?.length) {
    return DEFAULT_PROGRAMS_HERO_DEPARTMENTS.map((item) => ({ ...item }));
  }
  return pillars
    .filter((pillar) => pillar.label.trim())
    .slice(0, 4)
    .map((pillar) => ({
      slug: pillar.slug.trim(),
      label: pillar.label.trim(),
    }));
}

export default function ProgramsLandingHero({
  headlinePrefix,
  headlineAccent,
  heroImageUrl,
  pillars,
  caption,
}: ProgramsLandingHeroProps) {
  const imageUrl =
    typeof heroImageUrl === "string" && heroImageUrl.trim()
      ? heroImageUrl.trim()
      : "/img/slide3.webp";
  const items = resolveHeroPillars(pillars);
  const captionText = caption?.trim() || DEFAULT_PROGRAMS_HERO_CAPTION;

  return (
    <PageHeroSection
      imageUrl={imageUrl}
      eyebrow=""
      heading={`${(headlinePrefix || "Programs that").trim()} ${(headlineAccent || "Transform Lives").trim()}`}
      headingAccent={(headlineAccent || "Transform Lives").trim()}
      subheading=""
      showBreadcrumb={false}
    >
      <div className="prog-hero-pillars">
        <ul className="prog-hero-pillars__grid">
          {items.map((pillar) => (
            <li key={`${pillar.slug}-${pillar.label}`} className="prog-hero-pillars__cell">
              <a href={`#${pillar.slug}`} className="prog-hero-pillars__item">
                <span className="prog-hero-pillars__label">{pillar.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="prog-hero-pillars__title">{captionText}</p>
      </div>
    </PageHeroSection>
  );
}
