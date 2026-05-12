import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/** Maximum moderated rows loaded per status (newest first) on dashboard moderation screens. */
export const MODERATION_REVIEWED_PAGE_LIMIT = 200;

type CommentRow = Database["public"]["Tables"]["community_campaign_comments"]["Row"];

/** Comments enriched with campaign title/slug for dashboard moderation UIs. */
export type EnrichedModerationComment = CommentRow & {
  campaign_title?: string;
  campaign_slug?: string;
};

export async function fetchEnrichedCommentModerationQueues(
  supabase: SupabaseClient<Database>,
): Promise<{
  pending: EnrichedModerationComment[];
  approved: EnrichedModerationComment[];
  rejected: EnrichedModerationComment[];
}> {
  const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
    supabase
      .from("community_campaign_comments")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("community_campaign_comments")
      .select("*")
      .eq("status", "approved")
      .order("moderated_at", { ascending: false })
      .limit(MODERATION_REVIEWED_PAGE_LIMIT),
    supabase
      .from("community_campaign_comments")
      .select("*")
      .eq("status", "rejected")
      .order("moderated_at", { ascending: false })
      .limit(MODERATION_REVIEWED_PAGE_LIMIT),
  ]);

  const pendingRaw = (pendingRes.data ?? []) as CommentRow[];
  const approvedRaw = (approvedRes.data ?? []) as CommentRow[];
  const rejectedRaw = (rejectedRes.data ?? []) as CommentRow[];

  const all = [...pendingRaw, ...approvedRaw, ...rejectedRaw];
  const ids = [...new Set(all.map((p) => p.campaign_id))];
  const metaMap = new Map<string, { title: string; slug: string }>();
  if (ids.length > 0) {
    const { data: meta } = await supabase.from("community_campaigns").select("id,title,slug").in("id", ids);
    for (const m of meta ?? []) {
      metaMap.set(m.id, { title: m.title, slug: m.slug });
    }
  }

  function enrich(rows: CommentRow[]): EnrichedModerationComment[] {
    return rows.map((r) => {
      const m = metaMap.get(r.campaign_id);
      return { ...r, campaign_title: m?.title, campaign_slug: m?.slug };
    });
  }

  return {
    pending: enrich(pendingRaw),
    approved: enrich(approvedRaw),
    rejected: enrich(rejectedRaw),
  };
}
