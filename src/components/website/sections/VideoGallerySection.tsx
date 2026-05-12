"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { faSolidIconClass } from "@/lib/fontawesome";
import {
  parseYouTubeId,
  youTubeEmbedUrl,
  youTubeThumbnailUrl,
  youTubeWatchUrl,
} from "@/lib/youtube";

export type VideoGalleryItem = {
  id?: string;
  title?: string;
  description?: string;
  youtube_url?: string;
  category?: string;
  duration?: string;
  published_label?: string;
};

export type VideoGalleryLayout = "spotlight" | "grid" | "carousel";

export type VideoGallerySectionProps = {
  anchor_id?: string;
  eyebrow?: string;
  eyebrow_icon?: string;
  heading_lead?: string;
  heading_accent?: string;
  subtitle?: string;
  layout?: VideoGalleryLayout;
  show_categories?: boolean;
  all_label?: string;
  cta_label?: string;
  cta_url?: string;
  videos?: VideoGalleryItem[];
};

type NormalizedVideo = {
  key: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  publishedLabel: string;
  videoId: string;
  thumbnail: string;
  watchUrl: string;
};

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1493804714600-6edb1cd93080?w=1280&q=70&auto=format&fit=crop";

function normalize(items: VideoGalleryItem[] | undefined): NormalizedVideo[] {
  if (!items?.length) return [];
  return items
    .map((raw, idx) => {
      const videoId = parseYouTubeId(raw.youtube_url) ?? "";
      if (!videoId) return null;
      return {
        key: raw.id || `vg-${idx}-${videoId}`,
        title: (raw.title || "").trim() || "Untitled video",
        description: (raw.description || "").trim(),
        category: (raw.category || "").trim(),
        duration: (raw.duration || "").trim(),
        publishedLabel: (raw.published_label || "").trim(),
        videoId,
        thumbnail: youTubeThumbnailUrl(videoId, "hq"),
        watchUrl: youTubeWatchUrl(videoId),
      } satisfies NormalizedVideo;
    })
    .filter((v): v is NormalizedVideo => v !== null);
}

function PlayBadge({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`vg-play vg-play--${size}`} aria-hidden>
      <svg viewBox="0 0 24 24" width="44%" height="44%" focusable="false">
        <path d="M8 5v14l11-7z" fill="currentColor" />
      </svg>
    </span>
  );
}

