import { createClient } from "@/lib/supabase/server";
import type {
  PublicationCategoryRow,
  PublicationRow,
} from "@/lib/publications";
import type { Json } from "@/types/database.types";

export type PublishedPublication = PublicationRow;

export type PublicationsPageChrome = {
  eyebrow: string;
  headlinePrefix: string;
  headlineAccent: string;
  intro: string;
};

export type PublicationsCmsSection = {
  id: string;
  type: string;
  content: Json;
  visible: boolean;
};

const DEFAULT_META = {
  title: "Publications & Resources — Caritas Rwanda",
  description:
    "Annual reports, newsletters, strategic plans, success stories and updates from Caritas Rwanda.",
};

function parseHeroToChrome(hero: Record<string, unknown> | null): PublicationsPageChrome {
  const options =
    hero?.options && typeof hero.options === "object" && !Array.isArray(hero.options)
      ? (hero.options as Record<string, unknown>)
      : {};

  const badge =
    typeof options.badge_text === "string" && options.badge_text.trim()
      ? options.badge_text
      : "Knowledge & Transparency";

  const headlinePrefix = typeof hero?.heading === "string" ? hero.heading : "Publications &";
  const headlineAccent =
    typeof options.heading_accent === "string" && options.heading_accent.trim()
      ? String(options.heading_accent)
      : "Resources";

  const intro = typeof hero?.subheading === "string" ? hero.subheading : "";

  return {
    eyebrow: badge,
    headlinePrefix,
    headlineAccent,
    intro,
  };
}

/** All published publications for /publications and the CMS preview. */
export async function fetchPublishedPublications(): Promise<PublishedPublication[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("publications")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  return (data ?? []) as PublishedPublication[];
}

/** All categories (system + custom) for filters / labels. */
export async function fetchPublicationCategories(): Promise<PublicationCategoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("publication_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  return (data ?? []) as PublicationCategoryRow[];
}

export async function resolvePublicationsPublicPagePayload(): Promise<{
  seoTitle: string;
  seoDescription: string;
  chrome: PublicationsPageChrome;
  cmsSections: PublicationsCmsSection[];
  publications: PublishedPublication[];
  categories: PublicationCategoryRow[];
}> {
  const supabase = await createClient();

  const { data: pageRow } = await supabase
    .from("pages")
    .select("id, meta")
    .eq("slug", "publications")
    .maybeSingle();

  const page = pageRow as { id: string; meta: Json | null } | null;

  const [heroRes, pubs, categories] = await Promise.all([
    page?.id
      ? supabase.from("hero_content").select("*").eq("page_id", page.id).maybeSingle()
      : Promise.resolve({ data: null }),
    fetchPublishedPublications(),
    fetchPublicationCategories(),
  ]);

  const heroRow = (heroRes?.data ?? null) as Record<string, unknown> | null;
  const chrome = heroRow ? parseHeroToChrome(heroRow) : parseHeroToChrome(null);

  let cmsSections: PublicationsCmsSection[] = [];

  if (page?.id) {
    const { data: secRows } = await supabase
      .from("sections")
      .select("id,type,content,visible")
      .eq("page_id", page.id)
      .eq("visible", true)
      .order("order", { ascending: true });

    cmsSections = (secRows ?? []) as unknown as PublicationsCmsSection[];
  }

  if (cmsSections.length === 0) {
    cmsSections = [
      {
        id: "legacy-publications",
        type: "publications_library",
        content: {},
        visible: true,
      },
    ];
  }

  const meta = (page?.meta || {}) as { seo_title?: string; seo_description?: string };

  return {
    seoTitle: (meta.seo_title && String(meta.seo_title).trim()) || DEFAULT_META.title,
    seoDescription:
      (meta.seo_description && String(meta.seo_description).trim()) || DEFAULT_META.description,
    chrome,
    cmsSections,
    publications: pubs,
    categories,
  };
}
