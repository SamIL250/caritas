import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  encodeProgramAssetUrl,
  formatProgramDate,
  programDetailHref,
} from "@/lib/programs";
import {
  fetchProgramBySlug,
  fetchRelatedPrograms,
} from "../get-programs-data";

import "../programs-page.css";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const found = await fetchProgramBySlug(slug);
  if (!found) {
    return { title: "Program not found — Caritas Rwanda" };
  }
  const { program } = found;
  return {
    title: `${program.title} — Caritas Rwanda`,
    description: program.excerpt || undefined,
  };
}

export default async function ProgramArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const found = await fetchProgramBySlug(slug);
  if (!found) notFound();

  const { program, category } = found;
  const related = await fetchRelatedPrograms(program.category_id, program.id, 3);

  const coverUrl = encodeProgramAssetUrl(program.cover_image_url);
  const externalHref =
    program.external_url?.trim() && /^https?:\/\//i.test(program.external_url)
      ? program.external_url.trim()
      : program.external_url?.trim()
        ? encodeProgramAssetUrl(program.external_url)
        : "";

  return (
    <div className="prog-article-page">
      <header className="prog-article-hero">
        <div className="prog-article-hero-bg" aria-hidden>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" />
          ) : null}
        </div>
        <div className="prog-article-hero-inner">
          <Link href="/programs" className="prog-article-back">
            <i className="fa-solid fa-arrow-left" aria-hidden /> All programs
          </Link>
          {category ? (
            <span className="prog-article-eyebrow">
              {category.icon ? <i className={category.icon} aria-hidden /> : null}
              {category.label}
            </span>
          ) : null}
          <h1 className="prog-article-h1">{program.title}</h1>
          {program.excerpt ? <p className="prog-article-deck">{program.excerpt}</p> : null}
          <div className="prog-article-meta-row">
            {program.published_at ? (
              <span>
                <i className="fa-solid fa-calendar-days" aria-hidden />
                {formatProgramDate(program.published_at)}
              </span>
            ) : null}
            {program.tag_label ? (
              <span>
                <i className={program.tag_icon || "fa-solid fa-tag"} aria-hidden />
                {program.tag_label}
              </span>
            ) : null}
            {category ? (
              <span>
                <i className="fa-solid fa-folder-open" aria-hidden />
                {category.plural_label || category.label}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <div className="prog-article-body-wrap">
        <article className="prog-article-card-body">
          {program.body ? (
            <div
              className="prog-article-content"
              // body is sanitized on save (sanitize-staff-html) and authored by trusted staff
              dangerouslySetInnerHTML={{ __html: program.body }}
            />
          ) : (
            <p className="prog-article-content">
              {program.excerpt || "Full story coming soon."}
            </p>
          )}

          {externalHref ? (
            <div className="prog-article-extlink">
              <span>Looking for more detail or the original source?</span>
              <a href={externalHref} target="_blank" rel="noopener noreferrer">
                Visit external link <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden />
              </a>
            </div>
          ) : null}
        </article>
      </div>

      {related.length > 0 ? (
        <section className="prog-related">
          <h3>More from {category?.label ?? "this program area"}</h3>
          <div className="prog-article-grid">
            {related.map((p) => (
              <Link key={p.id} href={programDetailHref(p)} className="prog-article-card">
                <div className="prog-article-img">
                  {p.cover_image_url.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={encodeProgramAssetUrl(p.cover_image_url)} alt={p.cover_image_alt || p.title} />
                  ) : null}
                  {p.tag_label ? <div className="prog-article-tag">{p.tag_label}</div> : null}
                </div>
                <div className="prog-article-body">
                  <div className="prog-article-meta">
                    <i className="fa-solid fa-calendar" aria-hidden />
                    {formatProgramDate(p.published_at) || "Recently"}
                  </div>
                  <div className="prog-article-title">{p.title}</div>
                  {p.excerpt ? <p className="prog-article-excerpt">{p.excerpt}</p> : null}
                  <div className="prog-article-link">
                    Read <i className="fa-solid fa-arrow-right" aria-hidden />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
