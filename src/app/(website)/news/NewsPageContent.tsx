"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import type { NewsArticleCategory } from "@/lib/news";
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
};

export default function NewsPageContent({
  chrome,
  cmsSections,
  featuredArticle,
  gridArticles,
  departmentPillars,
}: Props) {
  const [topicFilter, setTopicFilter] = useState<NewsArticleCategory | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string | "all">("all");
  const [query, setQuery] = useState("");

  return (
    <div className="news-page-root bg-[#f7f5f2]">
      <NewsLandingHero
        eyebrow={chrome.eyebrow}
        headlinePrefix={chrome.headlinePrefix || "News &"}
        headlineAccent={chrome.headlineAccent || "Updates"}
        intro={chrome.intro}
        heroImageUrl={chrome.heroImageUrl}
      >
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

        <nav className="news-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden>›</span>
          <span>News</span>
        </nav>
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
              topicFilter={topicFilter}
              onTopicFilterChange={setTopicFilter}
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
