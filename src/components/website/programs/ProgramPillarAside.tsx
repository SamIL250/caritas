import Link from "next/link";
import type { ProgramCategoryRow } from "@/lib/programs";

type Props = {
  category: ProgramCategoryRow | null;
  /** program_categories.slug */
  pillarSlug: string;
};

/**
 * Sidebar styled like the campaign “Community messages” card — pillar context and
 * quick paths to other content for the same program area (no new DB tables).
 */
export function ProgramPillarAside({ category, pillarSlug }: Props) {
  const label = category?.label ?? "This program area";
  const description =
    category?.description?.trim() ||
    "Explore news, publications, and other activities that share this pillar.";

  return (
    <aside
      className="program-pillar-aside"
      aria-labelledby="program-pillar-aside-heading"
    >
      <div className="program-pillar-card">
        <div className="program-pillar-card-head">
          {category?.icon ? (
            <span className="program-pillar-card-icon" aria-hidden>
              <i className={category.icon} />
            </span>
          ) : null}
          <h2 id="program-pillar-aside-heading" className="program-pillar-card-title">
            {label}
          </h2>
        </div>
        <p className="program-pillar-card-lead">{description}</p>

        <div className="program-pillar-links">
          <Link href={`/programs#${encodeURIComponent(pillarSlug)}`} className="program-pillar-link-row">
            <span className="program-pillar-link-label">All programs in this pillar</span>
            <i className="fa-solid fa-arrow-right program-pillar-link-chevron" aria-hidden />
          </Link>
          <Link href="/news" className="program-pillar-link-row">
            <span className="program-pillar-link-label">Newsroom</span>
            <i className="fa-solid fa-arrow-right program-pillar-link-chevron" aria-hidden />
          </Link>
          <Link href="/publications" className="program-pillar-link-row">
            <span className="program-pillar-link-label">Publications library</span>
            <i className="fa-solid fa-arrow-right program-pillar-link-chevron" aria-hidden />
          </Link>
          <Link href="/get-involved" className="program-pillar-link-row">
            <span className="program-pillar-link-label">Get involved &amp; support</span>
            <i className="fa-solid fa-arrow-right program-pillar-link-chevron" aria-hidden />
          </Link>
        </div>

        <p className="program-pillar-note">
          Success stories and community voices for this pillar appear in{" "}
          <strong>Success stories</strong> and <strong>Updates</strong> under Related content below.
        </p>
      </div>
    </aside>
  );
}
