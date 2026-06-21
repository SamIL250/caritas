import type { SupabaseClient } from "@supabase/supabase-js";

/* ────── Types ────── */

export type PageViewRow = {
  id: string;
  page_type: "news_article" | "publication" | "program";
  page_id: string;
  view_date: string;
  count: number;
};

export type TopItem = {
  id: string;
  title: string;
  slug: string;
  total_views: number;
  type: "news_article" | "publication" | "program";
};

export type ViewsByDay = {
  day: string;
  label: string;
  news_article: number;
  publication: number;
  program: number;
};

export type CategoryBreakdown = {
  name: string;
  slug: string;
  views: number;
};

/* ────── Helpers ────── */

const DAY = 24 * 60 * 60 * 1000;

function dayKeys(periodDays: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function formatLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ────── Queries ────── */

/**
 * Total views per page type.
 */
export async function getTotalViews(
  supabase: SupabaseClient,
): Promise<{ page_type: string; total: number }[]> {
  const { data } = await supabase
    .from("page_views")
    .select("page_type, count");
  if (!data) return [];

  const acc: Record<string, number> = {};
  for (const row of data as { page_type: string; count: number }[]) {
    acc[row.page_type] = (acc[row.page_type] ?? 0) + row.count;
  }
  return Object.entries(acc).map(([page_type, total]) => ({ page_type, total }));
}

/**
 * Views per day for the last N days, split by page type.
 */
export async function getViewsByDay(
  supabase: SupabaseClient,
  periodDays = 30,
): Promise<ViewsByDay[]> {
  const keys = dayKeys(periodDays);
  const from = `${keys[0]}T00:00:00.000Z`;

  const { data } = await supabase
    .from("page_views")
    .select("page_type, view_date, count")
    .gte("view_date", from.slice(0, 10))
    .order("view_date", { ascending: true });

  const acc: Record<string, ViewsByDay> = {};
  for (const k of keys) {
    acc[k] = { day: k, label: formatLabel(k), news_article: 0, publication: 0, program: 0 };
  }

  const pageTypeKey = (pt: string): "news_article" | "publication" | "program" => {
    if (pt === "news_article") return "news_article";
    if (pt === "publication") return "publication";
    return "program";
  };

  for (const row of (data ?? []) as { page_type: string; view_date: string; count: number }[]) {
    const d = row.view_date.slice(0, 10);
    if (acc[d]) {
      acc[d][pageTypeKey(row.page_type)] += row.count;
    }
  }

  return keys.map((k) => acc[k]);
}

/**
 * Most viewed items of a given page type, with title/slug from the source table.
 */
export async function getTopViewed(
  supabase: SupabaseClient,
  pageType: "news_article" | "publication" | "program",
  limit = 10,
): Promise<TopItem[]> {
  const { data: viewRows } = await supabase
    .from("page_views")
    .select("page_id, count")
    .eq("page_type", pageType)
    .limit(5000);

  if (!viewRows || viewRows.length === 0) return [];

  const acc: Record<string, number> = {};
  for (const row of viewRows as { page_id: string; count: number }[]) {
    acc[row.page_id] = (acc[row.page_id] ?? 0) + row.count;
  }

  const topIds = Object.entries(acc)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => id);

  if (topIds.length === 0) return [];

  const tableMap = {
    news_article: "news_articles",
    publication: "publications",
    program: "programs",
  } as const;

  const { data: contentRows } = await supabase
    .from(tableMap[pageType])
    .select("id, title, slug")
    .in("id", topIds);

  const contentMap = new Map(
    (contentRows ?? []).map((r: any) => [r.id, r]),
  );

  return topIds
    .map((id) => {
      const row = contentMap.get(id);
      if (!row) return null;
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        total_views: acc[id],
        type: pageType,
      };
    })
    .filter((r): r is TopItem => r !== null);
}

/**
 * View breakdown by news category.
 */
