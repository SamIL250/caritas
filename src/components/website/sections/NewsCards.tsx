"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import VideoGallerySection, {
  type VideoGalleryLayout,
} from "@/components/website/sections/VideoGallerySection";

export type NewsArticle = {
  title: string;
  excerpt: string;
  date: string;
  image_url?: string;
  thumbnail?: string;
  link_url: string;
  tag?: string;
  open_in_new?: boolean;
};

export interface NewsCardsProps {
  eyebrow?: string;
  /** Text before the highlighted span, e.g. "Stories &" */
  heading?: string;
  /** Accent span text, e.g. "Updates" */
  heading_highlight?: string;
  subtitle?: string;
  view_all_url?: string;
  view_all_label?: string;
  /** Label for the News tab button */
  news_tab_label?: string;
  /** Label for the Video tab button */
  video_tab_label?: string;
  /** YouTube Channel URL for the View More button */
  youtube_channel_url?: string;
  articles?: NewsArticle[];
  videoGalleryProps?: Record<string, unknown>;
}

const DEFAULT_ARTICLES: NewsArticle[] = [
  {
    title: "From Field Agents to Private Service Providers (PSPs)",
    excerpt:
      "24 field agents from the Gera Ku Ntego Youth Project in Rwamagana and Kayonza have officially graduated as Private Service Providers, marking a milestone in their entrepreneurship journey.",
    date: "March 30, 2026",
    tag: "Development",
    image_url:
      "https://caritasrwanda.org/wp-content/uploads/2026/03/162A9069-scaled.jpg",
    link_url: "https://caritasrwanda.org/",
  },
  {
    title: "2026 General Assembly of Caritas Rwanda",
    excerpt:
      "The 29th General Assembly was held at Centre Saint Vincent Pallotti-Gikondo, reviewing 2025 achievements and setting priorities for 2026.",
    date: "March 30, 2026",
    tag: "Organizational",
    image_url:
      "https://caritasrwanda.org/wp-content/uploads/2026/03/162A8733-scaled.jpg",
    link_url: "https://caritasrwanda.org/",
  },
  {
    title: "Caritas Humanitarian Conference in Kigali",
    excerpt:
      "Leaders from across the Caritas Internationalis Confederation gathered in Kigali for the Humanitarian Conference 2026.",
    date: "March 9, 2026",
    tag: "International",
    image_url:
      "https://caritasrwanda.org/wp-content/uploads/2026/03/162A7732-scaled.jpg",
    link_url: "https://caritasrwanda.org/",
  },
];

const TAG_COLORS: Record<string, string> = {
  development: "#8c2208",
  health: "#1f7a6e",
  organizational: "#c45c00",
  international: "#5ba9c4",
  news: "#911313",
  social: "#911313",
  article: "#8c2208",
  stories: "#8c2208",
};

function articleImage(a: NewsArticle) {
  return (a.image_url || a.thumbnail || "").trim();
}

function tagColor(tag?: string) {
  const key = (tag || "news").toLowerCase().replace(/[\s_-]+/g, "");
  return TAG_COLORS[key] ?? "#8c2208";
}

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

const StoryLink: React.FC<{
  href: string;
  className?: string;
  openInNew?: boolean;
  children: React.ReactNode;
}> = ({ href, className, openInNew, children }) => {
  const external = isExternal(href) || openInNew;
  if (external) {
    return (
      <a
        href={href}
        className={className || undefined}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className || undefined}>
      {children}
    </Link>
  );
};

