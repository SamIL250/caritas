import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { resolveSiteOrigin } from "@/lib/site-origin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE = resolveSiteOrigin();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/programs",
    "/news",
    "/publications",
    "/contact",
    "/get-involved",
    "/campaigns",
    "/privacy-policy",
    "/cookie-policy",
    "/terms",
  ].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const supabase = await createClient();
    const [{ data: news }, { data: pubs }, { data: campaigns }] = await Promise.all([
      supabase
        .from("news_articles")
        .select("slug, updated_at")
        .eq("status", "published")
        .limit(200),
      supabase
        .from("publications")
        .select("slug, updated_at")
        .eq("status", "published")
        .limit(200),
      supabase
        .from("community_campaigns")
        .select("slug, updated_at")
        .eq("status", "published")
        .limit(100),
    ]);

    const dynamicRoutes: MetadataRoute.Sitemap = [
      ...(news || []).map((row) => ({
        url: `${SITE}/news/${row.slug}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...(pubs || []).map((row) => ({
        url: `${SITE}/publications/${row.slug}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.55,
      })),
      ...(campaigns || []).map((row) => ({
        url: `${SITE}/campaigns/${row.slug}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.65,
      })),
    ];

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    return staticRoutes;
  }
}
