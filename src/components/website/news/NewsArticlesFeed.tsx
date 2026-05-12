"use client";

import { useMemo } from "react";
import {
  categoryLabel,
  formatPublishedDate,
  inferredDepartmentSlugFromLegacyNewsCategory,
  type NewsArticleCategory,
} from "@/lib/news";
import type { PublishedNewsArticle } from "@/app/(website)/news/get-news-data";
import type { ProgramDepartmentOption } from "@/lib/program-departments";

const FILTERS: { id: NewsArticleCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "development", label: "Development" },
  { id: "health", label: "Health & ECD" },
  { id: "organizational", label: "Organizational" },
  { id: "international", label: "International" },
  { id: "social", label: "Social Welfare" },
];

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function effectiveDepartmentSlug(a: PublishedNewsArticle): string | null {
  const slug = a.department?.slug?.trim();
  if (slug) return slug;
  return inferredDepartmentSlugFromLegacyNewsCategory(a.category);
}

function matchesTopicFilter(a: PublishedNewsArticle, filter: NewsArticleCategory | "all"): boolean {
  if (filter === "all") return true;
  return a.category === filter;
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
  topicFilter: NewsArticleCategory | "all";
  onTopicFilterChange: (f: NewsArticleCategory | "all") => void;
  departmentFilter: string | "all";
  onDepartmentFilterChange: (slug: string | "all") => void;
  query: string;
};

export default function NewsArticlesFeed({
  featuredArticle,
  gridArticles,
  departmentPillars,
  topicFilter,
  onTopicFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  query,
}: Props) {
  const featuredVisible =
    featuredArticle &&
    matchesTopicFilter(featuredArticle, topicFilter) &&
    matchesDepartmentFilter(featuredArticle, departmentFilter) &&
    matchesQuery(featuredArticle, query);

  const filteredGrid = useMemo(() => {
    return gridArticles.filter(
      (a) =>
        matchesTopicFilter(a, topicFilter) &&
        matchesDepartmentFilter(a, departmentFilter) &&
        matchesQuery(a, query),
    );
  }, [gridArticles, topicFilter, departmentFilter, query]);

  const tagLabel = (a: PublishedNewsArticle) =>
    a.department?.label?.trim() || categoryLabel(a.category);

  return (
    <>
      <div className="news-filter-bar">
        <div className="news-filter-inner">
          {FILTERS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`news-filter-btn ${topicFilter === t.id ? "is-active" : ""}`}
              onClick={() => onTopicFilterChange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {departmentPillars.length > 0 ? (
        <div className="news-filter-bar news-filter-bar--departments">
          <div className="news-filter-inner">
            <button
              type="button"
              className={`news-filter-btn ${departmentFilter === "all" ? "is-active" : ""}`}
              onClick={() => onDepartmentFilterChange("all")}
            >
              All programs
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
          <a
            href={featuredArticle.external_url || `#story-${featuredArticle.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            id={`story-${featuredArticle.slug}`}
            className="block text-inherit no-underline"
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
          </a>
        )}

        {filteredGrid.length === 0 && !featuredVisible && (
          <p className="news-empty">
            No articles match your search or category. Try adjusting filters or search terms.
          </p>
        )}

        {filteredGrid.length > 0 && (
          <>
            <div className="news-section-divider">
              <h2>{featuredVisible ? "Recent Stories" : "Stories"}</h2>
            </div>

            <div className="news-grid">
              {filteredGrid.map((a) => (
                <a
                  key={a.id}
                  href={a.external_url || `#story-${a.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`story-${a.slug}`}
                  className="news-card text-inherit no-underline"
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
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