function dbArticlesToNewsArticles(rows: any[]): NewsArticle[] {
  return rows.map((a) => ({
    title: a.title,
    excerpt: a.excerpt || "",
    date: a.published_at
      ? new Date(a.published_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date(a.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    image_url: a.image_url || "",
    link_url: `/news/${a.slug}`,
    tag: a.category,
    open_in_new: false,
  }));
}

function StoriesHeader({
  eyebrow,
  heading,
  headingHighlight,
  subtitle,
  newsTabLabel,
  videoTabLabel,
  showVideos,
  onSelectNews,
  onSelectVideos,
}: {
  eyebrow?: string;
  heading: string;
  headingHighlight: string;
  subtitle?: string;
  newsTabLabel: string;
  videoTabLabel: string;
  showVideos: boolean;
  onSelectNews: () => void;
  onSelectVideos: () => void;
}) {
  return (
    <header className="cr-stories__header">
      <div className="cr-stories__intro">
        {eyebrow ? (
          <p className="cr-stories__eyebrow">
            <i className="fa-solid fa-rss" aria-hidden />
            {eyebrow}
          </p>
        ) : null}
        <h2 className="cr-stories__title" id="stories-section-title">
          {heading}{" "}
          <span className="cr-stories__title-accent">{headingHighlight}</span>
        </h2>
        {subtitle ? <p className="cr-stories__subtitle">{subtitle}</p> : null}
      </div>

      <div className="cr-stories__tabs" role="tablist" aria-label="Stories media">
        <button
          type="button"
          role="tab"
          aria-selected={!showVideos}
          aria-controls="cr-stories-panel-news"
          onClick={onSelectNews}
          className={`cr-stories__tab${!showVideos ? " cr-stories__tab--active" : ""}`}
        >
          <i className="fa-solid fa-newspaper" aria-hidden />
          {newsTabLabel}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={showVideos}
          aria-controls="cr-stories-panel-videos"
          onClick={onSelectVideos}
          className={`cr-stories__tab cr-stories__tab--video${showVideos ? " cr-stories__tab--active" : ""}`}
        >
          <i className="fa-brands fa-youtube" aria-hidden />
          {videoTabLabel}
        </button>
      </div>
    </header>
  );
}

function SideStoryCard({ article }: { article: NewsArticle }) {
  const img = articleImage(article);
  const color = tagColor(article.tag);

  const inner = (
    <>
      <div
        className="cr-stories__card-thumb"
        style={
          img
            ? { backgroundImage: `url('${img.replace(/'/g, "%27")}')` }
            : undefined
        }
        role="img"
        aria-label=""
      />
      <div className="cr-stories__card-body">
        <div className="cr-stories__card-meta">
          {article.tag ? (
            <span
              className="cr-stories__card-tag"
              style={{ "--story-tag-color": color } as React.CSSProperties}
            >
              {article.tag}
            </span>
          ) : (
            <span />
          )}
          {article.date ? (
            <span className="cr-stories__card-date">
              <i className="fa-regular fa-calendar" aria-hidden />
              {article.date}
            </span>
          ) : null}
        </div>
        <h3 className="cr-stories__card-title">{article.title}</h3>
        {article.excerpt ? (
          <p className="cr-stories__card-excerpt">{article.excerpt}</p>
        ) : null}
        <span className="cr-stories__card-action">
          Read Story <i className="fa-solid fa-arrow-right" aria-hidden />
        </span>
      </div>
    </>
  );

  if (article.link_url) {
    return (
      <StoryLink
        href={article.link_url}
        className="cr-stories__card"
        openInNew={article.open_in_new}
      >
        {inner}
      </StoryLink>
    );
  }

  return <article className="cr-stories__card">{inner}</article>;
}

export default function NewsCards({
  eyebrow = "Latest from Caritas Rwanda",
  heading = "Stories &",
  heading_highlight = "Updates",
  subtitle = "Inspiring stories from the communities we serve",
  view_all_url = "/news",
  view_all_label = "View All News & Stories",
  news_tab_label = "Click to see News",
  video_tab_label = "Click to see Video",
  youtube_channel_url,
  articles: articlesProp,
  videoGalleryProps,
}: NewsCardsProps) {
  const [dbArticles, setDbArticles] = useState<NewsArticle[] | null>(null);

  useEffect(() => {
    if (articlesProp && articlesProp.length > 0) {
      setDbArticles(null);
      return;
    }
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("news_articles")
      .select("title, excerpt, image_url, slug, category, published_at, created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (cancelled || !data) return;
        setDbArticles(dbArticlesToNewsArticles(data));
      });
    return () => {
      cancelled = true;
    };
  }, [articlesProp]);

  const list =
    articlesProp && articlesProp.length > 0
      ? articlesProp
      : dbArticles && dbArticles.length > 0
        ? dbArticles
        : DEFAULT_ARTICLES;

  const slides = list.slice(0, Math.min(3, list.length));
  const [active, setActive] = useState(0);
  const [showVideos, setShowVideos] = useState(false);
  const activeSlide = slides.length > 0 ? active % slides.length : 0;

  const n = list.length;
  const side0 = n >= 2 ? list[1] : null;
  const side1 = n >= 3 ? list[2] : null;
  const side2 = n >= 4 ? list[3] : null;
  const showSides = Boolean(side0);

  const gridClass = showSides
    ? side2
      ? "cr-stories__grid cr-stories__grid--three-sides"
      : "cr-stories__grid"
    : "cr-stories__grid cr-stories__grid--feature-only";

  const advance = useCallback(() => {
    if (slides.length <= 1) return;
    setActive((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(advance, 6000);
    return () => clearInterval(t);
  }, [slides.length, advance]);

  const videoProps = videoGalleryProps as Record<string, unknown> | undefined;

  return (
    <section
      className="cr-stories stories"
      id="stories"
      aria-labelledby="stories-section-title"
    >
      <div className="cr-stories__inner">
        <div className="cr-stories__viewport">
          <div
            className={`cr-stories__panels${showVideos ? " cr-stories__panels--videos" : ""}`}
          >
            {/* News panel */}
            <div
              className="cr-stories__panel cr-stories__panel--news"
              id="cr-stories-panel-news"
              role="tabpanel"
              aria-hidden={showVideos}
            >
              <StoriesHeader
                eyebrow={eyebrow}
                heading={heading}
                headingHighlight={heading_highlight}
                subtitle={subtitle}
                newsTabLabel={news_tab_label}
                videoTabLabel={video_tab_label}
                showVideos={showVideos}
                onSelectNews={() => setShowVideos(false)}
                onSelectVideos={() => setShowVideos(true)}
              />

              <div className="cr-stories__shell">
                <div className="cr-stories__frame">
                  <div className={gridClass}>
                    {slides.length > 0 && (
                      <div
                        className="cr-stories__featured"
                        role="region"
                        aria-label="Featured stories"
                        aria-roledescription="carousel"
                      >
                        {slides.map((article, idx) => {
                          const img = articleImage(article);
                          return (
                            <div
                              key={`${article.title}-${idx}`}
                              className={
                                idx === activeSlide
                                  ? "cr-stories__slide cr-stories__slide--active"
                                  : "cr-stories__slide"
                              }
                              aria-hidden={idx !== activeSlide}
                            >
                              <div
                                className="cr-stories__slide-media"
                                style={
                                  img
                                    ? {
                                        backgroundImage: `url('${img.replace(/'/g, "%27")}')`,
                                      }
                                    : undefined
                                }
                              />
                              <div className="cr-stories__slide-panel">
                                <div className="cr-stories__slide-meta">
                                  {article.tag ? (
                                    <span className="cr-stories__slide-tag">
                                      {article.tag}
                                    </span>
                                  ) : null}
                                  {article.date ? (
                                    <span className="cr-stories__slide-date">
                                      <i
                                        className="fa-regular fa-calendar"
                                        aria-hidden
                                      />
                                      {article.date}
                                    </span>
                                  ) : null}
                                </div>
                                <h3 className="cr-stories__slide-title">
                                  {article.title}
                                </h3>
                                {article.excerpt ? (
                                  <p className="cr-stories__slide-excerpt">
                                    {article.excerpt}
                                  </p>
                                ) : null}
                                {article.link_url ? (
                                  <StoryLink
                                    href={article.link_url}
                                    className="cr-stories__slide-link"
                                    openInNew={article.open_in_new}
                                  >
                                    Read Full Story{" "}
                                    <i
                                      className="fa-solid fa-arrow-right"
                                      aria-hidden
                                    />
                                  </StoryLink>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}

                        {slides.length > 1 && (
                          <div
                            className="cr-stories__dots"
                            role="tablist"
                            aria-label="Choose story"
                          >
                            {slides.map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                role="tab"
                                aria-selected={i === activeSlide}
                                className={
                                  i === activeSlide
                                    ? "cr-stories__dot cr-stories__dot--active"
                                    : "cr-stories__dot"
                                }
                                onClick={() => setActive(i)}
                                aria-label={`Story ${i + 1} of ${slides.length}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {side0 ? <SideStoryCard article={side0} /> : null}
                    {side1 ? <SideStoryCard article={side1} /> : null}
                    {side2 ? <SideStoryCard article={side2} /> : null}
                  </div>

                  {view_all_url && view_all_label ? (
                    <div className="cr-stories__footer">
                      <StoryLink
                        href={view_all_url}
                        className="cr-stories__cta"
                        openInNew={isExternal(view_all_url)}
                      >
                        <i className="fa-solid fa-newspaper" aria-hidden />
                        {view_all_label}
                        <i className="fa-solid fa-arrow-right" aria-hidden />
                      </StoryLink>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Video panel */}
            <div
              className="cr-stories__panel cr-stories__panel--videos"
              id="cr-stories-panel-videos"
              role="tabpanel"
              aria-hidden={!showVideos}
            >
              <StoriesHeader
                eyebrow="Stay Informed"
                heading="Stories in"
                headingHighlight="Motion"
                subtitle="Watch our impactful work across communities"
                newsTabLabel={news_tab_label}
                videoTabLabel={video_tab_label}
                showVideos={showVideos}
                onSelectNews={() => setShowVideos(false)}
                onSelectVideos={() => setShowVideos(true)}
              />

              <div className="cr-stories__shell">
                <div className="cr-stories__frame">
                  <div className="cr-stories__video-wrap">
                    <VideoGallerySection
                      isNested
                      youtube_channel_url={
                        youtube_channel_url ||
                        (videoProps?.youtube_channel_url as string | undefined)
                      }
                      layout={
                        (videoProps?.layout as VideoGalleryLayout | undefined) ||
                        "grid"
                      }
                      videos={
                        (videoProps?.videos as unknown[]) || [
                          {
                            key: "1",
                            youtube_id: "dQw4w9WgXcQ",
                            title: "Caritas Rwanda in Action",
                            description:
                              "See how our programs are transforming communities across Rwanda.",
                            category: "Highlights",
                          },
                          {
                            key: "2",
                            youtube_id: "dQw4w9WgXcQ",
                            title: "Community Health Outreach",
                            description:
                              "Bringing healthcare services to remote communities.",
                            category: "Health",
                          },
                          {
                            key: "3",
                            youtube_id: "dQw4w9WgXcQ",
                            title: "Sustainable Development Goals",
                            description:
                              "Working towards a better future for all Rwandans.",
                            category: "Development",
                          },
                        ]
                      }
                      {...videoProps}
                      eyebrow=""
                      heading_lead=""
                      heading_accent=""
                      subtitle=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
