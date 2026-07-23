"use client";

import { useMemo, useState, useEffect } from "react";
import {
  categoryLabel,
  effectiveNewsDepartmentSlug,
  formatPublishedDate,
  inferredDepartmentSlugFromLegacyNewsCategory,
} from "@/lib/news";
import type { PublishedNewsArticle } from "@/app/(website)/news/get-news-data";
import type { ProgramDepartmentOption } from "@/lib/program-departments";
import { sortByPublishedNewest } from "@/lib/content-sort";

import Link from "next/link";
import { MediaFigure } from "@/components/website/MediaCaptionProvider";

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

function articleYear(a: PublishedNewsArticle): number | null {
  if (!a.published_at) return null;
  const year = new Date(a.published_at).getFullYear();
  return Number.isNaN(year) ? null : year;
}

function matchesYearFilter(a: PublishedNewsArticle, yearFilter: number | "all"): boolean {
  if (yearFilter === "all") return true;
  return articleYear(a) === yearFilter;
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
  const allArticles = useMemo(() => {
    const byId = new Map<string, PublishedNewsArticle>();
    if (featuredArticle) byId.set(featuredArticle.id, featuredArticle);
    for (const a of gridArticles) byId.set(a.id, a);
    return sortByPublishedNewest([...byId.values()]);
  }, [featuredArticle, gridArticles]);

  const scopedArticles = useMemo(() => {
    return allArticles.filter(
      (a) => matchesDepartmentFilter(a, departmentFilter) && matchesQuery(a, query),
    );
  }, [allArticles, departmentFilter, query]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const article of scopedArticles) {
      const year = articleYear(article);
      if (year !== null) years.add(year);
    }
    return [...years].sort((a, b) => b - a);
  }, [scopedArticles]);

  const heroArticle = useMemo(() => {
    const featured = scopedArticles.filter((a) => a.featured);
    if (featured.length === 0) return null;
    return sortByPublishedNewest(featured)[0] ?? null;
  }, [scopedArticles]);

  const filteredGrid = useMemo(() => {
    if (!heroArticle) return scopedArticles;
    return scopedArticles.filter((a) => a.id !== heroArticle.id);
  }, [scopedArticles, heroArticle]);

  const featuredVisible = heroArticle !== null;

  const [currentPage, setCurrentPage] = useState(1);
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    setCurrentPage(1);
    setYearFilter("all");
  }, [departmentFilter, query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [yearFilter]);

  useEffect(() => {
    if (yearFilter !== "all" && !availableYears.includes(yearFilter)) {
      setYearFilter("all");
    }
  }, [availableYears, yearFilter]);

  const yearScopedGrid = useMemo(() => {
    return filteredGrid.filter((a) => matchesYearFilter(a, yearFilter));
  }, [filteredGrid, yearFilter]);

  const showMagazineLayout = yearFilter === "all" && currentPage === 1 && yearScopedGrid.length > 0;

  const moreStoriesPool = useMemo(() => {
    if (showMagazineLayout) return yearScopedGrid.slice(6);
    return yearScopedGrid;
  }, [showMagazineLayout, yearScopedGrid]);

  const totalPages = Math.max(1, Math.ceil(moreStoriesPool.length / ITEMS_PER_PAGE));
  const paginatedMoreStories = moreStoriesPool.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const showMoreStoriesSection =
    yearFilter !== "all" || currentPage > 1 || yearScopedGrid.length > 6;

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
        {featuredVisible && heroArticle && (
          <Link
            href={`/news/${heroArticle.slug}`}
            className="block text-inherit no-underline news-featured-clickable"
            aria-label={`Read: ${heroArticle.title}`}
          >
            <article className="news-featured">
              <div className="news-feat-img">
                <MediaFigure
                  src={heroArticle.image_url}
                  alt={heroArticle.image_alt || heroArticle.title}
                  hideCaption
                  figureClassName="news-feat-figure"
                />
                <div className="news-feat-badge">
                  <i className="fa-solid fa-star mr-1" aria-hidden />
                  Featured
                </div>
              </div>
              <div className="news-feat-content">
                <div className="news-feat-meta">
                  <span className="news-feat-cat">{tagLabel(heroArticle)}</span>
                  <span>
                    <i className="fa-regular fa-calendar mr-1" aria-hidden />
                    {formatPublishedDate(heroArticle.published_at)}
                  </span>
                </div>
                <h2>{heroArticle.title}</h2>
                <p>{heroArticle.excerpt}</p>
                <span className="news-read-more">
                  Read article{" "}
                  <i className="fa-solid fa-arrow-right text-xs" aria-hidden />
                </span>
              </div>
            </article>
          </Link>
        )}

        {filteredGrid.length === 0 && !featuredVisible && (
          <p className="news-empty">
            No articles match your search or filters. Try adjusting your search terms.
          </p>
        )}

        {yearFilter !== "all" && yearScopedGrid.length === 0 && filteredGrid.length > 0 && (
          <p className="news-empty">
            No articles from {yearFilter} in this selection. Try another year or category.
          </p>
        )}

        {filteredGrid.length > 0 && (
          <>
            {/* Magazine Layout for Top Stories on Page 1 */}
            {showMagazineLayout && (
              <div className="news-mag-section">
                <div className="news-mag-header">
                  <h2>{featuredVisible ? "Trending Now" : "Top Stories"}</h2>
                </div>
                <div className="news-mag-grid">
                  {/* Left Column: Large Featured + Wide Article */}
                  <div className="flex flex-col gap-6 w-full h-full">
                    {yearScopedGrid[0] && (
                      <Link
                        href={`/news/${yearScopedGrid[0].slug}`}
                        className="news-mag-large"
                      >
                        <div className="news-mag-large-img">
                          <MediaFigure
                            src={yearScopedGrid[0].image_url}
                            alt={yearScopedGrid[0].title}
                            hideCaption
                            figureClassName="news-mag-figure"
                          />
                          <div className="news-mag-large-tag">{tagLabel(yearScopedGrid[0])}</div>
                        </div>
                        <h3 className="news-mag-large-title">{yearScopedGrid[0].title}</h3>
                        <div className="news-mag-large-meta">
                          <span>{formatPublishedDate(yearScopedGrid[0].published_at)}</span>
                          <span>•</span>
                          <span>{yearScopedGrid[0].excerpt?.substring(0, 80)}...</span>
                        </div>
                      </Link>
                    )}
                    
                    {yearScopedGrid[1] && (
                      <Link
                        href={`/news/${yearScopedGrid[1].slug}`}
                        className="flex items-center gap-4 group text-inherit no-underline border border-stone-200 rounded-2xl p-3 hover:border-[var(--primary-orange)] transition-colors bg-white mt-auto"
                      >
                        <div className="w-1/3 aspect-[4/3] rounded-xl overflow-hidden relative shrink-0">
                          <MediaFigure
                            src={yearScopedGrid[1].image_url}
                            alt={yearScopedGrid[1].title}
                            hideCaption
                            figureClassName="news-mag-figure h-full"
                            imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="w-2/3 flex flex-col justify-center">
                          <div className="text-[10px] font-bold text-[#a5280d] mb-1 uppercase tracking-wider">{tagLabel(yearScopedGrid[1])}</div>
                          <h4 className="text-[15px] font-bold text-stone-900 group-hover:text-[#a5280d] transition-colors mb-1 line-clamp-2 leading-tight">{yearScopedGrid[1].title}</h4>
                          <div className="text-[11px] text-stone-500">{formatPublishedDate(yearScopedGrid[1].published_at)}</div>
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Right: Vertical List */}
                  <div className="news-mag-list">
                    {yearScopedGrid.slice(2, 6).map((a) => (
                      <Link
                        key={a.id}
                        href={`/news/${a.slug}`}
                        className="news-mag-list-item text-inherit no-underline"
                      >
                        <div className="news-mag-list-img">
                          <MediaFigure
                            src={a.image_url}
                            alt={a.title}
                            hideCaption
                            figureClassName="news-mag-figure"
                          />
                        </div>
                        <div className="news-mag-list-content">
                          <div className="news-mag-list-meta">
                            <span className="text-[#a5280d] font-bold mr-2 uppercase">{tagLabel(a)}</span>
                            {formatPublishedDate(a.published_at)}
                          </div>
                          <h4 className="news-mag-list-title">{a.title}</h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Standard Grid for Remaining Stories */}
            {showMoreStoriesSection && (
              <div className="news-more-stories-layout">
                <div className="news-more-stories-main">
                  <div className="news-section-divider">
                    <h2>
                      {yearFilter !== "all"
                        ? `Stories from ${yearFilter}`
                        : showMagazineLayout
                          ? "More Stories"
                          : "Stories"}
                    </h2>
                  </div>

                  {paginatedMoreStories.length > 0 ? (
                    <div className="news-grid">
                      {paginatedMoreStories.map((a) => (
                        <Link
                          key={a.id}
                          href={`/news/${a.slug}`}
                          className="news-card text-inherit no-underline cursor-pointer block"
                          aria-label={`Read: ${a.title}`}
                        >
                          <div className="news-card-img">
                            <MediaFigure
                              src={a.image_url}
                              alt={a.image_alt || a.title}
                              hideCaption
                              figureClassName="news-card-figure"
                            />
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
                              Read article <i className="fa-solid fa-arrow-right text-xs" aria-hidden />
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="news-empty news-empty--inline">
                      No stories from {yearFilter} to show here.
                    </p>
                  )}

                  {moreStoriesPool.length > ITEMS_PER_PAGE && (
                    <div className="news-pagination">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="news-pagination-btn"
                      >
                        <i className="fa-solid fa-chevron-left" />
                        Previous
                      </button>
                      <span className="news-pagination-info">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="news-pagination-btn"
                      >
                        Next
                        <i className="fa-solid fa-chevron-right" />
                      </button>
                    </div>
                  )}
                </div>

                {availableYears.length > 0 ? (
                  <NewsYearFilter
                    years={availableYears}
                    value={yearFilter}
                    onChange={setYearFilter}
                  />
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function NewsYearFilter({
  years,
  value,
  onChange,
}: {
  years: number[];
  value: number | "all";
  onChange: (year: number | "all") => void;
}) {
  return (
    <aside className="news-year-filter" aria-label="Filter stories by year">
      <span className="news-year-filter-label">Year</span>
      <button
        type="button"
        className={`news-year-filter-btn${value === "all" ? " is-active" : ""}`}
        onClick={() => onChange("all")}
        aria-pressed={value === "all"}
      >
        All
      </button>
      {years.map((year) => (
        <button
          key={year}
          type="button"
          className={`news-year-filter-btn${value === year ? " is-active" : ""}`}
          onClick={() => onChange(year)}
          aria-pressed={value === year}
        >
          {year}
        </button>
      ))}
    </aside>
  );
}
