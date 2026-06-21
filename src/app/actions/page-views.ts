"use server";

import { createClient } from "@/lib/supabase/server";

export type PageType = "news_article" | "publication" | "program";

/**
 * Record a page view (daily aggregated upsert via RPC).
 * Safe to call on every render.
 */
export async function trackView(pageType: PageType, pageId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("increment_page_view", {
    p_page_type: pageType,
    p_page_id: pageId,
    p_view_date: new Date().toISOString().slice(0, 10),
  });
}
