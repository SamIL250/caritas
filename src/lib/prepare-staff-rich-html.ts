import { loadAllMediaCaptions } from "@/lib/media-captions-server";
import { sanitizeStaffRichText, type SanitizeStaffRichTextOptions } from "@/lib/sanitize-staff-html";

/** Sanitize CMS HTML and attach media-library captions to inline images. */
export async function prepareStaffRichHtml(html: string): Promise<string> {
  if (!html.trim()) return "";
  const captionByUrl = await loadAllMediaCaptions();
  return sanitizeStaffRichText(html, { captionByUrl });
}

export async function prepareStaffRichHtmlWithOptions(
  html: string,
  options?: Omit<SanitizeStaffRichTextOptions, "captionByUrl">,
): Promise<string> {
  if (!html.trim()) return "";
  const captionByUrl = await loadAllMediaCaptions();
  return sanitizeStaffRichText(html, { ...options, captionByUrl });
}