function VideoThumb({
  video,
  active,
  onPlay,
  variant,
}: {
  video: NormalizedVideo;
  active: boolean;
  onPlay: () => void;
  variant: "hero" | "card" | "row";
}) {
  const [imgSrc, setImgSrc] = useState(video.thumbnail);

  useEffect(() => {
    setImgSrc(video.thumbnail);
  }, [video.thumbnail]);

  if (active) {
    return (
      <div className={`vg-frame vg-frame--${variant} is-playing`}>
        <iframe
          className="vg-iframe"
          src={youTubeEmbedUrl(video.videoId, { autoplay: true })}
          title={video.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onPlay}
      className={`vg-frame vg-frame--${variant}`}
      aria-label={`Play video: ${video.title}`}
    >
      <img
        className="vg-thumb"
        src={imgSrc}
        alt=""
        loading="lazy"
        onError={() => setImgSrc(FALLBACK_THUMB)}
      />
      <span className="vg-frame-overlay" aria-hidden />
      <PlayBadge size={variant === "hero" ? "lg" : variant === "card" ? "md" : "sm"} />
      {video.duration ? <span className="vg-duration">{video.duration}</span> : null}
    </button>
  );
}

export default function VideoGallerySection({
  anchor_id = "videos",
  eyebrow,
  eyebrow_icon = "fa-circle-play",
  heading_lead,
  heading_accent,
  subtitle,
  layout = "spotlight",
  show_categories = true,
  all_label = "All videos",
  cta_label,
  cta_url,
  videos,
}: VideoGallerySectionProps) {
  const items = useMemo(() => normalize(videos), [videos]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const v of items) {
      if (!v.category) continue;
      const key = v.category.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(v.category);
    }
    return out;
  }, [items]);

  const [activeCategory, setActiveCategory] = useState<string>("__all__");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (activeCategory === "__all__") return items;
    return items.filter(
      (v) => v.category.toLowerCase() === activeCategory.toLowerCase(),
    );
  }, [items, activeCategory]);

  // Spotlight layout uses the first filtered video as featured.
  const featured = filtered[0] ?? items[0] ?? null;
  const queue = filtered.slice(1);

  useEffect(() => {
    setPlayingId(null);
  }, [activeCategory, layout]);

  if (!items.length) return null;

  const eyebrowIc = faSolidIconClass(eyebrow_icon);

  const scrollCarousel = (dir: "prev" | "next") => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".vg-carousel-card");
    const step = (card?.offsetWidth ?? 320) + 24;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  return (
    <section
      className={`vg-section vg-section--${layout}`}
      id={anchor_id || undefined}
      aria-labelledby="vg-section-title"
    >
      <div className="vg-shell">
        <header className="vg-header">
          {eyebrow ? (
            <div className="vg-eyebrow">
              {eyebrowIc ? <i className={eyebrowIc} aria-hidden /> : null}
              <span>{eyebrow}</span>
            </div>
          ) : null}
          {(heading_lead || heading_accent) && (
            <h2 className="vg-title" id="vg-section-title">
              {heading_lead ? <span>{heading_lead} </span> : null}
              {heading_accent ? <span className="vg-title-accent">{heading_accent}</span> : null}
            </h2>
          )}
          {subtitle ? <p className="vg-subtitle">{subtitle}</p> : null}

          {show_categories && categories.length > 0 ? (
            <div className="vg-chips" role="tablist" aria-label="Filter videos by category">
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === "__all__"}
                className={`vg-chip${activeCategory === "__all__" ? " is-active" : ""}`}
                onClick={() => setActiveCategory("__all__")}
              >
                {all_label}
              </button>
              {categories.map((cat) => {
                const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    key={cat}
                    className={`vg-chip${isActive ? " is-active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          ) : null}
        </header>

        {/* ─── SPOTLIGHT ─────────────────────────────────────────── */}
        {layout === "spotlight" && featured ? (
          <div className="vg-spotlight">
            <div className="vg-spotlight-stage">
              <VideoThumb
                video={featured}
                active={playingId === featured.key}
                onPlay={() => setPlayingId(featured.key)}
                variant="hero"
              />
              <div className="vg-spotlight-meta">
                <div className="vg-meta-row">
                  {featured.category ? (
                    <span className="vg-pill vg-pill--solid">{featured.category}</span>
                  ) : null}
                  {featured.publishedLabel ? (
                    <span className="vg-pill vg-pill--ghost">{featured.publishedLabel}</span>
                  ) : null}
                </div>
                <h3 className="vg-meta-title">{featured.title}</h3>
                {featured.description ? (
                  <p className="vg-meta-desc">{featured.description}</p>
                ) : null}
                <a
                  href={featured.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vg-meta-link"
                >
                  Open on YouTube
                  <span aria-hidden>→</span>
                </a>
              </div>
            </div>

            {queue.length ? (
              <aside className="vg-queue" aria-label="More videos in this collection">
                <div className="vg-queue-head">Up next</div>
                <ul className="vg-queue-list">
                  {queue.map((v) => {
                    const isActive = playingId === v.key;
                    return (
                      <li key={v.key}>
                        <button
                          type="button"
                          onClick={() => setPlayingId(v.key)}
                          className={`vg-queue-item${isActive ? " is-active" : ""}`}
                        >
                          <span className="vg-queue-thumb">
                            <img src={v.thumbnail} alt="" loading="lazy" />
                            <span className="vg-queue-play" aria-hidden>
                              <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M8 5v14l11-7z" fill="currentColor" />
                              </svg>
                            </span>
                            {v.duration ? (
                              <span className="vg-queue-duration">{v.duration}</span>
                            ) : null}
                          </span>
                          <span className="vg-queue-info">
                            {v.category ? (
                              <span className="vg-queue-cat">{v.category}</span>
                            ) : null}
                            <span className="vg-queue-title">{v.title}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            ) : null}
          </div>
        ) : null}

        {/* ─── GRID ──────────────────────────────────────────────── */}
        {layout === "grid" ? (
          <div className="vg-grid">
            {filtered.map((v) => (
              <article key={v.key} className="vg-card">
                <VideoThumb
                  video={v}
                  active={playingId === v.key}
                  onPlay={() => setPlayingId(v.key)}
                  variant="card"
                />
                <div className="vg-card-body">
                  <div className="vg-meta-row">
                    {v.category ? (
                      <span className="vg-pill vg-pill--solid">{v.category}</span>
                    ) : null}
                    {v.publishedLabel ? (
                      <span className="vg-pill vg-pill--ghost">{v.publishedLabel}</span>
                    ) : null}
                  </div>
                  <h3 className="vg-card-title">{v.title}</h3>
                  {v.description ? <p className="vg-card-desc">{v.description}</p> : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {/* ─── CAROUSEL ──────────────────────────────────────────── */}
        {layout === "carousel" ? (
          <div className="vg-carousel-wrap">
            <button
              type="button"
              className="vg-carousel-nav vg-carousel-nav--prev"
              onClick={() => scrollCarousel("prev")}
              aria-label="Scroll to previous videos"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button
              type="button"
              className="vg-carousel-nav vg-carousel-nav--next"
              onClick={() => scrollCarousel("next")}
              aria-label="Scroll to next videos"
            >
              <ChevronRight size={20} aria-hidden />
            </button>
            <div className="vg-carousel" ref={carouselRef}>
              {filtered.map((v) => (
                <article key={v.key} className="vg-carousel-card">
                  <VideoThumb
                    video={v}
                    active={playingId === v.key}
                    onPlay={() => setPlayingId(v.key)}
                    variant="card"
                  />
                  <div className="vg-card-body">
                    <div className="vg-meta-row">
                      {v.category ? (
                        <span className="vg-pill vg-pill--solid">{v.category}</span>
                      ) : null}
                      {v.duration ? (
                        <span className="vg-pill vg-pill--ghost">{v.duration}</span>
                      ) : null}
                    </div>
                    <h3 className="vg-card-title">{v.title}</h3>
                    {v.description ? <p className="vg-card-desc">{v.description}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {cta_label && cta_url ? (
          <div className="vg-cta-row">
            <a
              href={cta_url}
              target={/^https?:\/\//i.test(cta_url) ? "_blank" : undefined}
              rel={/^https?:\/\//i.test(cta_url) ? "noopener noreferrer" : undefined}
              className="vg-cta"
            >
              {cta_label}
              <span aria-hidden>→</span>
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
