import { enrichRichTextMediaEmbeds } from "@/lib/rich-text-media-embed";

/** Minimal cleanup for CMS-authored HTML (trusted staff only). */
export function sanitizeStaffRichText(html: string): string {
  if (!html) return "";
  const noScript = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  return enrichRichTextMediaEmbeds(noScript);
}
