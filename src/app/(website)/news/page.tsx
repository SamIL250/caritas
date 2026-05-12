import type { Metadata } from "next";
import NewsPageContent from "./NewsPageContent";
import { resolveNewsPublicPagePayload } from "./get-news-data";

export async function generateMetadata(): Promise<Metadata> {
  const { seoTitle, seoDescription } = await resolveNewsPublicPagePayload();

  return {
    title: seoTitle,
    description: seoDescription,
  };
}

export default async function NewsPage() {
  const { chrome, cmsSections, featuredArticle, gridArticles, departmentPillars } =
    await resolveNewsPublicPagePayload();

  return (
    <NewsPageContent
      chrome={chrome}
      cmsSections={cmsSections}
      featuredArticle={featuredArticle}
      gridArticles={gridArticles}
      departmentPillars={departmentPillars}
    />
  );
}
