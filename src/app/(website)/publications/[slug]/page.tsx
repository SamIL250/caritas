import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sanitizeStaffRichText } from "@/lib/sanitize-staff-html";
import {
  encodePublicationAssetUrl,
  publicationCategoryLabel,
  publicationHasPdf,
  publicationPrimaryHref,
  type PublicationCategoryRow,
  type PublicationRow,
} from "@/lib/publications";
import type { ProgramCategoryRow } from "@/lib/programs";
import "../publications-page.css";

type PageProps = { params: { slug: string } };

async function fetchPublicationBySlug(
  slug: string,
): Promise<{
  publication: PublicationRow;
  category: PublicationCategoryRow | null;
  department: ProgramCategoryRow | null;
} | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("publications")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return null;
  const publication = data as PublicationRow;

  const [categoryRes, departmentRes] = await Promise.all([
    publication.category_id
      ? supabase
          .from("publication_categories")
          .select("*")
          .eq("id", publication.category_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    publication.department_id
      ? supabase
          .from("program_categories")
          .select("*")
          .eq("id", publication.department_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    publication,
    category: categoryRes.data as PublicationCategoryRow | null,
    department: departmentRes.data as ProgramCategoryRow | null,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const row = await fetchPublicationBySlug(params.slug);
  if (!row) {
    return { title: "Publication not found — Caritas Rwanda" };
  }
  return {
    title: `${row.publication.title} — Caritas Rwanda`,
    description: row.publication.excerpt || undefined,
  };
}

export default async function PublicationDetailPage({ params }: PageProps) {
  const data = await fetchPublicationBySlug(params.slug);
  if (!data) notFound();

  const { publication, category, department } = data;
  const storyHtml = publication.body?.trim() ? sanitizeStaffRichText(publication.body.trim()) : "";
  const href = publicationHasPdf(publication)
    ? publicationPrimaryHref(publication)
    : publication.external_url?.trim() || "";

  return (
    <div className="pub-article-page">
      <header className="pub-article-hero">
        <div className="pub-article-hero-bg" aria-hidden>
          {publication.cover_image_url.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={encodePublicationAssetUrl(publication.cover_image_url)} alt="" />
          ) : null}
        </div>
        <div className="pub-article-hero-inner">
          <nav className="pub-breadcrumb" aria-label="Breadcrumb">
            <Link href="/publications">Publications</Link>
            <span aria-hidden> / </span>
            <span>{publication.title}</span>
          </nav>
          <span className="pub-article-eyebrow">
            {category ? category.label : publication.category}
            {department ? ` · ${department.label}` : ""}
          </span>
          <h1 className="pub-article-h1">{publication.title}</h1>
          {publication.excerpt ? <p className="pub-article-deck">{publication.excerpt}</p> : null}
          {href ? (
            <div className="pub-article-actions">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="pub-article-action-btn"
              >
                {publicationHasPdf(publication) ? "Download PDF" : "Open external link"}
              </a>
            </div>
          ) : null}
        </div>
      </header>
      <article className="pub-article-body">
        <div className="pub-article-body-grid">
          <div className="pub-article-story">
            {storyHtml ? (
              <div dangerouslySetInnerHTML={{ __html: storyHtml }} />
            ) : (
              <p>This publication is available through the link above.</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
