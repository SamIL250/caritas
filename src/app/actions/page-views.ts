"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export type PageType = "news_article" | "publication" | "program";

async function geoLookup(ip: string): Promise<{ country: string; region: string }> {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { country: "Unknown", region: "Unknown" };
    const data = await res.json();
    return {
      country: typeof data.country === "string" && data.country ? data.country : "Unknown",
      region: typeof data.regionName === "string" && data.regionName ? data.regionName : "Unknown",
    };
  } catch {
    return { country: "Unknown", region: "Unknown" };
  }
}

/**
 * Record a page view (daily aggregated upsert via RPC).
 * Captures the viewer's country and region via IP geolocation.
 */
export async function trackView(pageType: PageType, pageId: string): Promise<void> {
  const supabase = await createClient();

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "";

  let country = "Unknown";
  let region = "Unknown";

  if (ip && ip !== "127.0.0.1" && ip !== "::1" && ip !== "localhost") {
    const geo = await geoLookup(ip);
    country = geo.country;
    region = geo.region;
  }

  await supabase.rpc("increment_page_view", {
    p_page_type: pageType,
    p_page_id: pageId,
    p_view_date: new Date().toISOString().slice(0, 10),
    p_country: country,
    p_region: region,
  });
}
