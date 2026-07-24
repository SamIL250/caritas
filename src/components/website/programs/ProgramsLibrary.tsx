"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  encodeProgramAssetUrl,
  formatProgramDate,
  type ProgramCategoryRow,
  type ProgramRow,
} from "@/lib/programs";
import Link from "next/link";
import {
  encodePublicationAssetUrl,
  publicationHasPdf,
  publicationDetailHref,
  type PublicationRow,
} from "@/lib/publications";
import { formatPublishedDate, type NewsArticleRow } from "@/lib/news";
import RwandaMapBackground from "./RwandaMapBackground";
import { ProgramBubbleCircle } from "./ProgramBubbleCircle";
import type { ProgramsLibrarySectionContent } from "@/lib/programs-library-section";
import { DEFAULT_PROGRAMS_LIBRARY_SECTION } from "@/lib/programs-library-section";

const PROGRAM_GRID_COLUMNS = 4;
const SUCCESS_STORY_ROWS = 1;
const NEWS_ROWS = 2;

const SUCCESS_STORIES_PER_ROW = PROGRAM_GRID_COLUMNS;
const NEWS_VISIBLE = PROGRAM_GRID_COLUMNS * NEWS_ROWS;

type Props = {
  programs: ProgramRow[];
  categories: ProgramCategoryRow[];
  successStories: PublicationRow[];
  news: NewsArticleRow[];
  libraryConfig?: ProgramsLibrarySectionContent;
};

