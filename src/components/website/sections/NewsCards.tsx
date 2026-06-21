"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import VideoGallerySection from "@/components/website/sections/VideoGallerySection";

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
  /** Text before the highlighted span, e.g. "News &" */
  heading?: string;
  /** Gradient span text, e.g. "Stories" */
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
    tag: "News",
    image_url:
      "https://caritasrwanda.org/wp-content/uploads/2026/03/162A9069-scaled.jpg",
    link_url: "https://caritasrwanda.org/"
  },
  {
    title: "2026 General Assembly of Caritas Rwanda",
    excerpt:
      "The 29th General Assembly was held at Centre Saint Vincent Pallotti-Gikondo, reviewing 2025 achievements and setting priorities for 2026.",
    date: "March 30, 2026",
    tag: "Organizational",
    image_url:
      "https://caritasrwanda.org/wp-content/uploads/2026/03/162A8733-scaled.jpg",
    link_url: "https://caritasrwanda.org/"
  },
  {
    title: "Caritas Humanitarian Conference in Kigali",
    excerpt:
      "Leaders from across the Caritas Internationalis Confederation gathered in Kigali for the Humanitarian Conference 2026.",
    date: "March 9, 2026",
    tag: "International",
    image_url:
      "https://caritasrwanda.org/wp-content/uploads/2026/03/162A7732-scaled.jpg",
    link_url: "https://caritasrwanda.org/"
  }
];

function articleImage(a: NewsArticle) {
  return (a.image_url || a.thumbnail || "").trim();
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
      ? new Date(a.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
      : new Date(a.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
    image_url: a.image_url || "",
    link_url: `/news/${a.slug}`,
    tag: a.category,
    open_in_new: false,
  }));
}

