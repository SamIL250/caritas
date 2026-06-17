"use client";

import { useMemo, useState, useEffect } from "react";
import {
  categoryLabel,
  formatPublishedDate,
  inferredDepartmentSlugFromLegacyNewsCategory,
} from "@/lib/news";
import type { PublishedNewsArticle } from "@/app/(website)/news/get-news-data";
import type { ProgramDepartmentOption } from "@/lib/program-departments";

import Link from "next/link";

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function effectiveDepartmentSlug(a: PublishedNewsArticle): string | null {
  const slug = a.department?.slug?.trim();
  if (slug) return slug;
  return inferredDepartmentSlugFromLegacyNewsCategory(a.category);
}

function matchesDepartmentFilter(a: PublishedNewsArticle, filter: string | "all"): boolean {
  if (filter === "all") return true;
  const slug = effectiveDepartmentSlug(a);
  return slug === filter;
}

function matchesQuery(a: PublishedNewsArticle, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  return `${a.title} ${a.excerpt}`.toLowerCase().includes(q);
}

type Props = {
  featuredArticle: PublishedNewsArticle | null;
  gridArticles: PublishedNewsArticle[];
  departmentPillars: ProgramDepartmentOption[];
  topicFilter: string;
  onTopicFilterChange: (f: any) => void;
  departmentFilter: string | "all";
  onDepartmentFilterChange: (slug: string | "all") => void;
  query: string;
};

