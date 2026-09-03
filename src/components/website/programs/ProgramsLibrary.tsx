"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLenis } from "lenis/react";
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
import { sortByPublishedNewest } from "@/lib/content-sort";
import RwandaMapBackground from "./RwandaMapBackground";
import { ProgramBubbleCircle } from "./ProgramBubbleCircle";
import type { ProgramsLibrarySectionContent } from "@/lib/programs-library-section";
import { DEFAULT_PROGRAMS_LIBRARY_SECTION } from "@/lib/programs-library-section";
import { parseProgramsHashSlug, replaceProgramsHash } from "@/lib/programs-hash";

const PROGRAM_GRID_COLUMNS = 4;
const SUCCESS_STORY_ROWS = 1;
const NEWS_ROWS = 1;

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
  const lenis = useLenis();

  const scrollToDepartmentSection = useCallback(() => {
    const target = document.querySelector(".prog-dept-tabs");
    if (!(target instanceof HTMLElement)) return;

    const offset = window.matchMedia("(max-width: 768px)").matches ? -64 : -80;
    lenis?.resize();

    if (lenis) {
      lenis.scrollTo(target, { offset, lock: false });
      return;
    }

    const top = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [lenis]);

  // Sync tab from URL hash
  useEffect(() => {
    const syncFromHash = () => {
      const raw = window.location.hash.replace(/^#/, "").trim();
      const slug = parseProgramsHashSlug(window.location.hash);
      if (raw.includes("#") && slug) {
        const url = new URL(window.location.href);
        window.history.replaceState(null, "", `${url.pathname}${url.search}#${slug}`);
      }
      if (slug && sortedCategories.some((c) => c.slug === slug)) {
        setActiveTab(slug);
        requestAnimationFrame(() => {
          requestAnimationFrame(scrollToDepartmentSection);
        });
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

    function onHeroDepartmentClick(event: MouseEvent) {
      const link = event.target instanceof Element
        ? event.target.closest("a.prog-hero-pillars__item")
        : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const slug = parseProgramsHashSlug(link.hash);
      if (!slug || !sortedCategories.some((c) => c.slug === slug)) return;
      event.preventDefault();
      replaceProgramsHash(slug);
    }

    document.addEventListener("click", onHeroDepartmentClick);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
      document.removeEventListener("click", onHeroDepartmentClick);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, [sortedCategories, scrollToDepartmentSection]);

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
    replaceProgramsHash(slug);
  }

  function categoryNewsHref(slug: string) {
    return `/news?topic=${encodeURIComponent(slug)}`;
  }

  function storiesForCategory(categoryId: string) {
    return successStories.filter((s) => s.department_id === categoryId);
  }

  function newsForCategory(categoryId: string) {
    return sortByPublishedNewest(
      news.filter((a) => a.department_id === categoryId),
    );
  }

  return (
    <>
      {/* ── Department navigation ── */}
      <div className="prog-dept-tabs" role="navigation" aria-label="Program departments">
        <div className="prog-dept-tabs__inner" role="tablist" aria-label="Departments">
          {sortedCategories.map((cat) => {
            const isActive = activeTab === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                id={`tab-${cat.slug}`}
                className={`prog-dept-tabs__tab${isActive ? " is-active" : ""}`}
                onClick={() => switchTab(cat.slug)}
                aria-selected={isActive}
                role="tab"
                style={{ "--dept-color": cat.accent || "#a5280d" } as React.CSSProperties}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Panels ── */}
      {sortedCategories.map((cat) => {
        if (activeTab !== cat.slug) return null;

        const items = programs.filter((p) => p.category === cat.slug);
        const categoryStories = storiesForCategory(cat.id);
        const categoryNews = newsForCategory(cat.id);
        const showStories =
          libraryConfig.show_success_stories && categoryStories.length > 0;
        const showNews = libraryConfig.show_news && categoryNews.length > 0;
        const hasPrograms = items.length > 0;

        return (
          <div
            key={cat.id}
            className="prog-panel active"
            role="tabpanel"
            aria-labelledby={`tab-${cat.slug}`}
            style={{ "--dept-color": cat.accent || "#1a1a1a" } as React.CSSProperties}
          >
            <header className="prog-panel-header">
              <div className="prog-panel-header__inner">
                <p className="prog-panel-header__eyebrow">{cat.label}</p>
                <h2 className="prog-panel-header__title">
                  {cat.description || `${cat.label} Programs`}
                </h2>
                <p className="prog-panel-header__lead">
                  Explore the projects and initiatives under the {cat.label.toLowerCase()} department, serving communities across Rwanda.
                </p>
              </div>
            </header>

            {hasPrograms ? (
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
            ) : null}

            {showStories ? (
              <SuccessStoriesSection stories={categoryStories} category={cat} />
            ) : null}

            {showNews ? (
              <section className="prog-editorial prog-editorial--news" aria-labelledby={`prog-news-title-${cat.slug}`}>
                <div className="prog-editorial__inner">
                  <header className="prog-editorial__header">
                    <p className="prog-editorial__eyebrow">{cat.label}</p>
                    <h3 id={`prog-news-title-${cat.slug}`} className="prog-editorial__title">
                      Latest News
                    </h3>
                    <p className="prog-editorial__lead">
                      Updates and stories from the {cat.label.toLowerCase()} department.
                    </p>
                  </header>

                  <div className="prog-editorial__shell">
                    <div className="prog-editorial__frame">
                      <div className="prog-news-list">
                        {categoryNews.slice(0, NEWS_VISIBLE).map((article) => (
                          <NewsCard key={article.id} article={article} />
                        ))}
                      </div>

                      <div className="prog-editorial__footer">
                        <Link href={categoryNewsHref(cat.slug)} className="prog-editorial__cta">
                          View more stories
                          <i className="fa-solid fa-arrow-right" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}
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
    <section className="prog-editorial prog-editorial--stories" aria-labelledby={`prog-stories-title-${category.slug}`}>
      <div className="prog-editorial__inner">
        <header className="prog-editorial__header">
          <p className="prog-editorial__eyebrow">
            <i className="fa-solid fa-star" aria-hidden />
            Success Stories
          </p>
          <h3 id={`prog-stories-title-${category.slug}`} className="prog-editorial__title">
            Lives Transformed Through {category.label}
          </h3>
          <p className="prog-editorial__lead">
            Real stories of dignity restored and lives rebuilt across Rwanda&apos;s communities.
          </p>
        </header>

        <div className="prog-editorial__shell">
          <div className="prog-editorial__frame">
            <div className="prog-stories-grid">
              {visibleStories.map((story) => (
                <SuccessStoryCard key={story.id} story={story} />
              ))}
            </div>

            {hasMoreStories ? (
              <div className="prog-editorial__footer">
                <button
                  type="button"
                  className="prog-editorial__cta prog-editorial__cta--button"
                  onClick={() => setRowsVisible((rows) => rows + 1)}
                >
                  Load more stories
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Success Story Card                                                 */
/* ------------------------------------------------------------------ */
function SuccessStoryCard({ story }: { story: PublicationRow }) {
  const imageUrl = story.cover_image_url?.trim()
    ? encodePublicationAssetUrl(story.cover_image_url)
    : null;

  const customFields = story.custom_fields as Record<string, any> || {};
  const href = publicationDetailHref(story);

  return (
    <Link href={href} className="prog-story-card">
      <div className="prog-story-card__media">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={story.cover_image_alt || story.title} />
        ) : (
          <div className="prog-story-card__media-placeholder" aria-hidden />
        )}
      </div>
      <div className="prog-story-card__body">
        {story.tag_label ? (
          <span className="prog-story-card__tag">{story.tag_label}</span>
        ) : null}
        <h4 className="prog-story-card__title">{story.title}</h4>
        {story.period_label ? (
          <span className="prog-story-card__period">{story.period_label}</span>
        ) : null}
        {story.excerpt ? <p className="prog-story-card__excerpt">{story.excerpt}</p> : null}
        {customFields.outcome ? (
          <p className="prog-story-card__outcome">
            <i className="fa-solid fa-arrow-trend-up" aria-hidden />
            {String(customFields.outcome)}
          </p>
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
                  {program.project_period ? (
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Project period</span>
                      <span className="drawer-info-value">{program.project_period}</span>
                    </div>
                  ) : null}
                  {program.carried_by ? (
                    <div className="drawer-info-item drawer-info-item-wide">
                      <span className="drawer-info-label">Carried by</span>
                      <span className="drawer-info-value">{program.carried_by}</span>
                    </div>
                  ) : null}
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
          className="prog-news-card__thumb"
        />
      ) : (
        <div className="prog-news-card__thumb prog-news-card__thumb--empty" aria-hidden />
      )}

      <div className="prog-news-card__body">
        {article.published_at ? (
          <span className="prog-news-card__date">{formatPublishedDate(article.published_at)}</span>
        ) : null}
        <h4 className="prog-news-card__title">{article.title}</h4>
        {article.excerpt ? (
          <p className="prog-news-card__excerpt">{article.excerpt}</p>
        ) : null}
        <span className="prog-news-card__link">
          Read article
          <i className="fa-solid fa-arrow-right" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
