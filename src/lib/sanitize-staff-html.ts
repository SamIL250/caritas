/** Minimal cleanup for CMS-authored HTML (trusted staff only). */
export function sanitizeStaffRichText(html: string): string {
  if (!html) return "";
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
}