export default function NewsArticlesFeed({
  featuredArticle,
  gridArticles,
  departmentPillars,
  departmentFilter,
  onDepartmentFilterChange,
  query,
}: Props) {
  const [activeArticle, setActiveArticle] = useState<PublishedNewsArticle | null>(null);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = activeArticle ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeArticle]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveArticle(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const featuredVisible =
    featuredArticle &&
    matchesDepartmentFilter(featuredArticle, departmentFilter) &&
    matchesQuery(featuredArticle, query);

  const filteredGrid = useMemo(() => {
    return gridArticles.filter(
      (a) =>
        matchesDepartmentFilter(a, departmentFilter) &&
        matchesQuery(a, query),
    );
  }, [gridArticles, departmentFilter, query]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [departmentFilter, query]);

  const totalPages = Math.ceil(filteredGrid.length / ITEMS_PER_PAGE);
  const paginatedGrid = filteredGrid.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const tagLabel = (a: PublishedNewsArticle) =>
    a.department?.label?.trim() || categoryLabel(a.category);



  return (
    <>
      {/* Single filter bar — departments only */}
      {departmentPillars.length > 0 ? (
        <div className="news-filter-bar">
          <div className="news-filter-inner">
            <button
              type="button"
              className={`news-filter-btn ${departmentFilter === "all" ? "is-active" : ""}`}
              onClick={() => onDepartmentFilterChange("all")}
            >
              All Programs
            </button>
            {departmentPillars.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`news-filter-btn ${departmentFilter === p.slug ? "is-active" : ""}`}
                onClick={() => onDepartmentFilterChange(p.slug)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="news-wrap">
        {featuredVisible && featuredArticle && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveArticle(featuredArticle)}
            onKeyDown={(e) => e.key === "Enter" && setActiveArticle(featuredArticle)}
            className="block text-inherit no-underline news-featured-clickable"
            aria-label={`Read: ${featuredArticle.title}`}
          >
            <article className="news-featured">
              <div className="news-feat-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredArticle.image_url}
                  alt={featuredArticle.image_alt || featuredArticle.title}
                />
                <div className="news-feat-badge">
                  <i className="fa-solid fa-star mr-1" aria-hidden />
                  Featured
                </div>
              </div>
              <div className="news-feat-content">
                <div className="news-feat-meta">
                  <span className="news-feat-cat">{tagLabel(featuredArticle)}</span>
                  <span>
                    <i className="fa-regular fa-calendar mr-1" aria-hidden />
                    {formatPublishedDate(featuredArticle.published_at)}
                  </span>
                </div>
                <h2>{featuredArticle.title}</h2>
                <p>{featuredArticle.excerpt}</p>
                <span className="news-read-more">
                  Read quick view{" "}
                  <i className="fa-solid fa-arrow-right text-xs" aria-hidden />
                </span>
              </div>
            </article>
          </div>
        )}

        {filteredGrid.length === 0 && !featuredVisible && (
          <p className="news-empty">
            No articles match your search or filters. Try adjusting your search terms.
          </p>
        )}

        {filteredGrid.length > 0 && (
          <>
            {/* Magazine Layout for Top Stories on Page 1 */}
            {currentPage === 1 && filteredGrid.length > 0 && (
              <div className="news-mag-section">
                <div className="news-mag-header">
                  <h2>{featuredVisible ? "Trending Now" : "Top Stories"}</h2>
                </div>
                <div className="news-mag-grid">
                  {/* Left: Large Featured */}
                  {filteredGrid[0] && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveArticle(filteredGrid[0])}
                      onKeyDown={(e) => e.key === "Enter" && setActiveArticle(filteredGrid[0])}
                      className="news-mag-large"
                    >
                      <div className="news-mag-large-img">
                        <img src={filteredGrid[0].image_url} alt={filteredGrid[0].title} />
                        <div className="news-mag-large-tag">{tagLabel(filteredGrid[0])}</div>
                      </div>
                      <h3 className="news-mag-large-title">{filteredGrid[0].title}</h3>
                      <div className="news-mag-large-meta">
                        <span>{formatPublishedDate(filteredGrid[0].published_at)}</span>
                        <span>•</span>
                        <span>{filteredGrid[0].excerpt?.substring(0, 80)}...</span>
                      </div>
                    </div>
                  )}

                  {/* Right: Vertical List */}
                  <div className="news-mag-list">
                    {filteredGrid.slice(1, 5).map((a) => (
                      <div
                        key={a.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveArticle(a)}
                        onKeyDown={(e) => e.key === "Enter" && setActiveArticle(a)}
                        className="news-mag-list-item"
                      >
                        <div className="news-mag-list-img">
                          <img src={a.image_url} alt={a.title} />
                        </div>
                        <div className="news-mag-list-content">
                          <div className="news-mag-list-meta">
                            <span className="text-[#a5280d] font-bold mr-2 uppercase">{tagLabel(a)}</span>
                            {formatPublishedDate(a.published_at)}
                          </div>
                          <h4 className="news-mag-list-title">{a.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Standard Grid for Remaining Stories */}
            {(currentPage > 1 || filteredGrid.length > 5) && (
              <>
                <div className="news-section-divider">
                  <h2>{currentPage === 1 ? "More Stories" : "Stories"}</h2>
                </div>
                <div className="news-grid">
                  {(currentPage === 1 ? paginatedGrid.slice(5) : paginatedGrid).map((a) => (
                    <div
                      key={a.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveArticle(a)}
                      onKeyDown={(e) => e.key === "Enter" && setActiveArticle(a)}
                      className="news-card text-inherit no-underline cursor-pointer"
                      aria-label={`Read: ${a.title}`}
                    >
                      <div className="news-card-img">
                        <img src={a.image_url} alt={a.image_alt || a.title} />
                        <div className="news-card-overlay" aria-hidden />
                        <div className="news-card-tag">{tagLabel(a)}</div>
                      </div>
                      <div className="news-card-body">
                        <div className="news-card-date">
                          <i className="fa-regular fa-calendar" aria-hidden />
                          {formatPublishedDate(a.published_at)}
                        </div>
                        <h3>{a.title}</h3>
                        <p>{a.excerpt}</p>
                        <span className="news-card-link">
                          Quick view <i className="fa-solid fa-arrow-right text-xs" aria-hidden />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-stone-100 text-stone-600 hover:bg-[#7A1515] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fa-solid fa-chevron-left mr-2" />
                  Previous
                </button>
                <span className="text-sm font-medium text-stone-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-stone-100 text-stone-600 hover:bg-[#7A1515] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <i className="fa-solid fa-chevron-right ml-2" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Article Drawer */}
      <NewsArticleDrawer
        article={activeArticle}
        tagLabel={activeArticle ? tagLabel(activeArticle) : ""}
        onClose={() => setActiveArticle(null)}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* News Article Drawer                                                  */
/* ------------------------------------------------------------------ */
function NewsArticleDrawer({
  article,
  tagLabel,
  onClose,
}: {
  article: PublishedNewsArticle | null;
  tagLabel: string;
  onClose: () => void;
}) {
  const isOpen = Boolean(article);
  const hasExternal = Boolean(article?.external_url?.trim());
  const hasBody = Boolean((article as any)?.body?.trim());

  return (
    <>
      {/* Backdrop */}
      <div
        className={`news-drawer-backdrop${isOpen ? " open" : ""}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <aside
        className={`news-drawer-panel${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={article?.title || "Article"}
      >
        {article && (
          <div className="flex flex-col h-full overflow-hidden relative">
            {/* Close */}
            <button className="news-drawer-close z-50 absolute top-4 right-4 bg-white/80 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center hover:bg-white text-stone-900 shadow-sm transition-all" type="button" onClick={onClose} aria-label="Close">
              <i className="fa-solid fa-xmark" aria-hidden />
            </button>

            <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
              {/* Hero image */}
              {article.image_url ? (
                <div className="news-drawer-hero">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={article.image_url} alt={article.image_alt || article.title} />
                </div>
              ) : (
                <div className="news-drawer-hero-placeholder" />
              )}

              {/* Content */}
              <div className="news-drawer-content pb-32">
                {/* Category + date */}
                <div className="news-drawer-meta">
                  <span className="news-drawer-cat">{tagLabel}</span>
                  <span className="news-drawer-date">
                    <i className="fa-regular fa-calendar" aria-hidden />
                    {formatPublishedDate(article.published_at)}
                  </span>
                </div>

                <h2 className="news-drawer-title">{article.title}</h2>

                {article.excerpt ? (
                  <p className="news-drawer-excerpt">{article.excerpt}</p>
                ) : null}

                <div className="news-drawer-divider" />

                {/* External link button */}
                {hasExternal && (
                  <div className="news-drawer-actions">
                    <a
                      href={article.external_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="news-drawer-btn"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden />
                      Read Full Article on Source
                    </a>
                  </div>
                )}

                {/* Body */}
                {hasBody ? (
                  <div
                    className="news-drawer-body"
                    dangerouslySetInnerHTML={{ __html: (article as any).body }}
                  />
                ) : !hasExternal ? (
                  <p className="news-drawer-no-body">
                    Full article content is not available here. Check back later or follow the link above.
                  </p>
                ) : null}
              </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pt-16 z-20 flex justify-center pointer-events-none">
              <Link 
                href={`/news/${article.slug}`} 
                className="news-drawer-btn shadow-lg px-8 py-3 rounded-full hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 pointer-events-auto"
                style={{ width: "auto" }}
              >
                Continue to full article <i className="fa-solid fa-arrow-right" aria-hidden />
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
