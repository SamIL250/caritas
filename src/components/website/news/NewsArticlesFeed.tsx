"use client";

import { useMemo, useState, useEffect } from "react";
import {
  categoryLabel,
  formatPublishedDate,
  inferredDepartmentSlugFromLegacyNewsCategory,
} from "@/lib/news";
import type { PublishedNewsArticle } from "@/app/(website)/news/get-news-data";
import type { ProgramDepartmentOption } from "@/lib/program-departments";

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

  const tagLabel = (a: PublishedNewsArticle) =>
    a.department?.label?.trim() || categoryLabel(a.category);

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
            className="block text-inherit no-underline news-featured-clickable"
            role="button"
            tabIndex={0}
            onClick={() => setActiveArticle(featuredArticle)}
            onKeyDown={(e) => e.key === "Enter" && setActiveArticle(featuredArticle)}
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
                  Read full story{" "}
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
            <div className="news-section-divider">
              <h2>{featuredVisible ? "Recent Stories" : "Stories"}</h2>
            </div>

            <div className="news-grid">
              {filteredGrid.map((a) => (
                <div
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  className="news-card text-inherit no-underline"
                  onClick={() => setActiveArticle(a)}
                  onKeyDown={(e) => e.key === "Enter" && setActiveArticle(a)}
                  aria-label={`Read: ${a.title}`}
                  style={{ cursor: "pointer" }}
                >
                  <div className="news-card-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      Read more <i className="fa-solid fa-arrow-right text-xs" aria-hidden />
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
          <>
            {/* Close */}
            <button className="news-drawer-close" type="button" onClick={onClose} aria-label="Close">
              <i className="fa-solid fa-xmark" aria-hidden />
            </button>

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
            <div className="news-drawer-content">
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
                    Read Full Article
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
          </>
        )}
      </aside>
    </>
  );
}
