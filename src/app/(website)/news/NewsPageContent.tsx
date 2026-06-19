"use client";

import { Fragment, useState, useEffect } from "react";
import { renderWebsiteSection } from "@/lib/public-page-sections";

import type { NewsCmsSection, NewsPageChrome } from "./get-news-data";
import type { PublishedNewsArticle } from "./get-news-data";
import type { ProgramDepartmentOption } from "@/lib/program-departments";

import NewsArticlesFeed from "@/components/website/news/NewsArticlesFeed";
import NewsNewsletterFooter from "@/components/website/news/NewsNewsletterFooter";
import PageHeroSection from "@/components/website/sections/PageHeroSection";

import "./news-page.css";

type Props = {
  chrome: NewsPageChrome;
  cmsSections: NewsCmsSection[];
  featuredArticle: PublishedNewsArticle | null;
  gridArticles: PublishedNewsArticle[];
  departmentPillars: ProgramDepartmentOption[];
  initialTopic?: string;
};

export default function NewsPageContent({
  chrome,
  cmsSections,
  featuredArticle,
  gridArticles,
  departmentPillars,
  initialTopic,
}: Props) {
  const [departmentFilter, setDepartmentFilter] = useState<string | "all">(initialTopic || "all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (initialTopic) {
      setDepartmentFilter(initialTopic);
    } else {
      setDepartmentFilter("all");
    }
  }, [initialTopic]);

  // original-website/news.html has no dedicated hero image — use slide4 (community) which fits the news context
  const heroImage =
    chrome.heroImageUrl?.trim() || "/img/slide4.webp";

  const headlineAccent = (chrome.headlineAccent || "Updates").trim();
  const headlinePrefix = (chrome.headlinePrefix || "News &").trim();

  return (
    <div className="news-page-root bg-[#f7f5f2]">
      <PageHeroSection
        imageUrl={heroImage}
        eyebrow={chrome.eyebrow || "Latest from Caritas Rwanda"}
        heading={`${headlinePrefix} ${headlineAccent}`}
        headingAccent={headlineAccent}
        subheading={chrome.intro}
        breadcrumbLabel="News"
      >
        {/* Search bar rendered inside the hero as children */}
        <div className="news-hero-search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            aria-label="Search news articles"
            autoComplete="off"
          />
          <span className="search-icon">
            <i className="fa-solid fa-magnifying-glass" aria-hidden />
          </span>
        </div>
      </PageHeroSection>

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
