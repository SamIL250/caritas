import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  categoryLabel,
  formatPublishedDate,
  type NewsArticleRow,
} from "@/lib/news";
import type { ProgramCategoryRow } from "@/lib/programs";
import { sanitizeStaffRichText } from "@/lib/sanitize-staff-html";
import { CampaignFullStory } from "@/components/website/campaigns/CampaignFullStory";

import "../../campaigns/campaign-detail-page.css";
import "../../programs/programs-page.css";
import "../../programs/program-detail-page.css";
import "../news-page.css";

type PageProps = { params: Promise<{ slug: string }> };

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
  const coverUrl = article.image_url?.trim() || "";
  const storyHtml =
    article.body?.trim() ? sanitizeStaffRichText(article.body.trim()) : "";

  const isExternalArticle = article.external_url?.trim() && /^https?:\/\//i.test(article.external_url);

  return (
    <div className="campaign-detail-root program-detail-flush">
      <header className="prog-article-hero">
        <div className="prog-article-hero-bg" aria-hidden>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" />
          ) : null}
        </div>
        <div className="prog-article-hero-inner">
          <nav className="campaign-hero-breadcrumb" aria-label="Breadcrumb">
            <Link href="/news">News</Link>
            <span aria-hidden> / </span>
            <span className="campaign-hero-bc-current">{article.title}</span>
          </nav>
          <span className="prog-article-eyebrow">
            {department?.label || categoryLabel(article.category)}
          </span>
          <h1 className="prog-article-h1">{article.title}</h1>
          {article.excerpt ? <p className="prog-article-deck">{article.excerpt}</p> : null}
          <div className="prog-article-meta-row">
            {article.published_at ? (
              <span>
                <i className="fa-solid fa-calendar-days" aria-hidden />
                {formatPublishedDate(article.published_at)}
              </span>
            ) : null}
            {department ? (
              <span>
                <i className="fa-solid fa-folder-open" aria-hidden />
                {department.label}
              </span>
            ) : (
              <span>
                <i className="fa-solid fa-tag" aria-hidden />
                {categoryLabel(article.category)}
              </span>
            )}
          </div>
        </div>
      </header>

      <article className="campaign-detail-body">
        <div className="campaign-detail-body-grid">
          <div className="min-w-0">
            {storyHtml ? (
              <CampaignFullStory key={`${article.id}-${article.updated_at}`} html={storyHtml} />
            ) : isExternalArticle ? (
              <p className="campaign-full-story-empty">
                This article is available at the original source.
              </p>
            ) : (
              <p className="campaign-full-story-empty">
                The full article text will be posted here soon.
              </p>
            )}
          </div>
          <aside className="program-pillar-aside">
            <div className="program-pillar-card">
              <div className="program-pillar-card-head">
                <span className="program-pillar-card-icon">
                  <i className="fa-solid fa-newspaper" aria-hidden />
                </span>
                <h3 className="program-pillar-card-title">About this article</h3>
              </div>
              <p className="program-pillar-card-lead">
                {article.published_at
                  ? `Published ${formatPublishedDate(article.published_at)}`
                  : ""}
                {department ? ` in ${department.label}` : ` in ${categoryLabel(article.category)}`}.
              </p>

              <div className="program-pillar-links">
                <Link href="/news" className="program-pillar-link-row">
                  <span className="program-pillar-link-label">View all news</span>
                  <span className="program-pillar-link-chevron">
                    <i className="fa-solid fa-arrow-right" aria-hidden />
                  </span>
                </Link>
                <Link href={`/news?topic=${article.category}`} className="program-pillar-link-row">
                  <span className="program-pillar-link-label">
                    More {categoryLabel(article.category)}
                  </span>
                  <span className="program-pillar-link-chevron">
                    <i className="fa-solid fa-arrow-right" aria-hidden />
                  </span>
                </Link>
                {isExternalArticle ? (
                  <a
                    href={article.external_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="program-pillar-link-row"
                  >
                    <span className="program-pillar-link-label">Open original source</span>
                    <span className="program-pillar-link-chevron">
                      <i className="fa-solid fa-external-link-alt" aria-hidden />
                    </span>
                  </a>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
