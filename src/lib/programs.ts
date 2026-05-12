import type { Database } from "@/types/database.types";

export type ProgramStatus = Database["public"]["Enums"]["program_status"];
export type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
export type ProgramCategoryRow =
  Database["public"]["Tables"]["program_categories"]["Row"];

/* ----------------------------- URL helpers ----------------------------- */

export function encodeProgramAssetUrl(url: string): string {
  const t = url.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  const path = t.startsWith("/") ? t : `/${t}`;
  return encodeURI(path);
}

export function programDetailHref(row: Pick<ProgramRow, "slug">): string {
  return `/programs/${row.slug}`;
}

export function programPrimaryHref(row: Pick<ProgramRow, "slug" | "external_url">): string {
  const ext = row.external_url?.trim();
  if (ext) return ext.startsWith("http") ? ext : encodeProgramAssetUrl(ext);
  return programDetailHref(row);
}

/* ---------------------------- Slug helpers ---------------------------- */

/** Hyphen-friendly slug compatible with the table CHECK constraint. */
export function slugifyProgram(input: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
  return s || "program";
}

export function slugifyCategorySlug(input: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return s;
}

/* ------------------------ Built-in metadata --------------------------- */

export const PROGRAM_BUILTIN_SLUGS = [
  "social-welfare",
  "health",
  "development",
  "finance-administration",
] as const;

export type ProgramBuiltinSlug = (typeof PROGRAM_BUILTIN_SLUGS)[number];

export function programCategoryLabel(
  slug: string,
  catMap?: Map<string, ProgramCategoryRow>,
): string {
  const cat = catMap?.get(slug);
  if (cat?.label) return cat.label;
  return slug
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/* --------------------------- Date formatting -------------------------- */

export function formatProgramDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
