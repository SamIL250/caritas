/** YouTube URL → 11-char video ID, then thumbnail and embed URL helpers. */

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeId(input: string | null | undefined): string | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;
  if (ID_RE.test(raw)) return raw;

  let url: URL | null = null;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && ID_RE.test(id) ? id : null;
  }

  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const v = url.searchParams.get("v");
    if (v && ID_RE.test(v)) return v;

    const segs = url.pathname.split("/").filter(Boolean);
    const known = new Set(["embed", "shorts", "v", "live"]);
    if (segs.length >= 2 && known.has(segs[0])) {
      return ID_RE.test(segs[1]) ? segs[1] : null;
    }
  }

  return null;
}

/**
 * Return the best-effort thumbnail URL for a video ID.
 * `maxres` may 404 for small/older videos; consumers should fall back to `hqdefault`.
 */
export function youTubeThumbnailUrl(
  videoId: string,
  quality: "maxres" | "hq" | "mq" | "default" = "hq",
): string {
  const map = {
    maxres: "maxresdefault.jpg",
    hq: "hqdefault.jpg",
    mq: "mqdefault.jpg",
    default: "default.jpg",
  } as const;
  return `https://i.ytimg.com/vi/${videoId}/${map[quality]}`;
}

/** Privacy-enhanced embed URL with autoplay enabled (used after user clicks play). */
export function youTubeEmbedUrl(videoId: string, opts: { autoplay?: boolean } = {}): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    ...(opts.autoplay ? { autoplay: "1" } : {}),
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/** Public watch URL for "Open on YouTube" links (no autoplay). */
export function youTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
