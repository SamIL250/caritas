import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type NewsArticleCategory, type NewsArticleRow } from "@/lib/news";
import type { ProgramCategoryRow } from "@/lib/programs";
import { prepareStaffRichHtml } from "@/lib/prepare-staff-rich-html";
import { sortByPublishedNewest } from "@/lib/content-sort";
import {
  NewsDetailLayout,
  type NewsDetailPeer,
} from "@/components/website/news/NewsDetailLayout";
import { ViewTracker } from "@/components/website/ViewTracker";
import "../news-detail-page.css";

type PageProps = { params: Promise<{ slug: string }> };

async function fetchPublishedNewsInCategory(
  category: NewsArticleCategory,
): Promise<NewsDetailPeer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news_articles")
    .select("id, title, slug, category, published_at, created_at")
    .eq("status", "published")
    .eq("category", category)
    .order("published_at", { ascending: false });

  return sortByPublishedNewest((data ?? []) as NewsDetailPeer[]);
}

async function fetchNewsArticleBySlug(
  slug: string,
): Promise<{
  article: NewsArticleRow;
  department: ProgramCategoryRow | null;
} | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news_articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return null;
  const article = data as NewsArticleRow;

  let department: ProgramCategoryRow | null = null;
  if (article.department_id) {
    const { data: deptRow } = await supabase
      .from("program_categories")
      .select("*")
      .eq("id", article.department_id)
      .maybeSingle();
    department = (deptRow as ProgramCategoryRow) ?? null;
  }

  return { article, department };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const found = await fetchNewsArticleBySlug(slug);
  if (!found) {
    return { title: "Article not found — Caritas Rwanda" };
  }
  const { article } = found;
  return {
    title: `${article.title} — Caritas Rwanda`,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      images: article.image_url ? [{ url: article.image_url }] : undefined,
    },
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const found = await fetchNewsArticleBySlug(slug);
  if (!found) notFound();

  const { article, department } = found;
  const [bodyHtml, categoryArticles] = await Promise.all([
    article.body?.trim() ? prepareStaffRichHtml(article.body.trim()) : Promise.resolve(""),
    fetchPublishedNewsInCategory(article.category),
  ]);

  return (
    <>
      <NewsDetailLayout
        article={article}
        bodyHtml={bodyHtml}
        categoryArticles={categoryArticles}
        departmentLabel={department?.label ?? null}
      />
      <ViewTracker pageType="news_article" pageId={article.id} />
    </>
  );
}
