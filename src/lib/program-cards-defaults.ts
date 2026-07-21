/** Default content for the homepage program_cards section (four pillar tabs). */

export const PROGRAM_SLOT_LEARN_MORE_HREF: readonly string[] = [
  "/programs#social-welfare",
  "/programs#health",
  "/programs#development",
  "/programs#finance-administration",
];

export interface ProgramCardItem {
  title: string;
  description: string;
  icon: string;
  link_url: string;
  image_url: string;
  tab_label?: string;
  bullets?: string[];
}

/** Canonical slot order: Social Welfare → Health → Development → Admin & Finance. */
export const CANONICAL_PROGRAMS: ProgramCardItem[] = [
  {
    tab_label: "Social\nWelfare",
    title: "Social Welfare",
    description:
      "Community mobilization, support and advocacy for the most vulnerable people — providing safety nets, emergency assistance, and dignity-restoring support systems for Rwanda's most vulnerable families and communities.",
    bullets: [
      "Community support & social protection",
      "Emergency humanitarian response",
      "Social advocacy & inclusion programs",
    ],
    icon: "fa-solid fa-people-roof",
    link_url: PROGRAM_SLOT_LEARN_MORE_HREF[0],
    image_url: "/img/bg_1.webp",
  },
  {
    tab_label: "Health",
    title: "Health",
    description:
      "Healthcare services, medical support, and health education for communities in need — improving maternal and child health outcomes, community nutrition, and healthcare access across all nine dioceses.",
    bullets: [
      "Maternal & child healthcare",
      "Community health outreach programs",
      "Nutrition, wellness & disease prevention",
    ],
    icon: "fa-solid fa-heart-pulse",
    link_url: PROGRAM_SLOT_LEARN_MORE_HREF[1],
    image_url: "/img/health.webp",
  },
  {
    tab_label: "Development",
    title: "Development",
    description:
      "Sustainable development programs focused on education, agriculture, and economic empowerment — building long-term resilience through vocational training, microfinance, and community-led initiatives.",
    bullets: [
      "Vocational training & skills development",
      "Sustainable livelihoods & agriculture",
      "Microfinance & economic empowerment",
    ],
    icon: "fa-solid fa-seedling",
    link_url: PROGRAM_SLOT_LEARN_MORE_HREF[2],
    image_url: "/img/bg_2.webp",
  },
  {
    tab_label: "Admin &\nFinance",
    title: "Administration & Finance",
    description:
      "Organizational management, financial oversight, and operational excellence — ensuring transparent governance, sound financial stewardship, and accountability that sustains Caritas Rwanda's mission across Rwanda.",
    bullets: [
      "Transparent governance & oversight",
      "Financial stewardship & reporting",
      "Operational accountability & compliance",
    ],
    icon: "fa-solid fa-building-columns",
    link_url: PROGRAM_SLOT_LEARN_MORE_HREF[3],
    image_url: "/img/slide5.webp",
  },
];

export const PROGRAM_SLOT_TITLES = [
  "Social Welfare",
  "Health",
  "Development",
  "Administration & Finance",
] as const;

export function mergeProgramCardSlot(
  base: ProgramCardItem,
  item: Partial<ProgramCardItem> = {},
): ProgramCardItem {
  return {
    ...base,
    ...item,
    title: item.title?.trim() || base.title,
    tab_label: item.tab_label?.trim() || base.tab_label,
    bullets:
      item.bullets && item.bullets.length > 0 ? [...item.bullets] : [...(base.bullets ?? [])],
  };
}

export function ensureProgramCardSlots(raw?: Partial<ProgramCardItem>[]): ProgramCardItem[] {
  const cur = Array.isArray(raw) ? raw : [];
  return CANONICAL_PROGRAMS.map((def, i) => mergeProgramCardSlot(def, cur[i]));
}

/** Fill four program slots when CMS content is missing or empty (editor + save). */
export function hydrateProgramCardsContent(
  content: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  const base = content && typeof content === "object" ? { ...content } : {};
  const raw = base.programs;
  const cur = Array.isArray(raw) ? (raw as Partial<ProgramCardItem>[]) : [];

  if (cur.length >= 4 && cur.every((p) => p && typeof p === "object" && p.title?.trim())) {
    return base;
  }

  return { ...base, programs: ensureProgramCardSlots(cur) };
}
