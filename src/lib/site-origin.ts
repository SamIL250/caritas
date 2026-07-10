/**
 * Canonical public origin for server-generated absolute URLs (emails, dashboard links,
 * newsletter unsubscribe, etc.).
 *
 * Set **`NEXT_PUBLIC_SITE_URL`** (e.g. `https://new.caritasrwanda.org`) in Vercel
 * → Settings → Environment Variables for Production. If it is mistakenly set to
 * `http://localhost:3000`, that value is ignored on Vercel so links in production
 * emails use the canonical live domain instead of `*.vercel.app`.
 *
 * On Vercel preview deployments, `VERCEL_URL` is used when no explicit public URL is set.
 */

import { isLoopbackOrigin } from "@/lib/site-origin-shared";

/** Live public website — used for production emails and dashboard links. */
const CANONICAL_PRODUCTION_ORIGIN = "https://new.caritasrwanda.org";

function normalizeOrigin(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  let u = raw.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u;
}

export { isLoopbackOrigin } from "@/lib/site-origin-shared";

export function resolveSiteOrigin(): string {
  const explicit =
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeOrigin(process.env.SITE_URL);
  const vercelHost = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  const vercelOrigin = vercelHost ? `https://${vercelHost}` : undefined;
  const isVercelProduction =
    process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";

  // Misconfigured env: localhost SITE_URL on a Vercel deployment.
  if (explicit && vercelOrigin && isLoopbackOrigin(explicit)) {
    return isVercelProduction ? CANONICAL_PRODUCTION_ORIGIN : vercelOrigin;
  }
  if (explicit && !isLoopbackOrigin(explicit)) {
    return explicit;
  }
  if (isVercelProduction) {
    return CANONICAL_PRODUCTION_ORIGIN;
  }
  if (vercelOrigin) {
    return vercelOrigin;
  }
  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT?.trim() || "3000";
    return explicit || `http://localhost:${port}`;
  }
  return explicit || CANONICAL_PRODUCTION_ORIGIN;
}
