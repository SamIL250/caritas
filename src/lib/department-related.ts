import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type DepartmentRelatedRow = {
  source_kind: string;
  entity_id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumb_url: string | null;
  published_at: string | null;
  link_external: string | null;
  link_path: string | null;
  link_anchor: string | null;
  meta_label: string | null;
};

/** Prefer external URL when present; otherwise internal paths (programs slug, publications anchor hash, news anchor). */
export function resolveDepartmentRelatedHref(row: DepartmentRelatedRow): string {
  const ext = row.link_external?.trim();
  if (ext) return ext;
  if (row.source_kind === "news") {
    const anchor = row.link_anchor?.trim();
    if (anchor) return `/news#story-${anchor}`;
    return "/news";
  }
  if (row.source_kind === "program" && row.link_path?.trim()) return row.link_path.trim();
  if (row.source_kind === "publication") {
    const base = row.link_path?.trim() || "/publications";
    const anchor = row.link_anchor?.trim();
    return anchor ? `${base}#${anchor}` : base;
  }
  return row.link_path?.trim() || "/news";
}

/** Mixed feed for a pillar: published news, programs, and selected publication types. */
export async function fetchDepartmentRelatedContent(
  supabase: SupabaseClient<Database>,
  args: {
    departmentId: string;
    excludeNewsId?: string | null;
    excludeProgramId?: string | null;
    excludePublicationId?: string | null;
    limit?: number;
    publicationCategorySlugs?: string[];
  },
): Promise<DepartmentRelatedRow[]> {
  const { data, error } = await supabase.rpc("get_department_related_content", {
    p_department_id: args.departmentId,
    p_exclude_news_id: args.excludeNewsId ?? null,
    p_exclude_program_id: args.excludeProgramId ?? null,
    p_exclude_publication_id: args.excludePublicationId ?? null,
    p_limit: args.limit ?? 18,
    p_publication_category_slugs:
      args.publicationCategorySlugs ?? ["success_story", "recent_update", "newsletter"],
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as DepartmentRelatedRow[];
}
