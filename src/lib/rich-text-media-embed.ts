import { parseYouTubeId, youTubeEmbedUrl, youTubeWatchUrl } from "@/lib/youtube";

export type MediaEmbedProvider = "youtube" | "vimeo";

export type MediaEmbedInfo = {
  provider: MediaEmbedProvider;
  videoId: string;
  embedUrl: string;
  watchUrl: string;
};

const VIMEO_ID_RE = /^\d{6,12}$/;

export function parseVimeoId(input: string | null | undefined): string | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;
  if (VIMEO_ID_RE.test(raw)) return raw;

  let url: URL | null = null;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;

  const segs = url.pathname.split("/").filter(Boolean);
  if (host === "player.vimeo.com" && segs[0] === "video" && segs[1] && VIMEO_ID_RE.test(segs[1])) {
    return segs[1];
  }
  const last = segs[segs.length - 1];
  return last && VIMEO_ID_RE.test(last) ? last : null;
}

export function parseMediaEmbedUrl(input: string | null | undefined): MediaEmbedInfo | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;

  const youtubeId = parseYouTubeId(raw);
  if (youtubeId) {
    return {
      provider: "youtube",
      videoId: youtubeId,
      embedUrl: youTubeEmbedUrl(youtubeId),
      watchUrl: youTubeWatchUrl(youtubeId),
    };
  }

  const vimeoId = parseVimeoId(raw);
  if (vimeoId) {
    return {
      provider: "vimeo",
      videoId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      watchUrl: `https://vimeo.com/${vimeoId}`,
    };
  }

  return null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Stored HTML block for a video embed (YouTube / Vimeo). */
export function buildMediaEmbedHtml(info: MediaEmbedInfo): string {
  const title =
    info.provider === "youtube" ? "YouTube video embed" : "Vimeo video embed";
  return (
    `<div class="rich-media-embed" data-media-embed="${info.provider}" data-video-id="${escapeHtml(info.videoId)}">` +
    `<iframe src="${escapeHtml(info.embedUrl)}" title="${title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` +
    `</div>`
  );
}

function replaceStandaloneMediaUrls(html: string): string {
  let out = html;

  out = out.replace(
    /<p>\s*(<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>)\s*<\/p>/gi,
    (match, _anchor, href: string) => {
      const info = parseMediaEmbedUrl(href);
      return info ? buildMediaEmbedHtml(info) : match;
    },
  );

  out = out.replace(/<p>\s*([^<]+?)\s*<\/p>/gi, (match, inner: string) => {
    const trimmed = inner.trim();
    const info = parseMediaEmbedUrl(trimmed);
    if (info) return buildMediaEmbedHtml(info);
    return match;
  });

  return out;
}

/** Upgrade plain video links in CMS HTML to embedded players. */
export function enrichRichTextMediaEmbeds(html: string): string {
  if (!html.trim()) return html;
  return replaceStandaloneMediaUrls(html);
}
