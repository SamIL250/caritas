import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prepareStaffRichHtml } from "@/lib/prepare-staff-rich-html";
import { fetchDepartmentRelatedContent } from "@/lib/department-related";
import { groupDepartmentRowsForProgramPage } from "@/lib/program-related-grouping";
import { ProgramRelatedHub } from "@/components/website/programs/ProgramRelatedHub";
import {
  encodePublicationAssetUrl,
  publicationCategoryLabel,
  publicationHasPdf,
  publicationPrimaryHref,
  type PublicationCategoryRow,
  type PublicationRow,
} from "@/lib/publications";
import type { ProgramCategoryRow } from "@/lib/programs";
import { ViewTracker } from "@/components/website/ViewTracker";
import { PublicationDetailWrapper } from "@/components/website/publications/PublicationDetailWrapper";
import "../publications-page.css";
import "../../programs/program-detail-page.css";

type PageProps = { params: Promise<{ slug: string }> };

type PublicationWithLock = PublicationRow & { is_locked: boolean; access_password: string | null };

async function fetchPublicationBySlug(
  slug: string,
): Promise<{
  publication: PublicationWithLock;
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
  const publication = data as unknown as PublicationWithLock;

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
  const { slug } = await params;
  const row = await fetchPublicationBySlug(slug);
  if (!row) {
    return { title: "Publication not found — Caritas Rwanda" };
  }
  return {
    title: `${row.publication.title} — Caritas Rwanda`,
    description: row.publication.excerpt || undefined,
  };
}

export default async function PublicationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchPublicationBySlug(slug);
  if (!data) notFound();

  const { publication, category, department } = data;
  const storyHtml = publication.body?.trim() ? await prepareStaffRichHtml(publication.body.trim()) : "";
  const href = publicationHasPdf(publication)
    ? publicationPrimaryHref(publication)
    : publication.external_url?.trim() || "";

  let relatedSections: any = null;
  if (department) {
    const supabase = await createClient();
    const relatedRows = await fetchDepartmentRelatedContent(supabase, {
      departmentId: department.id,
      excludePublicationId: publication.id,
      limit: 12,
      publicationCategorySlugs: ["success_story", "recent_update", "newsletter"],
    });
    relatedSections = groupDepartmentRowsForProgramPage(relatedRows);
  }

  return (
    <PublicationDetailWrapper
      publicationId={publication.id}
      isLocked={publication.is_locked}
      publicationTitle={publication.title}
    >
      <div className="pub-article-page program-detail-flush">
        <header className="prog-article-hero">
          <div className="prog-article-hero-bg" aria-hidden>
            {publication.cover_image_url.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={encodePublicationAssetUrl(publication.cover_image_url)} alt="" />
            ) : null}
          </div>
          <div className="prog-article-hero-inner">
            <nav className="campaign-hero-breadcrumb" aria-label="Breadcrumb">
              <Link href="/publications">Publications</Link>
              <span aria-hidden> / </span>
              <span className="campaign-hero-bc-current">{publication.title}</span>
            </nav>
            <span className="prog-article-eyebrow">
              {category ? category.label : publication.category}
              {department ? ` · ${department.label}` : ""}
            </span>
            <h1 className="prog-article-h1">{publication.title}</h1>
            {publication.excerpt ? <p className="prog-article-deck">{publication.excerpt}</p> : null}
            {href ? (
              <div className="prog-article-meta-row" style={{ marginTop: '1.5rem' }}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pub-btn-download"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden />
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

        {department && relatedSections && (
          <ProgramRelatedHub
            pillarLabel={department.label}
            sections={relatedSections}
          />
        )}
        <ViewTracker pageType="publication" pageId={publication.id} />
      </div>
    </PublicationDetailWrapper>
  );
}
