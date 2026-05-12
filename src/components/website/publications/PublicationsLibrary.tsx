"use client";

import React, { useMemo, useState } from "react";
import type {
  PublicationCategoryRow,
  PublicationRow,
} from "@/lib/publications";
import {
  encodePublicationAssetUrl,
  publicationHasPdf,
  publicationPrimaryHref,
  readCategoryBehavior,
} from "@/lib/publications";

type FilterKey = "all" | string;

type Props = {
  publications: PublicationRow[];
  categories: PublicationCategoryRow[];
};

function formatHeroDate(iso: string | null): string {
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

function gridClassForKind(kind: string, slug: string): string {
  if (slug === "annual_report") return "pub-report-grid";
  if (slug === "newsletter") return "pub-nl-grid";
  if (slug === "recent_update") return "pub-news-grid";
  if (slug === "success_story") return "pub-stories-grid";
  if (kind === "pdf") return "pub-report-grid";
  if (kind === "story") return "pub-stories-grid";
  if (kind === "external") return "pub-news-grid";
  return "pub-news-grid";
}

export default function PublicationsLibrary({ publications, categories }: Props) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const sortedCategories = useMemo(
    () =>
      [...categories]
        .filter((c) => c.slug !== "strategic_plan")
        .sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label)),
    [categories],
  );

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    publications.forEach((p) => {
      m[p.category] = (m[p.category] ?? 0) + 1;
    });
    return m;
  }, [publications]);

  const strategicCat = useMemo(
    () => categories.find((c) => c.slug === "strategic_plan") ?? null,
    [categories],
  );
  const strategicFeatured = useMemo(() => {
    const strat = publications.filter((p) => p.category === "strategic_plan");
    return strat.find((p) => p.featured) ?? strat[0] ?? null;
  }, [publications]);

  const totalCount = publications.length;
  const showSection = (slug: string) => filter === "all" || filter === slug;

  return (
    <>
      <div className="pub-filter-bar">
        <div className="pub-filter-inner">
          <button
            type="button"
            className={`pub-filter-btn${filter === "all" ? " active" : ""}`}
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
          >
            <i className="fa-solid fa-layer-group" aria-hidden />
            All
            <span className="pub-filter-count">{totalCount}</span>
          </button>

          {strategicCat ? (
            <button
              key={strategicCat.id}
              type="button"
              className={`pub-filter-btn${filter === strategicCat.slug ? " active" : ""}`}
              onClick={() => setFilter(strategicCat.slug)}
              aria-pressed={filter === strategicCat.slug}
            >
              {strategicCat.icon ? <i className={strategicCat.icon} aria-hidden /> : null}
              {strategicCat.plural_label || strategicCat.label}
              <span className="pub-filter-count">{counts[strategicCat.slug] ?? 0}</span>
            </button>
          ) : null}

          {sortedCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`pub-filter-btn${filter === c.slug ? " active" : ""}`}
              onClick={() => setFilter(c.slug)}
              aria-pressed={filter === c.slug}
            >
              {c.icon ? <i className={c.icon} aria-hidden /> : null}
              {c.plural_label || c.label}
              <span className="pub-filter-count">{counts[c.slug] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="pub-main">
        {strategicFeatured && strategicCat && showSection("strategic_plan") ? (
          <section
            className="pub-section"
            id={readCategoryBehavior(strategicCat).site_anchor || "strategic"}
            aria-labelledby="pub-strategic-heading"
          >
            <a
              href={publicationPrimaryHref(strategicFeatured)}
              target="_blank"
              rel="noopener noreferrer"
              className="pub-featured"
            >
              <div className="pub-feat-img">
                {strategicFeatured.cover_image_url.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={encodePublicationAssetUrl(strategicFeatured.cover_image_url)}
                    alt={strategicFeatured.cover_image_alt || strategicFeatured.title}
                  />
                ) : null}
                <div className="pub-feat-badge">
                  <i className="fa-solid fa-star" aria-hidden /> Featured
                </div>
              </div>
              <div className="pub-feat-body">
                <div className="pub-feat-tag">
                  {strategicCat.icon ? <i className={strategicCat.icon} aria-hidden /> : null}
                  {strategicCat.label}
                </div>
                <h2 className="pub-feat-title" id="pub-strategic-heading">
                  {strategicFeatured.title}
                </h2>
                <p className="pub-feat-desc">{strategicFeatured.excerpt}</p>
                <div className="pub-feat-meta">
                  {strategicFeatured.published_at ? (
                    <div className="pub-feat-meta-item">
                      <i className="fa-solid fa-calendar-days" aria-hidden />
                      {formatHeroDate(strategicFeatured.published_at)}
                    </div>
                  ) : null}
                  {publicationHasPdf(strategicFeatured) ? (
                    <div className="pub-feat-meta-item">
                      <i className="fa-solid fa-file-pdf" aria-hidden />
                      PDF document
                    </div>
                  ) : null}
                  {strategicFeatured.meta_line.trim() ? (
                    <div className="pub-feat-meta-item">
                      <i className="fa-solid fa-globe" aria-hidden />
                      {strategicFeatured.meta_line}
                    </div>
                  ) : null}
                </div>
                <div className="pub-feat-actions">
                  <span className="pub-btn-download">
                    <i className="fa-solid fa-download" aria-hidden />
                    Download PDF
                  </span>
                  <span className="pub-btn-preview">
                    <i className="fa-solid fa-eye" aria-hidden />
                    Open
                  </span>
                </div>
              </div>
            </a>
          </section>
        ) : null}

        {sortedCategories.map((cat) => {
          const items = publications.filter((p) => p.category === cat.slug);
          if (!items.length) return null;
          const behavior = readCategoryBehavior(cat);
          const anchor = behavior.site_anchor || cat.slug.replace(/_/g, "-");
          const visible = showSection(cat.slug);
          return (
            <CategorySection
              key={cat.id}
              cat={cat}
              items={items}
              anchor={anchor}
              visible={visible}
            />
          );
        })}
      </main>
    </>
  );
}

