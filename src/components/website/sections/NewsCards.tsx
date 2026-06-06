"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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
  articles?: NewsArticle[];
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

export default function NewsCards({
  eyebrow = "Latest from Caritas Rwanda",
  heading = "News &",
  heading_highlight = "Stories",
  subtitle = "Inspiring stories from the communities we serve",
  view_all_url = "/news",
  view_all_label = "View All News & Stories",
  articles: articlesProp
}: NewsCardsProps) {
  const list =
    articlesProp && articlesProp.length > 0 ? articlesProp : DEFAULT_ARTICLES;
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
                <div className="flex justify-between items-center mb-2">
                  {eyebrow ? (
                    <div className="section-eyebrow" style={{ marginBottom: 0 }}>
                      <i className="fa-solid fa-newspaper" aria-hidden />
                      {eyebrow}
                    </div>
                  ) : <div />}
                  <button
                    type="button"
                    onClick={() => setShowVideos(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '1px solid rgba(145,19,19,0.25)',
                      borderRadius: '9999px',
                      padding: '6px 14px',
                      background: 'transparent',
                      color: '#911313',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.03em',
                      transition: 'all 0.25s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(145,19,19,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <i className="fa-solid fa-play" style={{ fontSize: '10px' }} />
                    Stories in Motion
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: '9px' }} />
                  </button>
                </div>
                <h2 className="section-title" id="stories-section-title">
                  {heading} <span>{heading_highlight}</span>
                </h2>
                {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
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
                <div className="flex justify-between items-center mb-2">
                  <div className="section-eyebrow" style={{ marginBottom: 0 }}>
                    <i className="fa-solid fa-play" aria-hidden />
                    Caritas Rwanda
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVideos(false)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '1px solid #911313',
                      borderRadius: '9999px',
                      padding: '6px 14px',
                      background: '#911313',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.03em',
                      transition: 'all 0.25s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <i className="fa-solid fa-chevron-left" style={{ fontSize: '9px' }} />
                    News & Stories
                  </button>
                </div>
                <h2 className="section-title">
                  Stories in <span>Motion</span>
                </h2>
                <p className="section-subtitle">Watch our impactful work across communities</p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}>
                {[
                  {
                    title: 'Caritas Rwanda in Action',
                    desc: 'See how our programs are transforming communities across Rwanda.',
                    id: 'dQw4w9WgXcQ',
                  },
                  {
                    title: 'Community Health Outreach',
                    desc: 'Bringing healthcare services to remote communities.',
                    id: 'dQw4w9WgXcQ',
                  },
                  {
                    title: 'Sustainable Development Goals',
                    desc: 'Working towards a better future for all Rwandans.',
                    id: 'dQw4w9WgXcQ',
                  },
                ].map((video, i) => (
                  <a
                    key={i}
                    href={`https://youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      background: '#ffffff',
                      border: '1px solid rgba(0,0,0,0.07)',
                      textDecoration: 'none',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      height: '180px',
                      background: '#1a1a2e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <div style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(6px)',
                          border: '2px solid rgba(255,255,255,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '1.1rem',
                        }}>
                          <i className="fa-solid fa-play" style={{ marginLeft: '3px' }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '1.2rem 1.25rem 1.4rem' }}>
                      <h4 style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: '#0d1b2a',
                        margin: '0 0 0.4rem',
                        lineHeight: 1.3,
                      }}>
                        {video.title}
                      </h4>
                      <p style={{
                        fontSize: '0.8rem',
                        color: '#5a6a7a',
                        margin: 0,
                        lineHeight: 1.55,
                      }}>
                        {video.desc}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
