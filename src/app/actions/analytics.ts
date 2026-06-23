"use server";

import { createClient } from "@/lib/supabase/server";
import type { LocationBreakdown } from "@/lib/page-analytics";

export async function getRegionsForCountry(
  country: string,
  pageType?: string,
): Promise<LocationBreakdown[]> {
  const supabase = await createClient();

  let query = (supabase as any)
    .from("page_views")
    .select("region, count")
    .eq("country", country);

  if (pageType) {
    query = query.eq("page_type", pageType);
  }

  const { data } = await query;
  if (!data) return [];

  const acc: Record<string, number> = {};
  for (const row of data as { region: string; count: number }[]) {
    const r = row.region || "Unknown";
    acc[r] = (acc[r] ?? 0) + row.count;
  }

  return Object.entries(acc)
    .map(([name, views]) => ({ name, views }))
    .sort((a, b) => b.views - a.views);
}
