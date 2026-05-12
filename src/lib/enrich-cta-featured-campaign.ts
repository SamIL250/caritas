import type { SupabaseClient } from "@supabase/supabase-js";

import type { Json } from "@/types/database.types";
import type { PublicSectionRow } from "@/lib/public-page-sections";

export async function enrichCtaSectionsWithFeaturedCampaigns(
  supabase: SupabaseClient,
  sections: PublicSectionRow[] | null | undefined,
): Promise<PublicSectionRow[]> {
  if (!sections?.length) return sections ?? [];

  const ids = new Set<string>();
  for (const s of sections) {
    if (s.type !== "cta" || !s.content || typeof s.content !== "object" || Array.isArray(s.content)) continue;
    const c = s.content as Record<string, unknown>;
    const fc = c.featured_card;
    if (fc && typeof fc === "object" && !Array.isArray(fc)) {
      const id = (fc as { featured_campaign_id?: string }).featured_campaign_id;
      if (typeof id === "string" && id.length) ids.add(id);
    }
  }
  if (ids.size === 0) return sections;

  const idList = [...ids];

  const { data: rows } = await supabase
    .from("community_campaigns")
    .select("*")
    .in("id", idList)
    .eq("status", "published");

  const camps = (rows ?? []) as Record<string, unknown>[];
  const catIds = [...new Set(camps.map((r) => r.category_id).filter(Boolean))] as string[];

  let catMap = new Map<string, string>();
  if (catIds.length) {
    const { data: cats } = await supabase
      .from("community_campaign_categories")
      .select("id,name")
      .in("id", catIds);
    catMap = new Map((cats ?? []).map((c: { id: string; name: string }) => [c.id, c.name]));
  }

  const map = new Map(camps.map((r) => [String(r.id), r]));

  return sections.map((s) => {
    if (s.type !== "cta" || !s.content || typeof s.content !== "object" || Array.isArray(s.content)) return s;
    const c = { ...(s.content as Record<string, unknown>) };
    const fc = c.featured_card;
    if (!fc || typeof fc !== "object" || Array.isArray(fc)) return s;
    const fco = { ...(fc as Record<string, unknown>) };
    const fid = fco.featured_campaign_id;
    if (typeof fid !== "string" || !map.has(fid)) return s;
    const camp = map.get(fid) as Record<string, unknown>;
    const catKey = typeof camp.category_id === "string" ? camp.category_id : "";
    const catName = catKey ? (catMap.get(catKey) ?? "") : "";

    const featuredUrl =
      typeof camp.featured_image_url === "string" ? String(camp.featured_image_url).trim() : "";

    const merged = {
      ...fco,
      image_url: featuredUrl || fco.image_url,
      image_alt: camp.image_alt || fco.image_alt,
      category_label: catName || fco.category_label,
      title: camp.title || fco.title,
      location: camp.location_label || fco.location,
      story: (typeof camp.excerpt === "string" ? camp.excerpt : "").trim() || fco.story,
      raised_label: camp.raised_display || fco.raised_label,
      goal_label: camp.goal_display || fco.goal_label,
      progress_pct:
        typeof camp.progress_percent === "number" ? camp.progress_percent : fco.progress_pct,
      primary_button_text: camp.primary_action_label || fco.primary_button_text,
      primary_button_url: "#donate",
      discussion_label: fco.discussion_label || "View full story",
      discussion_url:
        typeof camp.slug === "string" ? `/campaigns/${camp.slug}` : (fco.discussion_url as string) || "",
      donation_modal_campaign_id: camp.id,
    };

    return {
      ...s,
      content: {
        ...c,
        featured_card: merged,
        be_part_grid: Boolean(c.be_part_grid ?? true),
      } as Json,
    };
  });
}
