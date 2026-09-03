export type ProgramsHeroDepartment = {
  label: string;
  slug: string;
};

export const DEFAULT_PROGRAMS_HERO_DEPARTMENTS: ProgramsHeroDepartment[] = [
  { label: "Administration and Finance", slug: "finance-administration" },
  { label: "Social Welfare", slug: "social-welfare" },
  { label: "Health", slug: "health" },
  { label: "Development", slug: "development" },
];

export const DEFAULT_PROGRAMS_HERO_CAPTION = "Departments";

export const PROGRAMS_HERO_LEFT_COUNT = 2;

function readDepartment(
  raw: unknown,
  fallback: ProgramsHeroDepartment,
): ProgramsHeroDepartment {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...fallback };
  }
  const row = raw as Record<string, unknown>;
  const label =
    typeof row.label === "string" && row.label.trim()
      ? row.label.trim()
      : fallback.label;
  const slug =
    typeof row.slug === "string" && row.slug.trim()
      ? row.slug.trim()
      : fallback.slug;
  return { label, slug };
}

export function parseProgramsHeroDepartments(raw: unknown): ProgramsHeroDepartment[] {
  const defaults = DEFAULT_PROGRAMS_HERO_DEPARTMENTS.map((item) => ({ ...item }));
  if (!Array.isArray(raw)) return defaults;

  return defaults.map((fallback, index) => readDepartment(raw[index], fallback));
}

export function parseProgramsHeroCaption(raw: unknown): string {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return DEFAULT_PROGRAMS_HERO_CAPTION;
}

export function parseProgramsHeroDepartmentsFromOptions(options: unknown): {
  departments: ProgramsHeroDepartment[];
  caption: string;
} {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? (options as Record<string, unknown>)
      : {};
  return {
    departments: parseProgramsHeroDepartments(opts.hero_departments),
    caption: parseProgramsHeroCaption(opts.departments_caption),
  };
}
