import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export const DEFAULT_COMMUNITY_CAMPAIGN_CATEGORY_SLUG = "general";

export type CommunityCampaignCategoryRow =
  Database["public"]["Tables"]["community_campaign_categories"]["Row"];

export async function ensureDefaultCommunityCampaignCategory(
  supabase: SupabaseClient<Database>,
): Promise<CommunityCampaignCategoryRow | null> {
  const { data: existing } = await supabase
    .from("community_campaign_categories")
    .select("*")
    .eq("slug", DEFAULT_COMMUNITY_CAMPAIGN_CATEGORY_SLUG)
    .maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabase
    .from("community_campaign_categories")
    .insert({
      slug: DEFAULT_COMMUNITY_CAMPAIGN_CATEGORY_SLUG,
      name: "General",
      sort_order: 0,
    })
    .select("*")
    .single();
  if (error) return null;
  return data;
}

export async function resolveCommunityCampaignCategoryFallback(
  supabase: SupabaseClient<Database>,
  excludeCategoryId: string,
): Promise<CommunityCampaignCategoryRow | null> {
  const defaultCategory = await ensureDefaultCommunityCampaignCategory(supabase);
  if (defaultCategory && defaultCategory.id !== excludeCategoryId) {
    return defaultCategory;
  }

  const { data: other } = await supabase
    .from("community_campaign_categories")
    .select("*")
    .neq("id", excludeCategoryId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(1)
    .maybeSingle();

  return other ?? null;
}
