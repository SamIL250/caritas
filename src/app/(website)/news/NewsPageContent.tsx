"use client";

import { Fragment, useState, useEffect } from "react";
import { renderWebsiteSection } from "@/lib/public-page-sections";

import type { NewsCmsSection, NewsPageChrome } from "./get-news-data";
import type { PublishedNewsArticle } from "./get-news-data";
import type { ProgramDepartmentOption } from "@/lib/program-departments";

import NewsArticlesFeed from "@/components/website/news/NewsArticlesFeed";
import NewsLandingHero from "@/components/website/news/NewsLandingHero";
import NewsNewsletterFooter from "@/components/website/news/NewsNewsletterFooter";

import "./news-page.css";

type Props = {
  chrome: NewsPageChrome;
  cmsSections: NewsCmsSection[];
  featuredArticle: PublishedNewsArticle | null;
  gridArticles: PublishedNewsArticle[];
  departmentPillars: ProgramDepartmentOption[];
  initialTopic?: string;
};

function resolveDepartmentFilter(
  initialTopic: string | undefined,
  departmentPillars: ProgramDepartmentOption[],
): string {
  const sorted = [...departmentPillars].sort(
    (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label),
  );
  const fallback = sorted[0]?.slug ?? "";
  if (initialTopic && sorted.some((pillar) => pillar.slug === initialTopic)) {
    return initialTopic;
  }
  return fallback;
}

export default function NewsPageContent({
  chrome,
  cmsSections,
  featuredArticle,
  gridArticles,
  departmentPillars,
  initialTopic,
}: Props) {
  const [departmentFilter, setDepartmentFilter] = useState<string>(() =>
    resolveDepartmentFilter(initialTopic, departmentPillars),
  );
  const [query, setQuery] = useState("");

  useEffect(() => {
    setDepartmentFilter(resolveDepartmentFilter(initialTopic, departmentPillars));
  }, [initialTopic, departmentPillars]);

  const headlineAccent = (chrome.headlineAccent || "Updates").trim();
  const headlinePrefix = (chrome.headlinePrefix || "Stories and").trim();

  return (
    <div className="news-page-root bg-[#f7f5f2]">
      <NewsLandingHero
        eyebrow={chrome.eyebrow || "Latest from Caritas Rwanda"}
        headlinePrefix={headlinePrefix}
        headlineAccent={headlineAccent}
        intro={chrome.intro}
        heroImageUrl={chrome.heroImageUrl}
        breadcrumbLabel="Stories and Updates"
      >
        <div className="news-hero-search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            aria-label="Search stories and updates"
            autoComplete="off"
          />
          <span className="search-icon">
            <i className="fa-solid fa-magnifying-glass" aria-hidden />
          </span>
        </div>
      </NewsLandingHero>

      {cmsSections.map((section) => {
        if (!section.visible) return null;

        if (section.type === "news_article_feed") {
          return (
            <NewsArticlesFeed
              key={section.id}
              featuredArticle={featuredArticle}
              gridArticles={gridArticles}
              departmentPillars={departmentPillars}
              topicFilter="all"
              onTopicFilterChange={() => {}}
              departmentFilter={departmentFilter}
              onDepartmentFilterChange={setDepartmentFilter}
              query={query}
            />
          );
        }

        if (section.type === "news_footer") {
          const c =
            section.content && typeof section.content === "object" && !Array.isArray(section.content)
              ? (section.content as Record<string, unknown>)
              : {};
          const title = typeof c.title === "string" ? c.title : "Stay connected";
          const body = typeof c.body === "string" ? c.body : "";

          return (
            <NewsNewsletterFooter key={section.id} title={title} body={body} />
          );
        }

        return (
          <Fragment key={section.id}>{renderWebsiteSection(section)}</Fragment>
        );
      })}
    </div>
  );
}
