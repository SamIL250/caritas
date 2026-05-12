import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfigBase = {
  /**
   * Next 16 locks `{distDir}/lock` so only one `next dev` runs per output dir (even on another port).
   * Escape hatch: set in `.env.development.local` only (not `.env.local`, or `next build` would use it too):
   * `NEXT_DEV_DISTDIR=.next-dev-alt`
   */
  ...(process.env.NODE_ENV !== "production" && process.env.NEXT_DEV_DISTDIR
    ? { distDir: process.env.NEXT_DEV_DISTDIR }
    : {}),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

const sentryConfig = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
};

const config =
  process.env.NODE_ENV === "production"
    ? withSentryConfig(nextConfigBase, sentryConfig)
    : nextConfigBase;

export default config;
