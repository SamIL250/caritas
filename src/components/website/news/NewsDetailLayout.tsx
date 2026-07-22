import Link from "next/link";
import {
  categoryLabel,
  formatPublishedDate,
  type NewsArticleRow,
} from "@/lib/news";
import { sortByPublishedNewest } from "@/lib/content-sort";
import { MediaFigure } from "@/components/website/MediaCaptionProvider";

export type NewsDetailPeer = Pick<NewsArticleRow, "id" | "title" | "slug" | "category" | "published_at">;

type Props = {
  article: NewsArticleRow;
  bodyHtml: string;
  categoryArticles: NewsDetailPeer[];
  departmentLabel: string | null;
};

function newsDetailHref(slug: string): string {
  return `/news/${encodeURIComponent(slug)}`;
}

export function NewsDetailLayout({
  article,
  bodyHtml,
  categoryArticles,
  departmentLabel,
}: Props) {
  const ordered = sortByPublishedNewest(categoryArticles);
  const currentIndex = ordered.findIndex((a) => a.id === article.id);
  const previous = currentIndex > 0 ? ordered[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : null;

  const coverUrl = article.image_url?.trim() || "";
  const categoryName = categoryLabel(article.category);
  const eyebrow = departmentLabel || categoryName;
  const isExternalArticle =
    Boolean(article.external_url?.trim()) && /^https?:\/\//i.test(article.external_url);

  return (
    <div className="news-detail-page">
      <div className="news-detail-shell">
        <nav className="news-detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/news">News</Link>
          <span aria-hidden> / </span>
          <span className="news-detail-breadcrumb-current">{categoryName}</span>
        </nav>

        {coverUrl ? (
          <div className="news-detail-cover">
            <MediaFigure
              src={coverUrl}
              alt={article.image_alt || article.title}
              figureClassName="news-detail-cover-figure"
              imgClassName=""
            />
          </div>
        ) : null}

        <header className="news-detail-intro">
          <p className="news-detail-eyebrow">{eyebrow}</p>
          <h1 className="news-detail-title">{article.title}</h1>
          {article.published_at ? (
            <p className="news-detail-date">
              <i className="fa-solid fa-calendar-days" aria-hidden />{" "}
              {formatPublishedDate(article.published_at)}
            </p>
          ) : null}
        </header>

        <div className="news-detail-layout">
          <article className="news-detail-main">
            {article.excerpt?.trim() ? (
              <p className="news-detail-lede">{article.excerpt}</p>
            ) : null}

            {bodyHtml ? (
              <div
                className="news-detail-body prose-news-detail"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : isExternalArticle ? (
              <p className="news-detail-empty">
                This article is available at the original source.{" "}
                <a href={article.external_url!} target="_blank" rel="noopener noreferrer">
                  Open original article
                </a>
              </p>
            ) : (
              <p className="news-detail-empty">The full article text will be posted here soon.</p>
            )}

            {isExternalArticle && bodyHtml ? (
              <p className="news-detail-external-link">
                <a href={article.external_url!} target="_blank" rel="noopener noreferrer">
                  Read at original source <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden />
                </a>
              </p>
            ) : null}

            <nav className="news-detail-pager" aria-label="Article navigation">
              {previous ? (
                <Link href={newsDetailHref(previous.slug)} className="news-detail-pager-link prev">
                  <span className="news-detail-pager-label">
                    <i className="fa-solid fa-arrow-left" aria-hidden /> Previous
                  </span>
                  <span className="news-detail-pager-title">{previous.title}</span>
                </Link>
              ) : (
                <span className="news-detail-pager-spacer" aria-hidden />
              )}
              {next ? (
                <Link href={newsDetailHref(next.slug)} className="news-detail-pager-link next">
                  <span className="news-detail-pager-label">
                    Next <i className="fa-solid fa-arrow-right" aria-hidden />
                  </span>
                  <span className="news-detail-pager-title">{next.title}</span>
                </Link>
              ) : (
                <span className="news-detail-pager-spacer" aria-hidden />
              )}
            </nav>
          </article>

          <aside className="news-detail-sidebar" aria-label={`More ${categoryName} articles`}>
            <h2 className="news-sidebar-heading">More {categoryName}</h2>
            <ul className="news-sidebar-list">
              {ordered.map((item) => {
                const active = item.id === article.id;
                return (
                  <li key={item.id} className="news-sidebar-item">
                    {active ? (
                      <div className="news-sidebar-active" aria-current="page">
                        <span className="news-sidebar-active-icon" aria-hidden>
                          <i className="fa-solid fa-arrow-right" />
                        </span>
                        <span className="news-sidebar-active-title">{item.title}</span>
                      </div>
                    ) : (
                      <Link href={newsDetailHref(item.slug)} className="news-sidebar-link">
                        <span className="news-sidebar-link-title">{item.title}</span>
                        <i className="fa-solid fa-chevron-right news-sidebar-chevron" aria-hidden />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
