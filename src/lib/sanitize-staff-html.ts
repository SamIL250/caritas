import { enrichRichTextMediaEmbeds } from "@/lib/rich-text-media-embed";
import { enrichRichTextFigures } from "@/lib/rich-text-figure";

/** Minimal cleanup for CMS-authored HTML (trusted staff only). */
export function sanitizeStaffRichText(html: string): string {
  if (!html) return "";
  const noScript = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  const withEmbeds = enrichRichTextMediaEmbeds(noScript);
  return enrichRichTextFigures(withEmbeds);
}
