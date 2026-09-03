import PageHeroSection from "@/components/website/sections/PageHeroSection";
import { CANONICAL_PROGRAMS } from "@/lib/program-cards-defaults";
import { PROGRAM_BUILTIN_SLUGS } from "@/lib/programs";

export type ProgramsHeroPillar = {
  slug: string;
  label: string;
};

export type ProgramsLandingHeroProps = {
  headlinePrefix: string;
  headlineAccent: string;
  intro: string;
  heroImageUrl?: string | null;
  pillars?: ProgramsHeroPillar[];
  /** @deprecated Badge is no longer shown on the programs hero. */
  eyebrow?: string;
};

const FALLBACK_PILLARS: ProgramsHeroPillar[] = CANONICAL_PROGRAMS.map((program, index) => ({
  slug: PROGRAM_BUILTIN_SLUGS[index] ?? `pillar-${index + 1}`,
  label: program.title,
}));

function resolveHeroPillars(pillars?: ProgramsHeroPillar[]): ProgramsHeroPillar[] {
  if (!pillars?.length) return FALLBACK_PILLARS;

  const builtins = PROGRAM_BUILTIN_SLUGS
    .map((slug) => pillars.find((pillar) => pillar.slug === slug))
    .filter((pillar): pillar is ProgramsHeroPillar => Boolean(pillar));

  if (builtins.length >= 4) return builtins.slice(0, 4);
  return pillars.slice(0, 4);
}

export default function ProgramsLandingHero({
  headlinePrefix,
  headlineAccent,
  heroImageUrl,
  pillars,
}: ProgramsLandingHeroProps) {
  const imageUrl =
    typeof heroImageUrl === "string" && heroImageUrl.trim()
      ? heroImageUrl.trim()
      : "/img/slide3.webp";
  const items = resolveHeroPillars(pillars);

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
            <li key={pillar.slug} className="prog-hero-pillars__cell">
              <a href={`#${pillar.slug}`} className="prog-hero-pillars__item">
                <span className="prog-hero-pillars__label">{pillar.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="prog-hero-pillars__title">Departments</p>
      </div>
    </PageHeroSection>
  );
}
