/**
 * Canonical public origin for server-generated absolute URLs (emails, dashboard links,
 * newsletter unsubscribe, etc.).
 *
 * Configure **`NEXT_PUBLIC_SITE_URL`** (e.g. `https://lerony-caritas-revamp-2026-ten.vercel.app`
 * or your custom domain) in Vercel env for a stable canonical host. If it is mistakenly set to
 * `http://localhost:3000`, that value is ignored while the app runs on Vercel so links in
 * production emails still use the deployed host (`VERCEL_URL`).
 *
 * On Vercel, `VERCEL_URL` is always set — use it when no explicit public URL is configured.
 */

import { isLoopbackOrigin } from "@/lib/site-origin-shared";

const STAGING_FALLBACK_ORIGIN = "https://lerony-caritas-revamp-2026-ten.vercel.app";

function normalizeOrigin(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  let u = raw.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u;
}

export { isLoopbackOrigin } from "@/lib/site-origin-shared";

export function resolveSiteOrigin(): string {
  const explicit = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  const vercelHost = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  const vercelOrigin = vercelHost ? `https://${vercelHost}` : undefined;

  // Misconfigured env: localhost SITE_URL on a Vercel deployment — use the real host.
  if (explicit && vercelOrigin && isLoopbackOrigin(explicit)) {
    return vercelOrigin;
  }
  if (explicit && !isLoopbackOrigin(explicit)) {
    return explicit;
  }
  if (vercelOrigin) {
    return vercelOrigin;
  }
  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT?.trim() || "3000";
    return explicit || `http://localhost:${port}`;
  }
  return explicit || STAGING_FALLBACK_ORIGIN;
}
