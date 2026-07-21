import { enrichRichTextMediaEmbeds } from "@/lib/rich-text-media-embed";
import { enrichRichTextFigures } from "@/lib/rich-text-figure";

export type SanitizeStaffRichTextOptions = {
  captionByUrl?: Map<string, string> | Record<string, string>;
};

/** Minimal cleanup for CMS-authored HTML (trusted staff only). */
export function sanitizeStaffRichText(html: string, options?: SanitizeStaffRichTextOptions): string {
  if (!html) return "";
  const noScript = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  const withEmbeds = enrichRichTextMediaEmbeds(noScript);
  return enrichRichTextFigures(withEmbeds, "news-rich-inline-img", options?.captionByUrl);
}
