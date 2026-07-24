export type ProgramsLibrarySectionContent = {
  bubble_initial_count: number;
  view_all_label: string;
  view_all_less_label: string;
  show_success_stories: boolean;
  show_news: boolean;
};

export type ProgramsPartnerSectionContent = {
  eyebrow: string;
  eyebrow_icon: string;
  title: string;
  subtitle: string;
  primary_label: string;
  secondary_label: string;
  secondary_action: "back_to_top" | "contact";
  outline_label: string;
  outline_href: string;
};

export const DEFAULT_PROGRAMS_LIBRARY_SECTION: ProgramsLibrarySectionContent = {
  bubble_initial_count: 3,
  view_all_label: "View All Programs",
  view_all_less_label: "Show Less",
  show_success_stories: true,
  show_news: true,
};

export const DEFAULT_PROGRAMS_PARTNER_SECTION: ProgramsPartnerSectionContent = {
  eyebrow: "Partner With Us",
  eyebrow_icon: "fa-handshake",
  title: "Join the Mission of\nHuman Dignity",
  subtitle:
    "Whether you want to donate, volunteer, or partner with us — every act of solidarity helps Caritas Rwanda reach more families across the country.",
  primary_label: "Donate Now",
  secondary_label: "Back to Top",
  secondary_action: "back_to_top",
  outline_label: "Contact Us",
  outline_href: "/contact",
};

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function readCount(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(12, Math.max(1, Math.round(n)));
}

export function parseProgramsLibrarySectionContent(
  raw: unknown,
): ProgramsLibrarySectionContent {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_PROGRAMS_LIBRARY_SECTION };
  }
  const c = raw as Record<string, unknown>;
  return {
    bubble_initial_count: readCount(
      c.bubble_initial_count,
      DEFAULT_PROGRAMS_LIBRARY_SECTION.bubble_initial_count,
    ),
    view_all_label: readString(c.view_all_label, DEFAULT_PROGRAMS_LIBRARY_SECTION.view_all_label),
    view_all_less_label: readString(
      c.view_all_less_label,
      DEFAULT_PROGRAMS_LIBRARY_SECTION.view_all_less_label,
    ),
    show_success_stories: readBoolean(
      c.show_success_stories,
      DEFAULT_PROGRAMS_LIBRARY_SECTION.show_success_stories,
    ),
    show_news: readBoolean(c.show_news, DEFAULT_PROGRAMS_LIBRARY_SECTION.show_news),
  };
}

export function parseProgramsPartnerSectionContent(
  raw: unknown,
): ProgramsPartnerSectionContent {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_PROGRAMS_PARTNER_SECTION };
  }
  const c = raw as Record<string, unknown>;
  const action =
    c.secondary_action === "contact" ? "contact" : DEFAULT_PROGRAMS_PARTNER_SECTION.secondary_action;
  return {
    eyebrow: readString(c.eyebrow, DEFAULT_PROGRAMS_PARTNER_SECTION.eyebrow),
    eyebrow_icon: readString(c.eyebrow_icon, DEFAULT_PROGRAMS_PARTNER_SECTION.eyebrow_icon),
    title: readString(c.title, DEFAULT_PROGRAMS_PARTNER_SECTION.title),
    subtitle: readString(c.subtitle, DEFAULT_PROGRAMS_PARTNER_SECTION.subtitle),
    primary_label: readString(c.primary_label, DEFAULT_PROGRAMS_PARTNER_SECTION.primary_label),
    secondary_label: readString(c.secondary_label, DEFAULT_PROGRAMS_PARTNER_SECTION.secondary_label),
    secondary_action: action,
    outline_label: readString(c.outline_label, DEFAULT_PROGRAMS_PARTNER_SECTION.outline_label),
    outline_href: readString(c.outline_href, DEFAULT_PROGRAMS_PARTNER_SECTION.outline_href),
  };
}
