import type { Database } from "@/types/database.types";

export type NewsArticleCategory = Database["public"]["Enums"]["news_article_category"];
export type NewsArticleStatus = Database["public"]["Enums"]["news_article_status"];

export const NEWS_CATEGORIES: { value: NewsArticleCategory; label: string }[] = [
  { value: "development", label: "Development" },
  { value: "health", label: "Health & ECD" },
  { value: "organizational", label: "Organizational" },
  { value: "international", label: "International" },
  { value: "social", label: "Social Welfare" },
];

export function categoryLabel(cat: NewsArticleCategory): string {
  return NEWS_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}

/**
 * Map legacy news_topic enum to `program_categories.slug` when `department_id` is unset.
 * `international` has no default pillar.
 */
export function inferredDepartmentSlugFromLegacyNewsCategory(
  cat: NewsArticleCategory,
): string | null {
  switch (cat) {
    case "development":
      return "development";
    case "health":
      return "health";
    case "social":
      return "social-welfare";
    case "organizational":
      return "finance-administration";
    default:
      return null;
  }
}

/** Resolve program pillar slug from explicit department_id or legacy news category. */
export function effectiveNewsDepartmentSlug(
  article: Pick<NewsArticleRow, "department_id" | "category">,
  departmentSlugById: ReadonlyMap<string, string>,
): string | null {
  if (article.department_id) {
    return departmentSlugById.get(article.department_id) ?? null;
  }
  return inferredDepartmentSlugFromLegacyNewsCategory(article.category);
}

export type NewsArticleRow = Database["public"]["Tables"]["news_articles"]["Row"];

export type NewsPageSettingsRow = Database["public"]["Tables"]["news_page_settings"]["Row"];

export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
  return s || "story";
}

export function formatPublishedDate(iso: string | null): string {
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
