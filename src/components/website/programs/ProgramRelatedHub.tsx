import Link from "next/link";
import {
  resolveDepartmentRelatedHref,
  type DepartmentRelatedRow,
} from "@/lib/department-related";
import { encodeProgramAssetUrl, formatProgramDate } from "@/lib/programs";
import type { ProgramRelatedSection } from "@/lib/program-related-grouping";

type Props = {
  pillarLabel: string;
  sections: ProgramRelatedSection[];
};

function isAbsoluteUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function eyebrowForRow(row: DepartmentRelatedRow): string {
  if (row.source_kind === "news") return "News";
  if (row.source_kind === "program") return "Program";
  if (row.source_kind === "publication") {
    if (row.meta_label === "success_story") return "Success story";
    if (row.meta_label === "recent_update") return "Update";
    if (row.meta_label === "newsletter") return "Newsletter";
    if (row.meta_label) return row.meta_label.replace(/_/g, " ");
    return "Publication";
  }
  return "Related";
}

export function ProgramRelatedHub({ pillarLabel, sections }: Props) {
  const total = sections.reduce((n, s) => n + s.items.length, 0);
  if (!total) return null;

  return (
    <section className="program-related-hub" aria-labelledby="program-related-hub-heading">
      <div className="program-related-hub-inner">
        <header className="program-related-hub-head">
          <h2 id="program-related-hub-heading" className="program-related-hub-title">
            Related content
          </h2>
          <p className="program-related-hub-sub">
            News, programs, and publications tagged with <strong>{pillarLabel}</strong> — one place to
            browse everything about this pillar.
          </p>
        </header>

        <div className="program-related-hub-sections">
          {sections.map((sec) => (
            <div key={sec.id} className="program-related-section">
              <div className="program-related-section-head">
                <h3 className="program-related-section-title">{sec.title}</h3>
                {sec.description ? (
                  <p className="program-related-section-desc">{sec.description}</p>
                ) : null}
              </div>
              <ul className="program-related-list">
                {sec.items.map((row) => {
                  const href = resolveDepartmentRelatedHref(row);
                  const external = isAbsoluteUrl(href);
                  const thumb = row.thumb_url?.trim() ?? "";
                  const dateStr = formatProgramDate(row.published_at);
                  const inner = (
                    <>
                      <div className="program-related-card-media">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={encodeProgramAssetUrl(thumb)} alt="" className="program-related-card-img" />
                        ) : (
                          <div className="program-related-card-placeholder" aria-hidden>
                            <i className="fa-solid fa-file-lines" />
                          </div>
                        )}
                      </div>
                      <div className="program-related-card-body">
                        <span className="program-related-card-eyebrow">{eyebrowForRow(row)}</span>
                        <span className="program-related-card-title">{row.title}</span>
                        {row.excerpt ? (
                          <span className="program-related-card-excerpt">{row.excerpt}</span>
                        ) : null}
                        <span className="program-related-card-meta">
                          {dateStr ? <span>{dateStr}</span> : null}
                          <span className="program-related-card-cta">
                            {external ? "Open" : "View"}
                            <i className="fa-solid fa-arrow-right" aria-hidden />
                          </span>
                        </span>
                      </div>
                    </>
                  );
                  return (
                    <li key={`${row.source_kind}-${row.entity_id}`}>
                      {external ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="program-related-card"
                        >
                          {inner}
                        </a>
                      ) : (
                        <Link href={href} className="program-related-card">
                          {inner}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