function CategorySection({
  cat,
  items,
  anchor,
  visible,
}: {
  cat: PublicationCategoryRow;
  items: PublicationRow[];
  anchor: string;
  visible: boolean;
}) {
  const headingId = `pub-${cat.slug}-heading`;
  const gridClass = gridClassForKind(cat.kind, cat.slug);
  return (
    <section
      className={`pub-section${visible ? "" : " pub-section--hidden"}`}
      id={anchor}
      aria-labelledby={headingId}
    >
      <div className="pub-section-head">
        <div className="pub-section-title-wrap">
          <div className="pub-section-eyebrow">
            {cat.icon ? <i className={cat.icon} aria-hidden /> : null}
            {cat.plural_label || cat.label}
          </div>
          <h2 className="pub-section-title" id={headingId}>
            {cat.label}
          </h2>
        </div>
      </div>
      <div className={gridClass}>
        {items.map((p) => (
          <CategoryCard key={p.id} cat={cat} row={p} />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ cat, row }: { cat: PublicationCategoryRow; row: PublicationRow }) {
  if (cat.slug === "annual_report" || (cat.kind === "pdf" && cat.slug !== "newsletter")) {
    return (
      <a
        href={publicationPrimaryHref(row)}
        target="_blank"
        rel="noopener noreferrer"
        className="pub-report-card"
      >
        <div className="pub-report-cover">
          {row.cover_image_url.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={encodePublicationAssetUrl(row.cover_image_url)} alt={row.cover_image_alt || row.title} />
          ) : null}
          <div className="pub-report-cover-overlay" aria-hidden />
          {row.period_label.trim() ? <div className="pub-report-year">{row.period_label}</div> : null}
        </div>
        <div className="pub-report-body">
          <div className="pub-report-title">{row.title}</div>
          <div className="pub-report-download">
            <i className="fa-solid fa-download" aria-hidden />
            {publicationHasPdf(row) ? "Download PDF" : "Open"}
          </div>
        </div>
      </a>
    );
  }

  if (cat.slug === "newsletter") {
    return (
      <a
        href={publicationPrimaryHref(row)}
        target="_blank"
        rel="noopener noreferrer"
        className="pub-nl-card"
      >
        <div className="pub-nl-cover">
          {row.cover_image_url.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={encodePublicationAssetUrl(row.cover_image_url)} alt={row.cover_image_alt || row.title} />
          ) : null}
        </div>
        <div className="pub-nl-body">
          {row.period_label.trim() ? <div className="pub-nl-period">{row.period_label}</div> : null}
          <div className="pub-nl-title">{row.title}</div>
          <div className="pub-nl-download">
            <i className="fa-solid fa-download" aria-hidden /> Download
          </div>
        </div>
      </a>
    );
  }

  if (cat.kind === "external" || cat.slug === "recent_update") {
    return (
      <a
        href={publicationPrimaryHref(row)}
        target="_blank"
        rel="noopener noreferrer"
        className="pub-news-card"
      >
        <div className="pub-news-img">
          {row.cover_image_url.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={encodePublicationAssetUrl(row.cover_image_url)} alt={row.cover_image_alt || row.title} />
          ) : null}
          {row.tag_label.trim() ? <div className="pub-news-category">{row.tag_label}</div> : null}
        </div>
        <div className="pub-news-body">
          <div className="pub-news-date">
            <i className="fa-solid fa-calendar" aria-hidden />
            {row.period_label.trim() || formatHeroDate(row.published_at)}
          </div>
          <div className="pub-news-title">{row.title}</div>
          <div className="pub-news-read">
            Read more <i className="fa-solid fa-arrow-right" aria-hidden />
          </div>
        </div>
      </a>
    );
  }

  // story (or hybrid fallback)
  return (
    <a
      href={publicationPrimaryHref(row)}
      target="_blank"
      rel="noopener noreferrer"
      className="pub-story-card"
    >
      <div className="pub-story-img">
        {row.cover_image_url.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={encodePublicationAssetUrl(row.cover_image_url)} alt={row.cover_image_alt || row.title} />
        ) : null}
      </div>
      <div className="pub-story-body">
        {row.tag_label.trim() ? (
          <div className="pub-story-tag">
            {row.tag_icon.trim() ? <i className={row.tag_icon.trim()} aria-hidden /> : null}{" "}
            {row.tag_label}
          </div>
        ) : null}
        <div className="pub-story-title">{row.title}</div>
        {row.excerpt.trim() ? <p className="pub-story-excerpt">{row.excerpt}</p> : null}
        <div className="pub-story-link">
          Read story <i className="fa-solid fa-arrow-right" aria-hidden />
        </div>
      </div>
    </a>
  );
}