export default function ProgramsLibrary({
  programs,
  categories,
  successStories,
  news,
  libraryConfig = DEFAULT_PROGRAMS_LIBRARY_SECTION,
}: Props) {
  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label),
      ),
    [categories],
  );

  const [activeTab, setActiveTab] = useState<string>(sortedCategories[0]?.slug || "");
  const [activeProgram, setActiveProgram] = useState<(ProgramRow & any) | null>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Sync tab from URL hash
  useEffect(() => {
    const syncFromHash = () => {
      const raw = window.location.hash.replace(/^#/, "").trim();
      if (raw && sortedCategories.some((c) => c.slug === raw)) {
        setTimeout(() => setActiveTab(raw), 0);
      }
    };

    // hashchange — catches native hash changes and synthetic events
    window.addEventListener("hashchange", syncFromHash);
    // popstate — catches browser back/forward
    window.addEventListener("popstate", syncFromHash);
    // Initial sync
    syncFromHash();

    // Intercept history methods so that Next.js Link navigation (pushState/replaceState)
    // dispatches a hashchange event — these methods do NOT fire it natively.
    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);

    history.pushState = ((data: any, unused: string, url?: string | URL | null) => {
      origPush(data, unused, url);
      setTimeout(() => window.dispatchEvent(new HashChangeEvent("hashchange")), 0);
    }) as typeof history.pushState;

    history.replaceState = ((data: any, unused: string, url?: string | URL | null) => {
      origReplace(data, unused, url);
      setTimeout(() => window.dispatchEvent(new HashChangeEvent("hashchange")), 0);
    }) as typeof history.replaceState;

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, [sortedCategories]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Rely on native CSS `position: sticky` for the tab bar.

  // Close drawers on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (activeProgram) setActiveProgram(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeProgram]);

  // Lock body scroll when any drawer is open
  useEffect(() => {
    document.body.style.overflow = activeProgram ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeProgram]);

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

  function categoryNewsHref(slug: string) {
    return `/news?topic=${encodeURIComponent(slug)}`;
  }

  return (
    <>
      {/* ── Sticky Tab Bar ── */}
      <div ref={sentinelRef} style={{ height: 0, margin: 0, padding: 0, border: 0 }} />
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
                <ProgramBubbleGallery
                  items={items}
                  initialCount={libraryConfig.bubble_initial_count}
                  viewAllLabel={libraryConfig.view_all_label}
                  viewAllLessLabel={libraryConfig.view_all_less_label}
                  onClick={(p) => setActiveProgram(p)}
                />
              </div>
            </div>

            {libraryConfig.show_success_stories && activeStories.length > 0 && (
              <SuccessStoriesSection stories={activeStories} category={cat} />
            )}

            {libraryConfig.show_news && activeNewsArticles.length > 0 && (
              <div className="prog-news-section">
                <div className="prog-news-header">
                  <div className="prog-section-head-row">
                    <span className="prog-news-label">
                      {cat.label}
                    </span>
                    <Link
                      href={categoryNewsHref(cat.slug)}
                      className="prog-section-view-more"
                    >
                      View more
                      <i className="fa-solid fa-arrow-right" aria-hidden />
                    </Link>
                  </div>
                  <h3 className="prog-news-title">Latest News</h3>
                  <p className="prog-news-sub">
                    Updates and stories from the {cat.label.toLowerCase()} department.
                  </p>
                </div>

                <div className="prog-news-grid">
                  {activeNewsArticles.slice(0, NEWS_VISIBLE).map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
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
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Bubble Circle Gallery                                                */
/* ------------------------------------------------------------------ */
function ProgramBubbleGallery({
  items,
  initialCount,
  viewAllLabel,
  viewAllLessLabel,
  onClick,
}: {
  items: ProgramRow[];
  initialCount: number;
  viewAllLabel: string;
  viewAllLessLabel: string;
  onClick: (p: ProgramRow) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleCount = Math.max(1, Math.min(initialCount, items.length));
  const displayItems = showAll ? items : items.slice(0, visibleCount);
  const BUBBLE_COLORS = ["bubble-blue", "bubble-tan", "bubble-green"];

  return (
    <div className={`bubble-slider-container ${showAll ? "show-all" : ""}`}>
      <div className="bubble-slider">
        <div className="bs-track-wrap">
          <div
            className="bs-track"
            style={{ flexWrap: showAll ? "wrap" : "nowrap", gap: "2rem", justifyContent: "center" }}
          >
            {displayItems.map((p, idx) => (
              <ProgramBubbleCircle
                key={p.id}
                program={p}
                colorClass={BUBBLE_COLORS[idx % BUBBLE_COLORS.length]}
                onClick={onClick}
              />
            ))}
          </div>
        </div>
      </div>
      {items.length > visibleCount && (
        <div className="bubble-viewall-wrap">
          <button
            type="button"
            className={`bubble-viewall-btn ${showAll ? "active" : ""}`}
            onClick={() => setShowAll(!showAll)}
          >
            <i className={`fa-solid fa-${showAll ? "compress" : "expand"}`} aria-hidden />
            {showAll ? viewAllLessLabel : viewAllLabel}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Success Stories Section                                            */
/* ------------------------------------------------------------------ */
function SuccessStoriesSection({
  stories,
  category,
}: {
  stories: PublicationRow[];
  category: ProgramCategoryRow;
}) {
  const [rowsVisible, setRowsVisible] = useState(SUCCESS_STORY_ROWS);

  useEffect(() => {
    setRowsVisible(SUCCESS_STORY_ROWS);
  }, [category.slug]);

  const visibleCount = rowsVisible * SUCCESS_STORIES_PER_ROW;
  const visibleStories = stories.slice(0, visibleCount);
  const hasMoreStories = stories.length > visibleCount;

  return (
    <div className="prog-success-section">
      <div className="prog-success-header">
        <span className={`stories-eyebrow ${category.slug}-peyebrow`}>
          <i className="fa-solid fa-star mr-2" />
          Success Stories
        </span>
        <h3 className="prog-success-title">Lives Transformed Through {category.label}</h3>
        <p className="prog-success-sub">
          Real stories of dignity restored and lives rebuilt across Rwanda&apos;s communities.
        </p>
      </div>

      <div className="prog-success-grid">
        {visibleStories.map((story) => (
          <SuccessStoryCard
            key={story.id}
            story={story}
            deptSlug={category.slug}
          />
        ))}
      </div>

      {hasMoreStories ? (
        <div className="prog-success-load-more-wrap">
          <button
            type="button"
            className="prog-success-load-more-btn"
            onClick={() => setRowsVisible((rows) => rows + 1)}
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Success Story Card                                                 */
/* ------------------------------------------------------------------ */
function SuccessStoryCard({
  story,
  deptSlug,
}: {
  story: PublicationRow;
  deptSlug: string;
}) {
  const imageUrl = story.cover_image_url?.trim()
    ? encodePublicationAssetUrl(story.cover_image_url)
    : null;

  // Extract initials from title
  const initials = story.title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const customFields = story.custom_fields as Record<string, any> || {};
  const href = publicationDetailHref(story);

  return (
    <Link
      href={href}
      className="story-card cursor-pointer"
    >
      <div className="story-img">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={story.cover_image_alt || story.title} />
        ) : (
          <div style={{ background: "#f3f4f6", width: "100%", height: "100%" }} />
        )}
        <div className="story-img-overlay"></div>
        {story.tag_label ? <div className="story-img-tag">{story.tag_label}</div> : null}
      </div>
      <div className="story-body">
        {story.excerpt ? <p className="story-quote">{story.excerpt}</p> : null}
        <div className="story-person">
          <div className={`story-avatar ${deptSlug}-avatar`}>{initials}</div>
          <div className="story-person-info">
            <div className="story-name">{story.title}</div>
            {story.period_label ? <div className="story-tag">{story.period_label}</div> : null}
          </div>
        </div>
        {customFields.outcome ? (
          <div className={`story-outcome ${deptSlug}-outcome`}>
            <i className="fa-solid fa-arrow-trend-up"></i> {String(customFields.outcome)}
          </div>
        ) : null}
      </div>
    </Link>
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
}: {
  article: NewsArticleRow;
}) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="prog-news-card"
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
    </Link>
  );
}
