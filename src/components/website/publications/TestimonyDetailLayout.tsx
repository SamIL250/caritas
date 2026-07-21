import Link from "next/link";
import {
  encodeTestimonyAssetUrl,
  sortTestimonies,
  testimonyDetailHref,
  type TestimonyRow,
} from "@/lib/testimonies";
import { MediaFigure } from "@/components/website/MediaCaptionProvider";

type Props = {
  testimony: TestimonyRow;
  allTestimonies: TestimonyRow[];
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function TestimonyDetailLayout({ testimony, allTestimonies }: Props) {
  const ordered = sortTestimonies(allTestimonies);
  const currentIndex = ordered.findIndex((t) => t.id === testimony.id);
  const previous = currentIndex > 0 ? ordered[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : null;

  const coverUrl = testimony.cover_image_url.trim()
    ? encodeTestimonyAssetUrl(testimony.cover_image_url)
    : null;

  return (
    <div className="testimony-detail-page">
      <div className="testimony-detail-shell">
        <nav className="testimony-detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/publications#testimonies">Publications</Link>
          <span aria-hidden> / </span>
          <span className="testimony-detail-breadcrumb-current">Testimonies</span>
        </nav>

        <header className="testimony-detail-intro">
          <p className="testimony-detail-eyebrow">Testimony</p>
          <h1 className="testimony-detail-title">{testimony.title}</h1>
          {testimony.published_at ? (
            <p className="testimony-detail-date">
              <i className="fa-solid fa-calendar-days" aria-hidden />{" "}
              {formatDate(testimony.published_at)}
            </p>
          ) : null}
        </header>

        <div className="testimony-detail-layout">
          <article className="testimony-detail-main">
            {coverUrl ? (
              <div className="testimony-detail-cover">
                <MediaFigure
                  src={coverUrl}
                  alt={testimony.cover_image_alt || testimony.title}
                  figureClassName="testimony-detail-cover-figure"
                  imgClassName=""
                />
              </div>
            ) : null}

            {testimony.excerpt.trim() ? (
              <p className="testimony-detail-lede">{testimony.excerpt}</p>
            ) : null}

            <div
              className="testimony-detail-body prose-testimony"
              dangerouslySetInnerHTML={{ __html: testimony.body }}
            />

            <nav className="testimony-detail-pager" aria-label="Testimony navigation">
              {previous ? (
                <Link href={testimonyDetailHref(previous)} className="testimony-detail-pager-link prev">
                  <span className="testimony-detail-pager-label">
                    <i className="fa-solid fa-arrow-left" aria-hidden /> Previous
                  </span>
                  <span className="testimony-detail-pager-title">{previous.title}</span>
                </Link>
              ) : (
                <span className="testimony-detail-pager-spacer" aria-hidden />
              )}
              {next ? (
                <Link href={testimonyDetailHref(next)} className="testimony-detail-pager-link next">
                  <span className="testimony-detail-pager-label">
                    Next <i className="fa-solid fa-arrow-right" aria-hidden />
                  </span>
                  <span className="testimony-detail-pager-title">{next.title}</span>
                </Link>
              ) : (
                <span className="testimony-detail-pager-spacer" aria-hidden />
              )}
            </nav>
          </article>

          <aside className="testimony-detail-sidebar" aria-label="More testimonies">
            <h2 className="testimony-sidebar-heading">More testimonies</h2>
            <ul className="testimony-sidebar-list">
              {ordered.map((item) => {
                const active = item.id === testimony.id;
                return (
                  <li key={item.id} className="testimony-sidebar-item">
                    {active ? (
                      <div className="testimony-sidebar-active" aria-current="page">
                        <span className="testimony-sidebar-active-icon" aria-hidden>
                          <i className="fa-solid fa-arrow-right" />
                        </span>
                        <span className="testimony-sidebar-active-title">{item.title}</span>
                      </div>
                    ) : (
                      <Link href={testimonyDetailHref(item)} className="testimony-sidebar-link">
                        <span className="testimony-sidebar-link-title">{item.title}</span>
                        <i className="fa-solid fa-chevron-right testimony-sidebar-chevron" aria-hidden />
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
