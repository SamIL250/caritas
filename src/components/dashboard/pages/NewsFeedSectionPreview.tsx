"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import NewsArticlesFeed from "@/components/website/news/NewsArticlesFeed";
import type { PublishedNewsArticle } from "@/app/(website)/news/get-news-data";
import type { NewsArticleCategory } from "@/lib/news";
import type { ProgramDepartmentOption } from "@/lib/program-departments";

type Props = {
  featuredArticle: PublishedNewsArticle | null;
  gridArticles: PublishedNewsArticle[];
  departmentPillars: ProgramDepartmentOption[];
  /** Optional controlled search (e.g. shared with hero preview). */
  query?: string;
  onQueryChange?: (value: string) => void;
};

function defaultDepartmentFilter(pillars: ProgramDepartmentOption[]): string {
  const sorted = [...pillars].sort(
    (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label),
  );
  return sorted[0]?.slug ?? "";
}

/** Section preview for Stories and Updates article listing — same feed rules as /news. */
export default function NewsFeedSectionPreview({
  featuredArticle,
  gridArticles,
  departmentPillars,
  query: controlledQuery,
  onQueryChange,
}: Props) {
  const [topicFilter, setTopicFilter] = useState<NewsArticleCategory | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>(() =>
    defaultDepartmentFilter(departmentPillars),
  );
  const [localQuery, setLocalQuery] = useState("");

  const query = controlledQuery ?? localQuery;
  const setQuery = onQueryChange ?? setLocalQuery;

  const pillars = useMemo(() => departmentPillars ?? [], [departmentPillars]);

  React.useEffect(() => {
    setDepartmentFilter((prev) => {
      if (prev && pillars.some((p) => p.slug === prev)) return prev;
      return defaultDepartmentFilter(pillars);
    });
  }, [pillars]);

  const hasAny =
    Boolean(featuredArticle) || (Array.isArray(gridArticles) && gridArticles.length > 0);

  if (!hasAny) {
    return (
      <div className="flex min-h-[min(20rem,50vh)] w-full flex-col items-center justify-center gap-3 px-4 py-10 text-center">
        <p className="text-sm font-semibold text-[var(--news-ink,#0d1b2a)]">
          No published stories yet
        </p>
        <p className="max-w-sm text-xs leading-relaxed text-[var(--news-muted,#5a6a7a)]">
          Create and publish articles in Dashboard → News. They will appear here and on{" "}
          <span className="whitespace-nowrap">/news</span>.
        </p>
        <Link
          href="/dashboard/news"
          className="mt-2 inline-flex text-xs font-semibold text-[var(--news-red,#a5280d)] hover:underline"
        >
          Open News →
        </Link>
      </div>
    );
  }

  const showInlineSearch = controlledQuery === undefined;

  return (
    <div className="w-full min-w-0">
      {showInlineSearch ? (
        <>
          <label className="sr-only" htmlFor="news-preview-search">
            Search articles in preview
          </label>
          <div className="news-hero-search mx-auto mb-3 max-w-xl px-1">
            <input
              id="news-preview-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              autoComplete="off"
              aria-label="Search articles in preview"
            />
            <span className="search-icon" aria-hidden>
              <i className="fa-solid fa-magnifying-glass" />
            </span>
          </div>
        </>
      ) : null}
      <NewsArticlesFeed
        featuredArticle={featuredArticle}
        gridArticles={gridArticles}
        departmentPillars={pillars}
        topicFilter={topicFilter}
        onTopicFilterChange={setTopicFilter}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        query={query}
      />
    </div>
  );
}
