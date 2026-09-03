import PageHeroSection from "@/components/website/sections/PageHeroSection";

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

const HERO_PILLAR_ORDER = [
  "finance-administration",
  "social-welfare",
  "health",
  "development",
] as const;

const HERO_PILLAR_LABELS: Record<(typeof HERO_PILLAR_ORDER)[number], string> = {
  "finance-administration": "Administration and Finance",
  "social-welfare": "Social Welfare",
  health: "Health",
  development: "Development",
};

const FALLBACK_PILLARS: ProgramsHeroPillar[] = HERO_PILLAR_ORDER.map((slug) => ({
  slug,
  label: HERO_PILLAR_LABELS[slug],
}));

function resolveHeroPillars(pillars?: ProgramsHeroPillar[]): ProgramsHeroPillar[] {
  if (!pillars?.length) return FALLBACK_PILLARS;

  const ordered = HERO_PILLAR_ORDER
    .map((slug) => {
      const match = pillars.find((pillar) => pillar.slug === slug);
      if (!match) return null;
      return {
        slug: match.slug,
        label: HERO_PILLAR_LABELS[slug] ?? match.label,
      };
    })
    .filter((pillar): pillar is ProgramsHeroPillar => Boolean(pillar));

  if (ordered.length >= 4) return ordered.slice(0, 4);
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
