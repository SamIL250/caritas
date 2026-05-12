"use client";

import { isLoopbackOrigin } from "@/lib/site-origin-shared";

function normalizeClientEnvSite(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (!raw) return undefined;
  if (!/^https?:\/\//i.test(raw)) return `https://${raw}`;
  return raw;
}

/**
 * Origin for OAuth `redirectTo` and other browser-built absolute URLs.
 * - Uses non-loopback `NEXT_PUBLIC_SITE_URL` when set (custom domain / stable Vercel URL).
 * - If env is loopback but the user is on a real deployment, uses `window.location.origin`.
 */
export function publicOAuthOrigin(): string {
  const envSite = normalizeClientEnvSite();
  if (typeof window === "undefined") {
    return envSite && !isLoopbackOrigin(envSite) ? envSite : "";
  }
  const here = window.location.origin;
  if (envSite && !isLoopbackOrigin(envSite)) {
    return envSite;
  }
  if (envSite && isLoopbackOrigin(envSite) && !isLoopbackOrigin(here)) {
    return here;
  }
  return here;
}
