"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  encodeProgramAssetUrl,
  formatProgramDate,
  type ProgramCategoryRow,
  type ProgramRow,
} from "@/lib/programs";
import {
  encodePublicationAssetUrl,
  publicationHasPdf,
  type PublicationRow,
} from "@/lib/publications";
import { formatPublishedDate, type NewsArticleRow } from "@/lib/news";
import RwandaMapBackground from "./RwandaMapBackground";

type Props = {
  programs: ProgramRow[];
  categories: ProgramCategoryRow[];
  successStories: PublicationRow[];
  news: NewsArticleRow[];
};

function pillarSlugFromHash(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#/, "").trim();
}

export default function ProgramsLibrary({ programs, categories, successStories, news }: Props) {
  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label),
      ),
    [categories],
  );

  const [activeTab, setActiveTab] = useState<string>(sortedCategories[0]?.slug || "");
  const [activeProgram, setActiveProgram] = useState<(ProgramRow & any) | null>(null);
  const [activeStory, setActiveStory] = useState<PublicationRow | null>(null);
  const [activeNews, setActiveNews] = useState<NewsArticleRow | null>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Sync from hash on mount & hashchange
  useEffect(() => {
    function syncFromHash() {
      const raw = pillarSlugFromHash();
      if (!raw) return;
      if (sortedCategories.some((c) => c.slug === raw)) {
        setActiveTab(raw);
      }
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [sortedCategories]);

  // Toggle sticky class on tab bar
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    function handleSticky() {
      const top = bar.getBoundingClientRect().top;
      bar.classList.toggle("is-stuck", top <= 70);
    }
    handleSticky();
    window.addEventListener("scroll", handleSticky, { passive: true });
    return () => window.removeEventListener("scroll", handleSticky);
  }, []);

  // Close drawers on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (activeStory) setActiveStory(null);
        else if (activeNews) setActiveNews(null);
        else if (activeProgram) setActiveProgram(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeStory, activeNews, activeProgram]);

  // Lock body scroll when any drawer is open
  useEffect(() => {
    document.body.style.overflow = activeProgram || activeStory || activeNews ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeProgram, activeStory, activeNews]);

  // Switch tab & update hash
  function switchTab(slug: string) {
    setActiveTab(slug);
    window.history.replaceState(null, "", `#${slug}`);
  }

  const activeCategory = sortedCategories.find((c) => c.slug === activeTab);
  const activeStories = successStories.filter(
    (s) => s.department_id === activeCategory?.id,
  );
  const activeNewsArticles = news.filter(
    (a) => a.department_id === activeCategory?.id,
  );

  return (
    <>
      {/* ── Sticky Tab Bar ── */}
      <div className="prog-tab-bar" ref={tabBarRef}>
        <div className="prog-tab-inner">
          {sortedCategories.map((cat) => {
            const count = programs.filter((p) => p.category === cat.slug).length;
            return (
              <button
                key={cat.id}
                type="button"
                id={`tab-${cat.slug}`}
                className={`prog-tab-btn${activeTab === cat.slug ? " active" : ""}`}
                onClick={() => switchTab(cat.slug)}
                aria-selected={activeTab === cat.slug}
                role="tab"
                style={{ "--dept-color": cat.accent || "#1a1a1a" } as React.CSSProperties}
              >
                {cat.plural_label || cat.label}
                {count > 0 && (
                  <span className="prog-tab-count">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Panels ── */}
      {sortedCategories.map((cat) => {
        if (activeTab !== cat.slug) return null;

        const items = programs.filter((p) => p.category === cat.slug);
        if (items.length === 0) {
          return (
            <div key={cat.id} className="prog-panel active" role="tabpanel" aria-labelledby={`tab-${cat.slug}`}>
              <div className="prog-empty">
                Programs are coming soon for this pillar.
              </div>
            </div>
          );
        }

        return (
          <div
            key={cat.id}
            className="prog-panel active"
            role="tabpanel"
            aria-labelledby={`tab-${cat.slug}`}
            style={{ "--dept-color": cat.accent || "#1a1a1a" } as React.CSSProperties}
          >
            {/* ── Panel Header ── */}
            <div className="prog-panel-header">
              <div className="prog-panel-header-inner">
                <div className="prog-panel-eyebrow">
                  {cat.label}
                </div>
                <h2 className="prog-panel-title">
                  {cat.description || `${cat.label} Programs`}
                </h2>
                <p className="prog-panel-desc">
                  Explore the projects and initiatives under the {cat.label.toLowerCase()} department, serving communities across Rwanda.
                </p>

              </div>
            </div>

            {/* ── Program Cards Section (with Rwanda map background) ── */}
            <div className="prog-ref-section">
              <RwandaMapBackground />
              <div className="prog-ref-inner">


                <div className="prog-ref-list">
                  {items.map((p, idx) => (
                    <ProgramCardMinimal
                      key={p.id}
                      row={p}
                      index={idx}
                      onClick={() => setActiveProgram(p)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Success Stories ── */}
            {activeStories.length > 0 && (
              <div className="prog-success-section">
                <div className="prog-success-header">
                  <span className="prog-success-label">
                    {cat.label}
                  </span>
                  <h3 className="prog-success-title">Success Stories</h3>
                  <p className="prog-success-sub">
                    Real stories of lives transformed through the {cat.label.toLowerCase()} department.
                  </p>
                </div>

                <div className="prog-success-grid">
                  {activeStories.map((story) => (
                    <SuccessStoryCard
                      key={story.id}
                      story={story}
                      onClick={() => setActiveStory(story)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Latest News ── */}
            {activeNewsArticles.length > 0 && (
              <div className="prog-news-section">
                <div className="prog-news-header">
                  <span className="prog-news-label">
                    {cat.label}
                  </span>
                  <h3 className="prog-news-title">Latest News</h3>
                  <p className="prog-news-sub">
                    Updates and stories from the {cat.label.toLowerCase()} department.
                  </p>
                </div>

                <div className="prog-news-grid">
                  {activeNewsArticles.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      onClick={() => setActiveNews(article)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Program Drawer ── */}
      <ProgramDrawer
        program={activeProgram}
        categories={categories}
        onClose={() => setActiveProgram(null)}
      />

      {/* ── Success Story Drawer ── */}
      <SuccessStoryDrawer
        story={activeStory}
        onClose={() => setActiveStory(null)}
      />

      {/* ── News Drawer ── */}
      <NewsDrawer
        article={activeNews}
        onClose={() => setActiveNews(null)}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Minimal Program Card                                                */
/* ------------------------------------------------------------------ */
function ProgramCardMinimal({ row, index, onClick }: { row: any; index: number; onClick: () => void }) {
  const imageUrl = row.cover_image_url?.trim()
    ? encodeProgramAssetUrl(row.cover_image_url)
    : null;

  const isLeft = index % 2 === 0;

  return (
    <div className={`prog-card-min-wrap ${isLeft ? "align-left" : "align-right"}`}>
      <div
        className="prog-card-min"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
        aria-label={`View details for ${row.title}`}
      >
        <div className="prog-card-min-top">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={row.cover_image_alt || row.title}
              className="prog-card-min-img"
            />
          ) : (
            <div className="prog-card-min-img prog-card-min-img-placeholder" />
          )}
          <div className="prog-card-min-header">
            <h3 className="prog-card-min-title">{row.title}</h3>
            {row.subtitle ? (
              <p className="prog-card-min-tagline">&ldquo;{row.subtitle}&rdquo;</p>
            ) : null}
          </div>
        </div>

        {row.excerpt ? (
          <p className="prog-card-min-desc">{row.excerpt}</p>
        ) : null}

        <div className="prog-card-min-meta">
          <span className="prog-card-min-meta-item">
            <span className="prog-card-min-meta-label">Location</span>
            <span className="prog-card-min-meta-value">{row.location || "TBD"}</span>
          </span>
          <span className="prog-card-min-meta-divider" />
          <span className="prog-card-min-meta-item">
            <span className="prog-card-min-meta-label">Contact</span>
            <span className="prog-card-min-meta-value">{row.contact_phone || "TBD"}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Success Story Card                                                 */
/* ------------------------------------------------------------------ */
function SuccessStoryCard({
  story,
  onClick,
}: {
  story: PublicationRow;
  onClick: () => void;
}) {
  const imageUrl = story.cover_image_url?.trim()
    ? encodePublicationAssetUrl(story.cover_image_url)
    : null;

  return (
    <div
      className="prog-success-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Read story: ${story.title}`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={story.cover_image_alt || story.title}
          className="prog-success-image"
        />
      ) : (
        <div className="prog-success-image" style={{ background: "#f3f4f6" }} />
      )}

      <div className="prog-success-body">
        <h4 className="prog-success-name">{story.title}</h4>
        {story.excerpt ? (
          <p className="prog-success-desc">{story.excerpt}</p>
        ) : null}
        <span className="prog-success-read">
          Read full story
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Program Drawer (Slide-in Panel)                                     */
/* ------------------------------------------------------------------ */
function ProgramDrawer({
  program,
  categories,
  onClose,
}: {
  program: (ProgramRow & any) | null;
  categories: ProgramCategoryRow[];
  onClose: () => void;
}) {
  const cat = categories.find((c) => program && c.slug === program.category) ?? null;
  const isOpen = Boolean(program);

  return (
    <>
      <div
        className={`drawer-backdrop${isOpen ? " open" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`drawer-panel${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={program?.title || "Program details"}
        style={{ "--dept-color": cat?.accent || "#1a1a1a" } as React.CSSProperties}
      >
        {program && (
          <>
            <button className="drawer-close" type="button" onClick={onClose} aria-label="Close">
              &times;
            </button>

            {program.cover_image_url?.trim() ? (
              <div className="drawer-hero-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodeProgramAssetUrl(program.cover_image_url)}
                  alt={program.cover_image_alt || program.title}
                />
              </div>
            ) : (
              <div className="drawer-hero-placeholder" />
            )}

            <div className="drawer-content">
              <div>
                {cat ? (
                  <span className="drawer-category-pill">{cat.label}</span>
                ) : null}
                <h2 className="drawer-title">{program.title}</h2>
                {program.subtitle ? (
                  <p className="drawer-subtitle">&ldquo;{program.subtitle}&rdquo;</p>
                ) : null}
              </div>

              <div className="drawer-divider" />

              {program.excerpt ? (
                <p className="drawer-desc">{program.excerpt}</p>
              ) : null}

              <div className="drawer-info-section">
                <h3 className="drawer-info-heading">Program Details</h3>
                <div className="drawer-info-grid-2col">
                  {program.location ? (
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Location</span>
                      <span className="drawer-info-value">{program.location}</span>
                    </div>
                  ) : null}
                  {program.contact_phone ? (
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Contact</span>
                      <a href={`tel:${program.contact_phone.replace(/\s/g, "")}`} className="drawer-info-value drawer-info-link">
                        {program.contact_phone}
                      </a>
                    </div>
                  ) : null}
                  {program.tag_label ? (
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Program Type</span>
                      <span className="drawer-info-value">{program.tag_label}</span>
                    </div>
                  ) : null}
                  {program.published_at ? (
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Since</span>
                      <span className="drawer-info-value">{formatProgramDate(program.published_at)}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {program.body ? (
                <div className="drawer-body-section">
                  <h3 className="drawer-info-heading">About this Program</h3>
                  <div className="drawer-body-html" dangerouslySetInnerHTML={{ __html: program.body }} />
                </div>
              ) : null}

              {program.external_url?.trim() ? (
                <div className="drawer-ext-link">
                  <div>
                    <span className="drawer-ext-link-label">Learn more</span>
                    <a href={program.external_url} target="_blank" rel="noopener noreferrer" className="drawer-info-link">
                      Visit program page
                    </a>
                  </div>
                </div>
              ) : null}

              <div className="drawer-cta-block">
                <p className="drawer-cta-text">
                  For more information, reach out to the project manager.
                </p>
                {program.contact_phone ? (
                  <a href={`tel:${program.contact_phone.replace(/\s/g, "")}`} className="drawer-cta-btn">
                    {program.contact_phone}
                  </a>
                ) : null}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* News Card                                                            */
/* ------------------------------------------------------------------ */
function NewsCard({
  article,
  onClick,
}: {
  article: NewsArticleRow;
  onClick: () => void;
}) {
  return (
    <div
      className="prog-news-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Read article: ${article.title}`}
    >
      {article.image_url?.trim() ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.image_url}
          alt={article.image_alt || article.title}
          className="prog-news-image"
        />
      ) : (
        <div className="prog-news-image" style={{ background: "#f3f4f6" }} />
      )}

      <div className="prog-news-body">
        {article.published_at ? (
          <span className="prog-news-date">{formatPublishedDate(article.published_at)}</span>
        ) : null}
        <h4 className="prog-news-name">{article.title}</h4>
        {article.excerpt ? (
          <p className="prog-news-desc">{article.excerpt}</p>
        ) : null}
        <span className="prog-news-read">
          Read article
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* News Drawer (Slide-in Panel)                                        */
/* ------------------------------------------------------------------ */
function NewsDrawer({
  article,
  onClose,
}: {
  article: NewsArticleRow | null;
  onClose: () => void;
}) {
  const isOpen = Boolean(article);
  const hasExternal = Boolean(article?.external_url?.trim());
  const hasBody = Boolean(article?.body?.trim());

  return (
    <>
      <div className={`drawer-backdrop${isOpen ? " open" : ""}`} onClick={onClose} aria-hidden />
      <aside
        className={`drawer-panel${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={article?.title || "News article"}
      >
        {article && (
          <>
            <button className="drawer-close" type="button" onClick={onClose} aria-label="Close">
              &times;
            </button>
            {article.image_url?.trim() ? (
              <div className="drawer-hero-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.image_url} alt={article.image_alt || article.title} />
              </div>
            ) : (
              <div className="drawer-hero-placeholder" />
            )}
            <div className="drawer-content">
              <div>
                <span className="drawer-category-pill" style={{ color: "#1a1a1a", borderColor: "rgba(0,0,0,0.12)", background: "rgba(0,0,0,0.04)" }}>
                  News
                </span>
                {article.published_at ? (
                  <p className="drawer-meta-date">{formatPublishedDate(article.published_at)}</p>
                ) : null}
                <h2 className="drawer-title">{article.title}</h2>
                {article.excerpt ? <p className="drawer-subtitle">{article.excerpt}</p> : null}
              </div>
              <div className="drawer-divider" />
              {hasExternal && (
                <div className="drawer-info-section" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <a href={article.external_url!} target="_blank" rel="noopener noreferrer" className="drawer-cta-btn" style={{ background: "#1a1a1a" }}>
                    Read Full Article
                  </a>
                </div>
              )}
              {hasBody ? (
                <div className="drawer-body-section">
                  <h3 className="drawer-info-heading">Article</h3>
                  <div className="drawer-body-html" dangerouslySetInnerHTML={{ __html: article.body! }} />
                </div>
              ) : !hasExternal ? (
                <p className="drawer-desc" style={{ color: "#9ca3af", fontStyle: "italic" }}>
                  Full article content coming soon.
                </p>
              ) : null}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Success Story Drawer                                                 */
/* ------------------------------------------------------------------ */
function SuccessStoryDrawer({
  story,
  onClose,
}: {
  story: PublicationRow | null;
  onClose: () => void;
}) {
  const isOpen = Boolean(story);
  const hasPdf = story ? publicationHasPdf(story) : false;
  const hasExternal = Boolean(story?.external_url?.trim());
  const hasBody = Boolean(story?.body?.trim());

  return (
    <>
      <div className={`drawer-backdrop${isOpen ? " open" : ""}`} onClick={onClose} aria-hidden />
      <aside
        className={`drawer-panel${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={story?.title || "Success story"}
      >
        {story && (
          <>
            <button className="drawer-close" type="button" onClick={onClose} aria-label="Close">
              &times;
            </button>
            {story.cover_image_url?.trim() ? (
              <div className="drawer-hero-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={encodePublicationAssetUrl(story.cover_image_url)} alt={story.cover_image_alt || story.title} />
              </div>
            ) : (
              <div className="drawer-hero-placeholder" />
            )}
            <div className="drawer-content">
              <div>
                <span className="drawer-category-pill" style={{ color: "#1a1a1a", borderColor: "rgba(0,0,0,0.12)", background: "rgba(0,0,0,0.04)" }}>
                  Success Story
                </span>
                <h2 className="drawer-title">{story.title}</h2>
                {story.excerpt ? <p className="drawer-subtitle">{story.excerpt}</p> : null}
              </div>
              <div className="drawer-divider" />
              {(hasPdf || hasExternal) && (
                <div className="drawer-info-section" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {hasPdf && (
                    <a href={encodePublicationAssetUrl(story.file_url)} target="_blank" rel="noopener noreferrer" className="drawer-cta-btn" style={{ background: "#1a1a1a" }}>
                      Open PDF
                    </a>
                  )}
                  {hasExternal && (
                    <a href={story.external_url!} target="_blank" rel="noopener noreferrer" className="drawer-cta-btn" style={{ background: "#111111" }}>
                      Read Full Article
                    </a>
                  )}
                </div>
              )}
              {hasBody ? (
                <div className="drawer-body-section">
                  <h3 className="drawer-info-heading">Story</h3>
                  <div className="drawer-body-html" dangerouslySetInnerHTML={{ __html: story.body! }} />
                </div>
              ) : !hasPdf && !hasExternal ? (
                <p className="drawer-desc" style={{ color: "#9ca3af", fontStyle: "italic" }}>
                  Full story content coming soon.
                </p>
              ) : null}
              {(story.meta_line || story.period_label) ? (
                <div className="drawer-info-section">
                  <div className="drawer-info-grid-2col">
                    {story.meta_line ? (
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Details</span>
                        <span className="drawer-info-value">{story.meta_line}</span>
                      </div>
                    ) : null}
                    {story.period_label ? (
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Period</span>
                        <span className="drawer-info-value">{story.period_label}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
