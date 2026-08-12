import type { MetadataRoute } from "next";
import { resolveSiteOrigin } from "@/lib/site-origin";

export default function robots(): MetadataRoute.Robots {
  const SITE = resolveSiteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/login", "/auth/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
