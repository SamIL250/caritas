import Link from "next/link";
import { formatPublishedDate } from "@/lib/news";
import { sortByPublishedNewest } from "@/lib/content-sort";
import { MediaFigure } from "@/components/website/MediaCaptionProvider";

export type ArticleDetailPeer = {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  created_at?: string | null;
};

export type ArticleDetailBreadcrumb = {
  href: string;
  label: string;
};

type Props = {
  title: string;
  excerpt?: string | null;
  bodyHtml: string;
  coverUrl?: string;
  coverAlt?: string;
  eyebrow: string;
  publishedAt?: string | null;
  breadcrumb: ArticleDetailBreadcrumb[];
  breadcrumbCurrent: string;
  sidebarHeading: string;
  sidebarAriaLabel: string;
  peers: ArticleDetailPeer[];
  currentId: string;
  detailHref: (slug: string) => string;
  externalUrl?: string | null;
};

export function ArticleDetailLayout({
  title,
  excerpt,
  bodyHtml,
  coverUrl,
  coverAlt,
  eyebrow,
  publishedAt,
  breadcrumb,
  breadcrumbCurrent,
  sidebarHeading,
  sidebarAriaLabel,
  peers,
  currentId,
  detailHref,
  externalUrl,
}: Props) {
  const ordered = sortByPublishedNewest(peers);
  const currentIndex = ordered.findIndex((item) => item.id === currentId);
  const previous = currentIndex > 0 ? ordered[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : null;

  const cover = coverUrl?.trim() || "";
  const isExternalArticle =
    Boolean(externalUrl?.trim()) && /^https?:\/\//i.test(externalUrl ?? "");

  return (
    <div className="news-detail-page">
      <div className="news-detail-shell">
        <nav className="news-detail-breadcrumb" aria-label="Breadcrumb">
          {breadcrumb.map((item) => (
            <span key={item.href}>
              <Link href={item.href}>{item.label}</Link>
              <span aria-hidden> / </span>
            </span>
          ))}
          <span className="news-detail-breadcrumb-current">{breadcrumbCurrent}</span>
        </nav>

        {cover ? (
          <div className="news-detail-cover">
            <MediaFigure
              src={cover}
              alt={coverAlt || title}
              figureClassName="news-detail-cover-figure"
              imgClassName=""
            />
          </div>
        ) : null}

        <header className="news-detail-intro">
          <p className="news-detail-eyebrow">{eyebrow}</p>
          <h1 className="news-detail-title">{title}</h1>
          {publishedAt ? (
            <p className="news-detail-date">
              <i className="fa-solid fa-calendar-days" aria-hidden />{" "}
              {formatPublishedDate(publishedAt)}
            </p>
          ) : null}
        </header>

        <div className="news-detail-layout">
          <article className="news-detail-main">
            {excerpt?.trim() ? <p className="news-detail-lede">{excerpt}</p> : null}

            {bodyHtml ? (
              <div
                className="news-detail-body prose-news-detail"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : isExternalArticle ? (
              <p className="news-detail-empty">
                This article is available at the original source.{" "}
                <a href={externalUrl!} target="_blank" rel="noopener noreferrer">
                  Open original article
                </a>
              </p>
            ) : (
              <p className="news-detail-empty">The full article text will be posted here soon.</p>
            )}

            {isExternalArticle && bodyHtml ? (
              <p className="news-detail-external-link">
                <a href={externalUrl!} target="_blank" rel="noopener noreferrer">
                  Read at original source{" "}
                  <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden />
                </a>
              </p>
            ) : null}

            <nav className="news-detail-pager" aria-label="Article navigation">
              {previous ? (
                <Link href={detailHref(previous.slug)} className="news-detail-pager-link prev">
                  <span className="news-detail-pager-label">
                    <i className="fa-solid fa-arrow-left" aria-hidden /> Previous
                  </span>
                  <span className="news-detail-pager-title">{previous.title}</span>
                </Link>
              ) : (
                <span className="news-detail-pager-spacer" aria-hidden />
              )}
              {next ? (
                <Link href={detailHref(next.slug)} className="news-detail-pager-link next">
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

          <aside className="news-detail-sidebar" aria-label={sidebarAriaLabel}>
            <h2 className="news-sidebar-heading">{sidebarHeading}</h2>
            <ul className="news-sidebar-list">
              {ordered.map((item) => {
                const active = item.id === currentId;
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
                      <Link href={detailHref(item.slug)} className="news-sidebar-link">
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
