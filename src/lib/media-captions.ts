/** Client-safe media caption lookup helpers (no server imports). */

export function mediaCaptionLookupKey(input: string | null | undefined): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";

  if (!raw.includes("://") && !raw.startsWith("/")) {
    return raw.replace(/^\/+/, "").split("?")[0].toLowerCase();
  }

  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://local${raw.startsWith("/") ? raw : `/${raw}`}`);
    const pathname = decodeURIComponent(url.pathname);

    const cloudinaryMatch = pathname.match(/\/image\/upload\/(.+)$/i);
    if (cloudinaryMatch) {
      const segments = cloudinaryMatch[1].split("/").filter(Boolean);
      while (
        segments.length > 0 &&
        (segments[0].includes(",") || /^[a-z]_/i.test(segments[0]) || /^v\d+$/i.test(segments[0]))
      ) {
        segments.shift();
      }
      return segments.join("/").toLowerCase();
    }

    return pathname.replace(/^\/+/, "").toLowerCase();
  } catch {
    return raw.split("?")[0].replace(/^\/+/, "").toLowerCase();
  }
}

export function lookupMediaCaption(
  map: Map<string, string> | Record<string, string> | null | undefined,
  url: string | null | undefined,
): string | null {
  const raw = (url ?? "").trim();
  if (!raw || !map) return null;

  if (map instanceof Map) {
    return map.get(raw) ?? map.get(mediaCaptionLookupKey(raw)) ?? null;
  }

  return map[raw] ?? map[mediaCaptionLookupKey(raw)] ?? null;
}

export function extractImageUrlsFromHtml(html: string): string[] {
  if (!html.trim()) return [];
  const urls = new Set<string>();
  const re = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null = re.exec(html);
  while (match) {
    urls.add(match[1]);
    match = re.exec(html);
  }
  return [...urls];
}

export function buildMediaCaptionRecord(captions: Map<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  captions.forEach((caption, key) => {
    out[key] = caption;
    out[mediaCaptionLookupKey(key)] = caption;
  });
  return out;
}
