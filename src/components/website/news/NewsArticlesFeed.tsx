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
          <Link
            href={`/news/${featuredArticle.slug}`}
            className="block text-inherit no-underline news-featured-clickable"
            aria-label={`Read: ${featuredArticle.title}`}
          >
            <article className="news-featured">
              <div className="news-feat-img">
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

        {filteredGrid.length > 0 && (
          <>
            {/* Magazine Layout for Top Stories on Page 1 */}
            {currentPage === 1 && filteredGrid.length > 0 && (
              <div className="news-mag-section">
                <div className="news-mag-header">
                  <h2>{featuredVisible ? "Trending Now" : "Top Stories"}</h2>
                </div>
                <div className="news-mag-grid">
                  {/* Left Column: Large Featured + Wide Article */}
                  <div className="flex flex-col gap-6 w-full h-full">
                    {filteredGrid[0] && (
                      <Link
                        href={`/news/${filteredGrid[0].slug}`}
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
                      </Link>
                    )}
                    
                    {filteredGrid[1] && (
                      <Link
                        href={`/news/${filteredGrid[1].slug}`}
                        className="flex items-center gap-4 group text-inherit no-underline border border-stone-200 rounded-2xl p-3 hover:border-[var(--primary-orange)] transition-colors bg-white mt-auto"
                      >
                        <div className="w-1/3 aspect-[4/3] rounded-xl overflow-hidden relative shrink-0">
                          <img src={filteredGrid[1].image_url} alt={filteredGrid[1].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <div className="w-2/3 flex flex-col justify-center">
                          <div className="text-[10px] font-bold text-[#a5280d] mb-1 uppercase tracking-wider">{tagLabel(filteredGrid[1])}</div>
                          <h4 className="text-[15px] font-bold text-stone-900 group-hover:text-[#a5280d] transition-colors mb-1 line-clamp-2 leading-tight">{filteredGrid[1].title}</h4>
                          <div className="text-[11px] text-stone-500">{formatPublishedDate(filteredGrid[1].published_at)}</div>
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Right: Vertical List */}
                  <div className="news-mag-list">
                    {filteredGrid.slice(2, 6).map((a) => (
                      <Link
                        key={a.id}
                        href={`/news/${a.slug}`}
                        className="news-mag-list-item text-inherit no-underline"
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
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Standard Grid for Remaining Stories */}
            {(currentPage > 1 || filteredGrid.length > 6) && (
              <>
                <div className="news-section-divider">
                  <h2>{currentPage === 1 ? "More Stories" : "Stories"}</h2>
                </div>
                <div className="news-grid">
                  {(currentPage === 1 ? paginatedGrid.slice(6) : paginatedGrid).map((a) => (
                    <Link
                      key={a.id}
                      href={`/news/${a.slug}`}
                      className="news-card text-inherit no-underline cursor-pointer block"
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
                          Read article <i className="fa-solid fa-arrow-right text-xs" aria-hidden />
                        </span>
                      </div>
                    </Link>
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
    </>
  );
}