export async function getNewsCategoryBreakdown(
  supabase: SupabaseClient,
): Promise<CategoryBreakdown[]> {
  const { data: pageViews } = await supabase
    .from("page_views")
    .select("page_id, count")
    .eq("page_type", "news_article");

  if (!pageViews || pageViews.length === 0) return [];

  const viewCounts: Record<string, number> = {};
  for (const row of pageViews as { page_id: string; count: number }[]) {
    viewCounts[row.page_id] = (viewCounts[row.page_id] ?? 0) + row.count;
  }

  const ids = Object.keys(viewCounts);
  if (ids.length === 0) return [];

  const { data: articles } = await supabase
    .from("news_articles")
    .select("id, category")
    .in("id", ids);

  const catAcc: Record<string, number> = {};
  for (const a of (articles ?? []) as { id: string; category: string }[]) {
    const v = viewCounts[a.id] ?? 0;
    catAcc[a.category] = (catAcc[a.category] ?? 0) + v;
  }

  return Object.entries(catAcc)
    .map(([slug, views]) => ({ name: slug.charAt(0).toUpperCase() + slug.slice(1), slug, views }))
    .sort((a, b) => b.views - a.views);
}

/**
 * View breakdown by publication category.
 */
export async function getPublicationCategoryBreakdown(
  supabase: SupabaseClient,
): Promise<CategoryBreakdown[]> {
  const { data: pageViews } = await supabase
    .from("page_views")
    .select("page_id, count")
    .eq("page_type", "publication");

  if (!pageViews || pageViews.length === 0) return [];

  const viewCounts: Record<string, number> = {};
  for (const row of pageViews as { page_id: string; count: number }[]) {
    viewCounts[row.page_id] = (viewCounts[row.page_id] ?? 0) + row.count;
  }

  const ids = Object.keys(viewCounts);
  if (ids.length === 0) return [];

  const { data: pubs } = await supabase
    .from("publications")
    .select("id, category_id")
    .in("id", ids);

  const catIdCounts: Record<string, number> = {};
  for (const p of (pubs ?? []) as { id: string; category_id: string }[]) {
    const v = viewCounts[p.id] ?? 0;
    catIdCounts[p.category_id] = (catIdCounts[p.category_id] ?? 0) + v;
  }

  const catIds = Object.keys(catIdCounts);
  if (catIds.length === 0) return [];

  const { data: cats } = await supabase
    .from("publication_categories")
    .select("id, slug, label")
    .in("id", catIds);

  const catLabelMap = new Map(
    (cats ?? []).map((c: any) => [c.id, c.label || c.slug]),
  );

  return Object.entries(catIdCounts)
    .map(([id, views]) => ({ name: catLabelMap.get(id) ?? id, slug: id, views }))
    .sort((a, b) => b.views - a.views);
}

/**
 * View breakdown by program category.
 */
export async function getProgramCategoryBreakdown(
  supabase: SupabaseClient,
): Promise<CategoryBreakdown[]> {
  const { data: pageViews } = await supabase
    .from("page_views")
    .select("page_id, count")
    .eq("page_type", "program");

  if (!pageViews || pageViews.length === 0) return [];

  const viewCounts: Record<string, number> = {};
  for (const row of pageViews as { page_id: string; count: number }[]) {
    viewCounts[row.page_id] = (viewCounts[row.page_id] ?? 0) + row.count;
  }

  const ids = Object.keys(viewCounts);
  if (ids.length === 0) return [];

  const { data: progs } = await supabase
    .from("programs")
    .select("id, category_id")
    .in("id", ids);

  const catIdCounts: Record<string, number> = {};
  for (const p of (progs ?? []) as { id: string; category_id: string }[]) {
    const v = viewCounts[p.id] ?? 0;
    catIdCounts[p.category_id] = (catIdCounts[p.category_id] ?? 0) + v;
  }

  const catIds = Object.keys(catIdCounts);
  if (catIds.length === 0) return [];

  const { data: cats } = await supabase
    .from("program_categories")
    .select("id, slug, label")
    .in("id", catIds);

  const catLabelMap = new Map(
    (cats ?? []).map((c: any) => [c.id, c.label || c.slug]),
  );

  return Object.entries(catIdCounts)
    .map(([id, views]) => ({ name: catLabelMap.get(id) ?? id, slug: id, views }))
    .sort((a, b) => b.views - a.views);
}
