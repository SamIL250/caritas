import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { Json } from "@/types/database.types";
import type { ProgramDepartmentOption } from "@/lib/program-departments";

export type PublishedNewsArticle = Database["public"]["Tables"]["news_articles"]["Row"] & {
  department: { slug: string; label: string } | null;
};
export type NewsPageSettings = Database["public"]["Tables"]["news_page_settings"]["Row"];

export type NewsPageChrome = {
  eyebrow: string;
  headlinePrefix: string;
  headlineAccent: string;
  intro: string;
  heroImageUrl: string | null;
};

export type NewsCmsSection = {
  id: string;
  type: string;
  content: Json;
  visible: boolean;
};

const DEFAULT_META = {
  title: "News & Updates — Caritas Rwanda",
  description:
    "Latest news, stories and updates from Caritas Rwanda — serving communities across all dioceses.",
};

function parseHeroToChrome(hero: Record<string, unknown> | null): NewsPageChrome {
  const options =
    hero?.options &&
    typeof hero.options === "object" &&
    !Array.isArray(hero.options)
      ? (hero.options as Record<string, unknown>)
      : {};

  const badge =
    typeof options.badge_text === "string" && options.badge_text.trim()
      ? options.badge_text
      : "Latest from Caritas Rwanda";

  const headlinePrefix = typeof hero?.heading === "string" ? hero.heading : "News &";
  const headlineAccent =
    typeof options.heading_accent === "string" && options.heading_accent.trim()
      ? options.heading_accent
      : "Updates";

  const intro = typeof hero?.subheading === "string" ? hero.subheading : "";

  const rawUrl = hero?.image_url;
  const heroImageUrl =
    typeof rawUrl === "string" && rawUrl.trim() !== "" ? rawUrl.trim() : null;

  return {
    eyebrow: badge,
    headlinePrefix,
    headlineAccent,
    intro,
    heroImageUrl,
  };
}

function chromeFromSettings(s: NewsPageSettings | null): NewsPageChrome {
  if (!s) {
    return {
      eyebrow: "Latest from Caritas Rwanda",
      headlinePrefix: "News &",
      headlineAccent: "Updates",
      intro: "",
      heroImageUrl: null,
    };
  }

  const img = s.hero_image_url?.trim();

  return {
    eyebrow: (s.hero_eyebrow || "Latest from Caritas Rwanda").trim(),
    headlinePrefix: (s.hero_headline_prefix || "News &").trim(),
    headlineAccent: (s.hero_headline_accent || "Updates").trim(),
    intro: (s.hero_intro ?? "").trim(),
    heroImageUrl: img ? img : null,
  };
}

/** Published stories split for the news feed (featured + grid). Used by /news and the CMS page editor preview. */
export async function fetchPublishedArticles(): Promise<{
  featuredArticle: PublishedNewsArticle | null;
  gridArticles: PublishedNewsArticle[];
}> {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("news_articles")
    .select(
      `
      *,
      department:program_categories!department_id (
        slug,
        label
      )
    `,
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  const list = (articles ?? []) as unknown as PublishedNewsArticle[];
  const featuredArticle = list.find((a) => a.featured) ?? null;
  const gridArticles = featuredArticle ? list.filter((a) => a.id !== featuredArticle.id) : list;

  return { featuredArticle, gridArticles };
}

/** Full data for `/news`: CMS page when seeded, fallback to singleton settings otherwise. */
export async function resolveNewsPublicPagePayload(): Promise<{
  seoTitle: string;
  seoDescription: string;
  chrome: NewsPageChrome;
  cmsSections: NewsCmsSection[];
  featuredArticle: PublishedNewsArticle | null;
  gridArticles: PublishedNewsArticle[];
  departmentPillars: ProgramDepartmentOption[];
}> {
  const supabase = await createClient();

  const [{ data: pageRow }, { data: settings }, { data: pillarRows }] = await Promise.all([
    supabase.from("pages").select("id, meta").eq("slug", "news").maybeSingle(),
    supabase.from("news_page_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("program_categories").select("id, slug, label, sort_order").order("sort_order", { ascending: true }).order("label", { ascending: true }),
  ]);

  const page = pageRow as { id: string; meta: Json | null } | null;
  const settingsTyped = settings as NewsPageSettings | null;

  const [heroRes, articlesSplit] = await Promise.all([
    page?.id
      ? supabase.from("hero_content").select("*").eq("page_id", page.id).maybeSingle()
      : Promise.resolve({ data: null }),
    fetchPublishedArticles(),
  ]);

  const heroRow = (heroRes?.data ?? null) as Record<string, unknown> | null;
  let chrome: NewsPageChrome | null = heroRow ? parseHeroToChrome(heroRow) : null;

  let cmsSections: NewsCmsSection[] = [];

  if (page?.id) {
    const { data: secRows } = await supabase
      .from("sections")
      .select("id,type,content,visible")
      .eq("page_id", page.id)
      .eq("visible", true)
      .order("order", { ascending: true });

    cmsSections = (secRows ?? []) as unknown as NewsCmsSection[];

    const hasChromeFromHero =
      heroRow &&
      (String(heroRow.heading ?? "").trim() ||
        String(heroRow.subheading ?? "").trim() ||
        (typeof heroRow.image_url === "string" && heroRow.image_url.trim()));

    if (!hasChromeFromHero && settingsTyped) {
      chrome = chromeFromSettings(settingsTyped);
    }
  }

  if (!chrome) chrome = chromeFromSettings(settingsTyped);

  if (cmsSections.length === 0) {
    const s = settingsTyped;
    cmsSections = [
      {
        id: "legacy-feed",
        type: "news_article_feed",
        content: {},
        visible: true,
      },
      {
        id: "legacy-footer",
        type: "news_footer",
        content: {
          title: s?.newsletter_title ?? "Stay connected",
          body:
            s?.newsletter_body ??
            "Follow Caritas Rwanda for programme news and humanitarian updates across all dioceses.",
        },
        visible: true,
      },
    ];
  }

  const meta = (page?.meta || {}) as { seo_title?: string; seo_description?: string };

  const departmentPillars = (pillarRows ?? []) as ProgramDepartmentOption[];

  return {
    seoTitle: (meta.seo_title && String(meta.seo_title).trim()) || DEFAULT_META.title,
    seoDescription:
      (meta.seo_description && String(meta.seo_description).trim()) || DEFAULT_META.description,
    chrome,
    cmsSections,
    featuredArticle: articlesSplit.featuredArticle,
    gridArticles: articlesSplit.gridArticles,
    departmentPillars,
  };
}

/** @deprecated Prefer resolveNewsPublicPagePayload — kept for any legacy callers. */
export async function getNewsLandingData(): Promise<{
  settings: NewsPageSettings | null;
  featuredArticle: PublishedNewsArticle | null;
  gridArticles: PublishedNewsArticle[];
}> {
  const supabase = await createClient();

  const [{ data: settingsRaw }, articlesSplit] = await Promise.all([
    supabase.from("news_page_settings").select("*").eq("id", 1).maybeSingle(),
    fetchPublishedArticles(),
  ]);

  return {
    settings: settingsRaw as NewsPageSettings | null,
    featuredArticle: articlesSplit.featuredArticle,
    gridArticles: articlesSplit.gridArticles,
  };
}
