import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";
import type {
  ProgramCategoryRow,
  ProgramRow,
} from "@/lib/programs";

export type ProgramsPageChrome = {
  eyebrow: string;
  headlinePrefix: string;
  headlineAccent: string;
  intro: string;
  heroImageUrl: string | null;
};

const DEFAULT_META = {
  title: "Programs — Caritas Rwanda",
  description:
    "Activities, projects and stories of impact across Caritas Rwanda program areas.",
};

function parseHeroToChrome(hero: Record<string, unknown> | null): ProgramsPageChrome {
  const options =
    hero?.options && typeof hero.options === "object" && !Array.isArray(hero.options)
      ? (hero.options as Record<string, unknown>)
      : {};

  const badge =
    typeof options.badge_text === "string" && options.badge_text.trim()
      ? options.badge_text
      : "What we do";

  const headlinePrefix =
    typeof hero?.heading === "string" && (hero.heading as string).trim()
      ? (hero.heading as string)
      : "Programs that";
  const headlineAccent =
    typeof options.heading_accent === "string" && options.heading_accent.trim()
      ? (options.heading_accent as string)
      : "transform lives";

  const intro = typeof hero?.subheading === "string" ? (hero.subheading as string) : "";
  const rawUrl = hero?.image_url;
  const heroImageUrl =
    typeof rawUrl === "string" && rawUrl.trim() ? rawUrl.trim() : null;

  return {
    eyebrow: badge,
    headlinePrefix,
    headlineAccent,
    intro,
    heroImageUrl,
  };
}

export async function fetchPublishedPrograms(): Promise<ProgramRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programs")
    .select("*")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });
  return (data ?? []) as ProgramRow[];
}

export async function fetchProgramCategories(): Promise<ProgramCategoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("program_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  return (data ?? []) as ProgramCategoryRow[];
}

export async function resolveProgramsPublicPagePayload(): Promise<{
  seoTitle: string;
  seoDescription: string;
  chrome: ProgramsPageChrome;
  programs: ProgramRow[];
  categories: ProgramCategoryRow[];
}> {
  const supabase = await createClient();

  const { data: pageRow } = await supabase
    .from("pages")
    .select("id, meta")
    .eq("slug", "programs")
    .maybeSingle();
  const page = pageRow as { id: string; meta: Json | null } | null;

  const [heroRes, programs, categories] = await Promise.all([
    page?.id
      ? supabase.from("hero_content").select("*").eq("page_id", page.id).maybeSingle()
      : Promise.resolve({ data: null }),
    fetchPublishedPrograms(),
    fetchProgramCategories(),
  ]);

  const heroRow = (heroRes?.data ?? null) as Record<string, unknown> | null;
  const chrome = parseHeroToChrome(heroRow);

  const meta = (page?.meta || {}) as { seo_title?: string; seo_description?: string };

  return {
    seoTitle: (meta.seo_title && String(meta.seo_title).trim()) || DEFAULT_META.title,
    seoDescription:
      (meta.seo_description && String(meta.seo_description).trim()) || DEFAULT_META.description,
    chrome,
    programs,
    categories,
  };
}

export async function fetchProgramBySlug(
  slug: string,
): Promise<{ program: ProgramRow; category: ProgramCategoryRow | null } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return null;
  const program = data as ProgramRow;

  const { data: catRow } = await supabase
    .from("program_categories")
    .select("*")
    .eq("id", program.category_id)
    .maybeSingle();
  return {
    program,
    category: (catRow as ProgramCategoryRow) ?? null,
  };
}

export async function fetchRelatedPrograms(
  categoryId: string,
  excludeId: string,
  limit = 3,
): Promise<ProgramRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programs")
    .select("*")
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ProgramRow[];
}
