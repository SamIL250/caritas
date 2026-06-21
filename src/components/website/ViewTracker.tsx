"use client";

import { useEffect } from "react";
import type { PageType } from "@/app/actions/page-views";
import { trackView } from "@/app/actions/page-views";

/**
 * Invisible component that records a page view when mounted.
 * Embed in any server or client rendered detail page.
 */
export function ViewTracker({ pageType, pageId }: { pageType: PageType; pageId: string }) {
  useEffect(() => {
    trackView(pageType, pageId);
  }, [pageType, pageId]);
  return null;
}
