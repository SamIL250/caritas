import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  encodeProgramAssetUrl,
  formatProgramDate,
} from "@/lib/programs";
import { fetchProgramBySlug } from "../get-programs-data";
import { sanitizeStaffRichText } from "@/lib/sanitize-staff-html";
import { fetchDepartmentRelatedContent } from "@/lib/department-related";
import { groupDepartmentRowsForProgramPage } from "@/lib/program-related-grouping";
import { CampaignFullStory } from "@/components/website/campaigns/CampaignFullStory";
import { ProgramPillarAside } from "@/components/website/programs/ProgramPillarAside";
import { ProgramRelatedHub } from "@/components/website/programs/ProgramRelatedHub";

import "../../campaigns/campaign-detail-page.css";
import "../program-detail-page.css";
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
  const supabase = await createClient();

  const relatedRows = await fetchDepartmentRelatedContent(supabase, {
    departmentId: program.category_id,
    excludeProgramId: program.id,
    limit: 48,
    publicationCategorySlugs: ["success_story", "recent_update", "newsletter"],
  });

  const relatedSections = groupDepartmentRowsForProgramPage(relatedRows);

  const coverUrl = encodeProgramAssetUrl(program.cover_image_url);
  const storyHtml =
    program.body?.trim() !== "" ? sanitizeStaffRichText(program.body!.trim()) : "";

  const externalHref =
    program.external_url?.trim() && /^https?:\/\//i.test(program.external_url)
      ? program.external_url.trim()
      : program.external_url?.trim()
        ? encodeProgramAssetUrl(program.external_url)
        : "";

  const pillarSlug = category?.slug ?? program.category;

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
          <nav className="campaign-hero-breadcrumb program-detail-breadcrumb" aria-label="Breadcrumb">
            <Link href="/programs">All programs</Link>
            <span aria-hidden> / </span>
            {category ? (
              <Link href={`/programs#${encodeURIComponent(category.slug)}`}>{category.label}</Link>
            ) : (
              <span>{pillarSlug}</span>
            )}
            <span aria-hidden> / </span>
            <span className="campaign-hero-bc-current">{program.title}</span>
          </nav>
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

      <article className="campaign-detail-body">
        <div className="campaign-detail-body-grid">
          <CampaignFullStory key={`${program.id}-${program.updated_at}`} html={storyHtml} />
          <ProgramPillarAside category={category} pillarSlug={pillarSlug} />
        </div>
      </article>

      {externalHref ? (
        <div className="program-external-callout-wrap">
          <div className="program-external-callout">
            <span>Looking for more detail or the original source?</span>
            <a href={externalHref} target="_blank" rel="noopener noreferrer">
              Visit external link{" "}
              <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden />
            </a>
          </div>
        </div>
      ) : null}

      <ProgramRelatedHub
        pillarLabel={category?.label ?? pillarSlug}
        sections={relatedSections}
      />
    </div>
  );
}
