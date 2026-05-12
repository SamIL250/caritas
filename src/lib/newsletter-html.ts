/** Shared newsletter HTML sanitization (compose preview + send pipeline). */

export function sanitizeNewsletterHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";
  const noScripts = trimmed
    .replace(/<\/(?:script|style)[^>]*>/gi, "")
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "");
  return noScripts.slice(0, 500_000);
}
