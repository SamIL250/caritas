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

export default async function NewsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const topic = typeof searchParams.topic === "string" ? searchParams.topic : undefined;

  const { chrome, cmsSections, featuredArticle, gridArticles, departmentPillars } =
    await resolveNewsPublicPagePayload();

  return (
    <NewsPageContent
      chrome={chrome}
      cmsSections={cmsSections}
      featuredArticle={featuredArticle}
      gridArticles={gridArticles}
      departmentPillars={departmentPillars}
      initialTopic={topic}
    />
  );
}
