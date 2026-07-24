import { createClient } from "@/lib/supabase/server";
import { sortByPublishedNewest } from "@/lib/content-sort";
import { effectiveNewsDepartmentSlug, formatPublishedDate, type NewsArticleRow } from "@/lib/news";
import {
  encodePublicationAssetUrl,
  publicationDetailHref,
  type PublicationRow,
} from "@/lib/publications";
import { fetchProgramCategories } from "@/app/(website)/programs/get-programs-data";
import { fetchPublishedTestimonies } from "@/app/(website)/publications/get-publications-data";
import { testimonyDetailHref, type TestimonyRow } from "@/lib/testimonies";

export type NavMegaPreviewItem = {
  id: string;
  title: string;
  href: string;
  dateLabel: string;
  imageUrl: string | null;
  year: number | null;
};

export type NavMegaYearGroup = {
  year: number;
  items: NavMegaPreviewItem[];
};

export type NavMegaCategory = {
  id: string;
  label: string;
  href: string;
  icon: string;
  years: number[];
  yearGroups: NavMegaYearGroup[];
};

export type NavMegaMenuData = {
  news: NavMegaCategory[];
  publications: NavMegaCategory[];
};

const PREVIEW_LIMIT = 15;

const NEWS_NAV_SLUGS = [
  "social-welfare",
  "health",
  "development",
  "finance-administration",
] as const;

const NEWS_NAV_ICONS: Record<(typeof NEWS_NAV_SLUGS)[number], string> = {
  "social-welfare": "fa-people-roof",
  health: "fa-heart-pulse",
  development: "fa-seedling",
  "finance-administration": "fa-building-columns",
};

const PUBLICATIONS_NAV_CONFIG: Array<
  | { kind: "publication"; slug: string; anchor: string; icon: string; label: string; dividerBefore?: boolean }
  | { kind: "testimonies"; anchor: string; icon: string; label: string; dividerBefore?: boolean }
> = [
  { kind: "publication", slug: "annual_report", anchor: "annual-reports", icon: "fa-chart-bar", label: "Annual Reports" },
  { kind: "publication", slug: "newsletter", anchor: "newsletters", icon: "fa-newspaper", label: "Newsletters" },
  { kind: "publication", slug: "caritas_contact", anchor: "caritas-contact", icon: "fa-download", label: "Caritas Contact" },
  { kind: "publication", slug: "policies", anchor: "policies", icon: "fa-file-lines", label: "Policies" },
  { kind: "testimonies", anchor: "testimonies", icon: "fa-user", label: "Testimonies" },
  {
    kind: "publication",
    slug: "strategic_plan",
    anchor: "strategic",
    icon: "fa-map",
    label: "Strategic Plan",
    dividerBefore: true,
  },
];

function publishedYear(iso: string | null): number | null {
  if (!iso) return null;
  const year = new Date(iso).getFullYear();
  return Number.isNaN(year) ? null : year;
}

function takeLatest<T>(rows: T[], limit = PREVIEW_LIMIT): T[] {
  return rows.slice(0, limit);
}

function groupItemsByYear(items: NavMegaPreviewItem[]): {
  years: number[];
  yearGroups: NavMegaYearGroup[];
} {
  const byYear = new Map<number, NavMegaPreviewItem[]>();

  for (const item of items) {
    if (item.year === null) continue;
    const list = byYear.get(item.year) ?? [];
    list.push(item);
    byYear.set(item.year, list);
  }

  const years = [...byYear.keys()].sort((a, b) => b - a);
  const yearGroups = years.map((year) => ({
    year,
    items: byYear.get(year) ?? [],
  }));

  return { years, yearGroups };
}

function buildCategoryPreview(items: NavMegaPreviewItem[]): Pick<NavMegaCategory, "years" | "yearGroups"> {
  return groupItemsByYear(items);
}

function publicationPreviewItem(row: PublicationRow): NavMegaPreviewItem {
  const image = row.cover_image_url?.trim();
  return {
    id: row.id,
    title: row.title,
    href: publicationDetailHref(row),
    dateLabel: formatPublishedDate(row.published_at),
    imageUrl: image ? encodePublicationAssetUrl(image) : null,
    year: publishedYear(row.published_at),
  };
}

function testimonyPreviewItem(row: TestimonyRow): NavMegaPreviewItem {
  const image = row.cover_image_url?.trim();
  return {
    id: row.id,
    title: row.title,
    href: testimonyDetailHref(row),
    dateLabel: formatPublishedDate(row.published_at),
    imageUrl: image ? encodePublicationAssetUrl(image) : null,
    year: publishedYear(row.published_at),
  };
}

function newsPreviewItem(row: NewsArticleRow): NavMegaPreviewItem {
  const image = row.image_url?.trim();
  return {
    id: row.id,
    title: row.title,
    href: `/news/${encodeURIComponent(row.slug)}`,
    dateLabel: formatPublishedDate(row.published_at),
    imageUrl: image || null,
    year: publishedYear(row.published_at),
  };
}

export async function fetchNavMegaMenuData(): Promise<NavMegaMenuData> {
  const supabase = await createClient();

  const [programCategories, newsRes, publicationsRes, testimonies] = await Promise.all([
    fetchProgramCategories(),
    supabase
      .from("news_articles")
      .select("id, title, slug, image_url, published_at, department_id, category, status")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase
      .from("publications")
      .select("id, title, slug, cover_image_url, published_at, category, status")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    fetchPublishedTestimonies(),
  ]);

  const newsArticles = sortByPublishedNewest((newsRes.data ?? []) as NewsArticleRow[]);
  const publications = sortByPublishedNewest((publicationsRes.data ?? []) as PublicationRow[]);

  const slugByDeptId = new Map(programCategories.map((c) => [c.id, c.slug]));

  const newsBySlug = new Map<string, NewsArticleRow[]>();
  for (const article of newsArticles) {
    const slug = effectiveNewsDepartmentSlug(article, slugByDeptId);
    if (!slug) continue;
    const list = newsBySlug.get(slug) ?? [];
    list.push(article);
    newsBySlug.set(slug, list);
  }

  const news: NavMegaCategory[] = NEWS_NAV_SLUGS.map((slug) => {
    const cat = programCategories.find((c) => c.slug === slug);
    const items = takeLatest(newsBySlug.get(slug) ?? []).map(newsPreviewItem);
    const preview = buildCategoryPreview(items);
    return {
      id: slug,
      label: cat?.label ?? slug,
      href: `/news?topic=${encodeURIComponent(slug)}`,
      icon: NEWS_NAV_ICONS[slug],
      ...preview,
    };
  });

  const pubsByCategory = new Map<string, PublicationRow[]>();
  for (const row of publications) {
    const list = pubsByCategory.get(row.category) ?? [];
    list.push(row);
    pubsByCategory.set(row.category, list);
  }

  const publicationsMenu: NavMegaCategory[] = PUBLICATIONS_NAV_CONFIG.map((entry) => {
    if (entry.kind === "testimonies") {
      const items = takeLatest(testimonies).map(testimonyPreviewItem);
      const preview = buildCategoryPreview(items);
      return {
        id: "testimonies",
        label: entry.label,
        href: `/publications#${entry.anchor}`,
        icon: entry.icon,
        ...preview,
      };
    }
    const items = takeLatest(pubsByCategory.get(entry.slug) ?? []).map(publicationPreviewItem);
    const preview = buildCategoryPreview(items);
    return {
      id: entry.slug,
      label: entry.label,
      href: `/publications#${entry.anchor}`,
      icon: entry.icon,
      ...preview,
    };
  });

  return { news, publications: publicationsMenu };
}
