import type { Database, Json } from "@/types/database.types";

export type PublicationStatus = Database["public"]["Enums"]["publication_status"];
export type PublicationCategoryKind = Database["public"]["Enums"]["publication_category_kind"];
export type PublicationRow = Database["public"]["Tables"]["publications"]["Row"];
export type PublicationCategoryRow =
  Database["public"]["Tables"]["publication_categories"]["Row"];

/* ----------------------------- Category kinds ----------------------------- */

export const PUBLICATION_CATEGORY_KINDS: { value: PublicationCategoryKind; label: string; help: string }[] = [
  {
    value: "pdf",
    label: "PDF document",
    help: "PDF picker, cover image, period and meta line. Best for reports & newsletters.",
  },
  {
    value: "story",
    label: "Long-form story",
    help: "Cover image + rich body content. Tag and icon shown as a badge.",
  },
  {
    value: "external",
    label: "External link",
    help: "Article links elsewhere on the web. Cover image and date metadata.",
  },
  {
    value: "hybrid",
    label: "Hybrid",
    help: "Show PDF, story body, and external link together.",
  },
];

export function publicationKindLabel(kind: PublicationCategoryKind): string {
  return PUBLICATION_CATEGORY_KINDS.find((k) => k.value === kind)?.label ?? kind;
}

/* ---------------------------- Category behaviour --------------------------- */

export type PublicationCategoryBehavior = {
  /** Anchor id used on /publications (no `#`). */
  site_anchor?: string;
  /** Allow only one row marked featured at a time. */
  single_featured?: boolean;
  /** Render dashboard rows in a "news entry" style (image card, status, meta). */
  news_like?: boolean;
};

export function readCategoryBehavior(
  cat: Pick<PublicationCategoryRow, "behavior">,
): PublicationCategoryBehavior {
  const raw = cat.behavior as Json | null;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  return {
    site_anchor: typeof o.site_anchor === "string" ? o.site_anchor : undefined,
    single_featured: o.single_featured === true,
    news_like: o.news_like === true,
  };
}

/* --------------------------- Custom field schemas -------------------------- */

export type PublicationFieldType =
  | "text"
  | "textarea"
  | "url"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "checkbox"
  | "media"
  | "color";

export type PublicationFieldDef = {
  /** Stable JSON key used in `publications.custom_fields`. */
  key: string;
  /** Visible label in the form. */
  label: string;
  type: PublicationFieldType;
  required?: boolean;
  helper?: string;
  placeholder?: string;
  /** For select fields: list of options (`value` + `label`). */
  options?: { value: string; label: string }[];
};

export const PUBLICATION_FIELD_TYPES: { value: PublicationFieldType; label: string }[] = [
  { value: "text", label: "Single line" },
  { value: "textarea", label: "Multi-line" },
  { value: "url", label: "URL" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "datetime", label: "Date & time" },
  { value: "select", label: "Select / dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "media", label: "Media / file" },
  { value: "color", label: "Colour" },
];

export function readFieldSchema(cat: Pick<PublicationCategoryRow, "field_schema">): PublicationFieldDef[] {
  const raw = cat.field_schema as Json | null;
  if (!Array.isArray(raw)) return [];
  const out: PublicationFieldDef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const o = item as Record<string, unknown>;
    const key = typeof o.key === "string" ? o.key.trim() : "";
    const label = typeof o.label === "string" ? o.label.trim() : "";
    const type = (typeof o.type === "string" ? o.type : "text") as PublicationFieldType;
    if (!key || !label || !PUBLICATION_FIELD_TYPES.some((t) => t.value === type)) continue;
    const def: PublicationFieldDef = { key, label, type };
    if (o.required === true) def.required = true;
    if (typeof o.helper === "string" && o.helper.trim()) def.helper = o.helper.trim();
    if (typeof o.placeholder === "string" && o.placeholder.trim()) def.placeholder = o.placeholder.trim();
    if (Array.isArray(o.options)) {
      const opts = o.options
        .map((op) => {
          if (!op || typeof op !== "object" || Array.isArray(op)) return null;
          const oo = op as Record<string, unknown>;
          const value = typeof oo.value === "string" ? oo.value : "";
          const lbl = typeof oo.label === "string" ? oo.label : value;
          return value ? { value, label: lbl } : null;
        })
        .filter((x): x is { value: string; label: string } => Boolean(x));
      if (opts.length) def.options = opts;
    }
    out.push(def);
  }
  return out;
}

export function readCustomFields(row: Pick<PublicationRow, "custom_fields">): Record<string, Json> {
  const raw = row.custom_fields as Json | null;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, Json>;
}

/* ------------------------------ URL helpers ------------------------------- */

/** Public URL for cover or PDF: allow site-relative paths from media library. */
export function encodePublicationAssetUrl(url: string) {
  const t = url.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  const path = t.startsWith("/") ? t : `/${t}`;
  return encodeURI(path);
}

/** Prefer PDF `file_url`, else external article link. */
export function publicationPrimaryHref(row: Pick<PublicationRow, "file_url" | "external_url">): string {
  const f = row.file_url?.trim();
  if (f) return encodePublicationAssetUrl(f);
  const e = row.external_url?.trim();
  if (e) return e.startsWith("http") ? e : encodePublicationAssetUrl(e);
  return "#";
}

export function publicationHasPdf(row: Pick<PublicationRow, "file_url">): boolean {
  return Boolean(row.file_url?.trim());
}

/* --------------- Convenience: built-in slugs (rendering only) -------------- */

export const PUBLICATION_BUILTIN_SLUGS = [
  "strategic_plan",
  "annual_report",
  "newsletter",
  "success_story",
  "recent_update",
] as const;

export type PublicationBuiltinSlug = (typeof PUBLICATION_BUILTIN_SLUGS)[number];

export function publicationCategoryLabel(
  slug: string,
  catMap?: Map<string, PublicationCategoryRow>,
): string {
  const cat = catMap?.get(slug);
  if (cat?.label) return cat.label;
  return PUBLICATION_BUILTIN_LABELS[slug as PublicationBuiltinSlug] ?? slug;
}

export const PUBLICATION_BUILTIN_LABELS: Record<PublicationBuiltinSlug, string> = {
  strategic_plan: "Strategic Plan",
  annual_report: "Annual Report",
  newsletter: "Newsletter",
  success_story: "Success Story",
  recent_update: "Recent Update",
};