export default function NewsCards({
  eyebrow = "Latest from Caritas Rwanda",
  heading = "News &",
  heading_highlight = "Media",
  subtitle = "Inspiring stories from the communities we serve",
  view_all_url = "/news",
  view_all_label = "View All News & Stories",
  news_tab_label = "Click to see News",
  video_tab_label = "Click to see Video",
  youtube_channel_url,
  articles: articlesProp,
  videoGalleryProps
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
    return () => { cancelled = true; };
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
  const showSides = side0;

  const advance = useCallback(() => {
    if (slides.length <= 1) return;
    setActive((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(advance, 6000);
    return () => clearInterval(t);
  }, [slides.length, advance]);

  return (
    <section className="stories" id="stories" aria-labelledby="stories-section-title">
      <div className="container-wide">
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: showVideos ? 'translateX(-100%)' : 'translateX(0)',
            }}
          >
            {/* ── SLIDE 1: Full News & Stories section ── */}
            <div style={{ width: '100%', flexShrink: 0, height: showVideos ? 0 : 'auto', overflow: showVideos ? 'hidden' : 'visible' }}>
              <div className="stories-header" style={{ paddingTop: 0 }}>
                {/* Header row: eyebrow left + two tab buttons right */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    {eyebrow ? (
                      <div className="section-eyebrow" style={{ marginBottom: '0.75rem' }}>
                        <i className="fa-solid fa-rss" aria-hidden />
                        {eyebrow}
                      </div>
                    ) : <div />}
                    <h2 className="section-title" id="stories-section-title" style={{ marginBottom: subtitle ? '0.4rem' : 0 }}>
                      {heading} <span>{heading_highlight}</span>
                    </h2>
                    {subtitle ? <p className="section-subtitle" style={{ marginBottom: 0 }}>{subtitle}</p> : null}
                  </div>

                  {/* Two tab buttons — matching legacy mh-tab style */}
                  <div className="mh-tabs" role="tablist" style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={!showVideos}
                      aria-controls="mhPanelNews"
                      onClick={() => setShowVideos(false)}
                      className={`mh-tab${!showVideos ? ' active' : ''}`}
                    >
                      <i className="fa-solid fa-newspaper" aria-hidden />
                      {news_tab_label}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={showVideos}
                      aria-controls="mhPanelVideos"
                      onClick={() => setShowVideos(true)}
                      className={`mh-tab${showVideos ? ' active' : ''}`}
                    >
                      <i className="fa-brands fa-youtube" aria-hidden />
                      {video_tab_label}
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={
                  showSides
                    ? "stories-magazine"
                    : "stories-magazine stories-magazine--feature-only"
                }
              >
                {slides.length > 0 && (
                  <div className="story-featured" role="region" aria-label="Featured stories" aria-roledescription="carousel">
                    {slides.map((article, idx) => (
                      <div
                        key={idx}
                        className={idx === activeSlide ? "feat-slide active" : "feat-slide"}
                        aria-hidden={idx !== activeSlide}
                      >
                        <div
                          className="feat-slide-img"
                          style={
                            articleImage(article)
                              ? { backgroundImage: `url('${articleImage(article).replace(/'/g, "%27")}')` }
                              : { background: "#1a2a3a" }
                          }
                        />
                        <div className="feat-slide-overlay" aria-hidden />
                        <div className="feat-slide-content">
                          {article.tag ? (
                            <span className="story-feat-tag">
                              <i className="fa-solid fa-circle-dot" style={{ fontSize: "0.55rem" }} aria-hidden />
                              {article.tag}
                            </span>
                          ) : null}
                          {article.date ? (
                            <div className="story-feat-date">
                              <i className="fa-regular fa-calendar" aria-hidden />
                              {article.date}
                            </div>
                          ) : null}
                          <h3>{article.title}</h3>
                          {article.excerpt ? <p>{article.excerpt}</p> : null}
                          {article.link_url ? (
                            <StoryLink
                              href={article.link_url}
                              className="story-feat-link"
                              openInNew={article.open_in_new}
                            >
                              Read Full Story <i className="fa-solid fa-arrow-right" aria-hidden />
                            </StoryLink>
                          ) : null}
                        </div>
                      </div>
                    ))}
                    {slides.length > 1 && (
                      <div className="feat-dots" role="tablist" aria-label="Choose story">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            role="tab"
                            aria-selected={i === activeSlide}
                            className={i === activeSlide ? "feat-dot active" : "feat-dot"}
                            onClick={() => setActive(i)}
                            aria-label={`Story ${i + 1} of ${slides.length}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {side0 && (
                  <article className="story-small">
                    <div
                      className="story-small-image"
                      style={
                        articleImage(side0)
                          ? { backgroundImage: `url('${articleImage(side0).replace(/'/g, "%27")}')` }
                          : { background: "#1a2a3a" }
                      }
                      role="img"
                      aria-label=""
                    />
                    <div className="story-small-body">
                      <div className="story-small-meta">
                        {side0.tag ? <span className="story-small-tag">{side0.tag}</span> : null}
                        {side0.date ? (
                          <span className="story-small-date">
                            <i className="fa-regular fa-calendar" aria-hidden /> {side0.date}
                          </span>
                        ) : null}
                      </div>
                      <h3>{side0.title}</h3>
                      {side0.excerpt ? <p>{side0.excerpt}</p> : null}
                      {side0.link_url ? (
                        <StoryLink
                          href={side0.link_url}
                          className="story-read"
                          openInNew={side0.open_in_new}
                        >
                          Read Story <i className="fa-solid fa-arrow-right" aria-hidden />
                        </StoryLink>
                      ) : null}
                    </div>
                  </article>
                )}

                {side1 && (
                  <article className="story-small">
                    <div
                      className="story-small-image"
                      style={
                        articleImage(side1)
                          ? { backgroundImage: `url('${articleImage(side1).replace(/'/g, "%27")}')` }
                          : { background: "#1a2a3a" }
                      }
                      role="img"
                      aria-label=""
                    />
                    <div className="story-small-body">
                      <div className="story-small-meta">
                        {side1.tag ? <span className="story-small-tag">{side1.tag}</span> : null}
                        {side1.date ? (
                          <span className="story-small-date">
                            <i className="fa-regular fa-calendar" aria-hidden /> {side1.date}
                          </span>
                        ) : null}
                      </div>
                      <h3>{side1.title}</h3>
                      {side1.excerpt ? <p>{side1.excerpt}</p> : null}
                      {side1.link_url ? (
                        <StoryLink
                          href={side1.link_url}
                          className="story-read"
                          openInNew={side1.open_in_new}
                        >
                          Read Story <i className="fa-solid fa-arrow-right" aria-hidden />
                        </StoryLink>
                      ) : null}
                    </div>
                  </article>
                )}
              </div>

              {view_all_url && view_all_label && (
                <div className="stories-cta">
                  <StoryLink
                    href={view_all_url}
                    openInNew={isExternal(view_all_url)}
                  >
                    <i className="fa-solid fa-newspaper" aria-hidden />
                    {view_all_label}
                    <i className="fa-solid fa-arrow-right" aria-hidden />
                  </StoryLink>
                </div>
              )}
            </div>

            {/* ── SLIDE 2: Full Stories in Motion section (white background) ── */}
            <div style={{ width: '100%', flexShrink: 0, height: showVideos ? 'auto' : 0, overflow: showVideos ? 'visible' : 'hidden' }}>
              <div className="stories-header" style={{ paddingTop: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.25rem' }}>
                  <div>
                    <div className="section-eyebrow" style={{ marginBottom: '0.75rem' }}>
                      <i className="fa-solid fa-rss" aria-hidden />
                      Stay Informed
                    </div>
                    <h2 className="section-title">
                      Stories in <span>Motion</span>
                    </h2>
                    <p className="section-subtitle" style={{ marginBottom: 0 }}>Watch our impactful work across communities</p>
                  </div>

                  <div className="mh-tabs" role="tablist" style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, alignSelf: 'flex-start' }}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={false}
                      aria-controls="mhPanelNews"
                      onClick={() => setShowVideos(false)}
                      className="mh-tab"
                    >
                      <i className="fa-solid fa-newspaper" aria-hidden />
                      {news_tab_label}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={true}
                      aria-controls="mhPanelVideos"
                      onClick={() => setShowVideos(true)}
                      className="mh-tab active"
                    >
                      <i className="fa-brands fa-youtube" aria-hidden />
                      {video_tab_label}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <VideoGallerySection 
                  isNested={true}
                  youtube_channel_url={youtube_channel_url || (videoGalleryProps as any)?.youtube_channel_url}
                  layout={(videoGalleryProps as any)?.layout || "grid"}
                  videos={(videoGalleryProps as any)?.videos || [
                    {
                      key: '1',
                      youtube_id: 'dQw4w9WgXcQ',
                      title: 'Caritas Rwanda in Action',
                      description: 'See how our programs are transforming communities across Rwanda.',
                      category: 'Highlights'
                    },
                    {
                      key: '2',
                      youtube_id: 'dQw4w9WgXcQ',
                      title: 'Community Health Outreach',
                      description: 'Bringing healthcare services to remote communities.',
                      category: 'Health'
                    },
                    {
                      key: '3',
                      youtube_id: 'dQw4w9WgXcQ',
                      title: 'Sustainable Development Goals',
                      description: 'Working towards a better future for all Rwandans.',
                      category: 'Development'
                    }
                  ]}
                  {...(videoGalleryProps as any)}
                  // Ensure these headings stay empty so we don't get duplicate titles inside NewsCards
                  eyebrow={""}
                  heading_lead={""}
                  heading_accent={""}
                  subtitle={""}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
