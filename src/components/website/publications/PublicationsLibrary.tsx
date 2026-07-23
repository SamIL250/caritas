"use client";

import React, { useMemo, useState, useEffect } from "react";
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
import { TESTIMONIES_SECTION_ANCHOR, type TestimonyRow } from "@/lib/testimonies";
import { TestimoniesSection } from "./TestimoniesSection";
import { PublicationLockModal } from "./PublicationLockModal";
import { ViewTracker } from "@/components/website/ViewTracker";
import { MediaFigure } from "@/components/website/MediaCaptionProvider";

type FilterKey = "all" | string;

type Props = {
  publications: PublicationRow[];
  categories: PublicationCategoryRow[];
  testimonies?: TestimonyRow[];
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
  if (slug === "annual_report") return "pub-card-grid";
  if (slug === "newsletter") return "pub-card-grid";
  if (slug === "recent_update") return "pub-card-grid";
  if (slug === "success_story") return "pub-card-grid";
  if (kind === "pdf") return "pub-card-grid";
  if (kind === "story") return "pub-card-grid";
  if (kind === "external") return "pub-card-grid";
  if (kind === "file") return "pub-card-grid";
  return "pub-card-grid";
}

function itemYear(publishedAt: string | null): number | null {
  if (!publishedAt) return null;
  const year = new Date(publishedAt).getFullYear();
  return Number.isNaN(year) ? null : year;
}

function publicationYear(row: Pick<PublicationRow, "published_at">): number | null {
  return itemYear(row.published_at);
}

function testimonyYear(row: Pick<TestimonyRow, "published_at">): number | null {
  return itemYear(row.published_at);
}

function matchesYearFilter(year: number | null, yearFilter: number | "all"): boolean {
  if (yearFilter === "all") return true;
  return year === yearFilter;
}

export default function PublicationsLibrary({ publications, categories, testimonies = [] }: Props) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [activePublication, setActivePublication] = useState<PublicationRow | null>(null);
  const [lockedPub, setLockedPub] = useState<PublicationRow | null>(null);

  const sortedCategories = useMemo(
    () =>
      [...categories]
        .filter((c) => c.slug !== "strategic_plan" && c.slug !== "success_story")
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

  const totalCount =
    publications.filter((p) => p.category !== "success_story").length + testimonies.length;
  const showSection = (slug: string) => filter === "all" || filter === slug;
  const showTestimonies = filter === "all" || filter === TESTIMONIES_SECTION_ANCHOR;

  const scopedPublications = useMemo(() => {
    if (filter === TESTIMONIES_SECTION_ANCHOR) return [];
    if (filter === "all") {
      return publications.filter((p) => p.category !== "success_story");
    }
    return publications.filter((p) => p.category === filter);
  }, [filter, publications]);

  const scopedTestimonies = useMemo(() => {
    if (filter === "all" || filter === TESTIMONIES_SECTION_ANCHOR) return testimonies;
    return [];
  }, [filter, testimonies]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const publication of scopedPublications) {
      const year = publicationYear(publication);
      if (year !== null) years.add(year);
    }
    for (const testimony of scopedTestimonies) {
      const year = testimonyYear(testimony);
      if (year !== null) years.add(year);
    }
    return [...years].sort((a, b) => b - a);
  }, [scopedPublications, scopedTestimonies]);

  useEffect(() => {
    setYearFilter("all");
  }, [filter]);

  useEffect(() => {
    if (yearFilter !== "all" && !availableYears.includes(yearFilter)) {
      setYearFilter("all");
    }
  }, [availableYears, yearFilter]);

  const showStrategicFeatured =
    strategicFeatured &&
    matchesYearFilter(publicationYear(strategicFeatured), yearFilter);

  const hasFilteredContent = useMemo(() => {
    if (yearFilter === "all") return true;
    if (showStrategicFeatured) return true;

    const hasCategoryItems = sortedCategories.some((cat) => {
      const sectionVisible = filter === "all" || filter === cat.slug;
      if (!sectionVisible) return false;
      return publications
        .filter((p) => p.category === cat.slug)
        .some((row) => matchesYearFilter(publicationYear(row), yearFilter));
    });

    const hasTestimonyItems =
      (filter === "all" || filter === TESTIMONIES_SECTION_ANCHOR) &&
      scopedTestimonies.some((row) => matchesYearFilter(testimonyYear(row), yearFilter));

    return hasCategoryItems || hasTestimonyItems;
  }, [
    yearFilter,
    showStrategicFeatured,
    sortedCategories,
    filter,
    publications,
    scopedTestimonies,
  ]);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash === TESTIMONIES_SECTION_ANCHOR) {
      setFilter(TESTIMONIES_SECTION_ANCHOR);
      window.setTimeout(() => {
        document.getElementById(TESTIMONIES_SECTION_ANCHOR)?.scrollIntoView({ behavior: "smooth" });
      }, 120);
    }
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = activePublication ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activePublication]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActivePublication(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleLockUnlock(pub: PublicationRow) {
    const hasPdf = publicationHasPdf(pub);
    if (hasPdf) {
      window.open(publicationPrimaryHref(pub), '_blank', 'noopener');
    } else {
      setActivePublication(pub);
    }
    setLockedPub(null);
  }

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

          <button
            type="button"
            className={`pub-filter-btn${filter === TESTIMONIES_SECTION_ANCHOR ? " active" : ""}`}
            onClick={() => setFilter(TESTIMONIES_SECTION_ANCHOR)}
            aria-pressed={filter === TESTIMONIES_SECTION_ANCHOR}
          >
            <i className="fa-solid fa-user" aria-hidden />
            Testimonies
            <span className="pub-filter-count">{testimonies.length}</span>
          </button>
        </div>
      </div>

      <div className="pub-main-layout">
        <div className="pub-main-content">
          {yearFilter !== "all" && !hasFilteredContent ? (
            <p className="pub-empty-filtered">
              No publications from {yearFilter} in this selection. Try another year or category.
            </p>
          ) : null}

          {filter !== TESTIMONIES_SECTION_ANCHOR && strategicFeatured && strategicCat && showSection("strategic_plan") && showStrategicFeatured ? (
            <section
              className="pub-section"
              id={readCategoryBehavior(strategicCat).site_anchor || "strategic"}
              aria-labelledby="pub-strategic-heading"
            >
              {(strategicFeatured as any).is_locked ? (
                <div
                  className="pub-featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => setLockedPub(strategicFeatured)}
                  onKeyDown={(e) => e.key === "Enter" && setLockedPub(strategicFeatured)}
                  style={{ cursor: "pointer" }}
                >
                  <FeaturedContent cat={strategicCat} pub={strategicFeatured} />
                </div>
              ) : publicationHasPdf(strategicFeatured) ? (
                <a
                  href={publicationPrimaryHref(strategicFeatured)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pub-featured"
                >
                  <FeaturedContent cat={strategicCat} pub={strategicFeatured} />
                </a>
              ) : (
                <div
                  className="pub-featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => setActivePublication(strategicFeatured)}
                  onKeyDown={(e) => e.key === "Enter" && setActivePublication(strategicFeatured)}
                  style={{ cursor: "pointer" }}
                >
                  <FeaturedContent cat={strategicCat} pub={strategicFeatured} />
                </div>
              )}
            </section>
          ) : null}

          {filter !== TESTIMONIES_SECTION_ANCHOR
            ? sortedCategories.map((cat) => {
                const items = publications.filter((p) => p.category === cat.slug);
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
                    yearFilter={yearFilter}
                    onOpenDrawer={setActivePublication}
                    onLockedClick={setLockedPub}
                  />
                );
              })
            : null}

          <TestimoniesSection
            testimonies={scopedTestimonies.filter((row) =>
              matchesYearFilter(testimonyYear(row), yearFilter),
            )}
            visible={showTestimonies}
            yearFilter={yearFilter}
          />
        </div>

        {availableYears.length > 0 ? (
          <PublicationsYearFilter
            years={availableYears}
            value={yearFilter}
            onChange={setYearFilter}
          />
        ) : null}
      </div>

      <PublicationDrawer
        publication={activePublication}
        categories={categories}
        onClose={() => setActivePublication(null)}
      />

      <PublicationLockModal
        publication={lockedPub}
        onUnlock={() => lockedPub && handleLockUnlock(lockedPub)}
        onClose={() => setLockedPub(null)}
      />
    </>
  );
}

function FeaturedContent({ cat, pub }: { cat: PublicationCategoryRow; pub: PublicationRow }) {
  const isLocked = Boolean((pub as any).is_locked);
  return (
    <>
      <div className="pub-feat-badge">
        <i className="fa-solid fa-star" aria-hidden /> Featured
      </div>
      <div className="pub-feat-img">
        {pub.cover_image_url.trim() ? (
          <MediaFigure
            src={encodePublicationAssetUrl(pub.cover_image_url)}
            alt={pub.cover_image_alt || pub.title}
            hideCaption
            figureClassName="pub-feat-figure"
          />
        ) : null}
        {isLocked ? (
          <div className="pub-card-lock-badge" style={{ top: '0.5rem', right: '0.5rem' }}>
            <i className="fa-solid fa-lock" aria-hidden />
          </div>
        ) : null}
      </div>
      <div className="pub-feat-body">
        <div className="pub-feat-tag">
          {cat.icon ? <i className={cat.icon} aria-hidden /> : null}
          {cat.label}
        </div>
        <h2 className="pub-feat-title" id="pub-strategic-heading">
          {pub.title}
        </h2>
        <p className="pub-feat-desc">{pub.excerpt}</p>
        <div className="pub-feat-meta">
          {pub.published_at ? (
            <div className="pub-feat-meta-item">
              <i className="fa-solid fa-calendar-days" aria-hidden />
              {formatHeroDate(pub.published_at)}
            </div>
          ) : null}
          {publicationHasPdf(pub) ? (
            <div className="pub-feat-meta-item">
              <i className="fa-solid fa-file-pdf" aria-hidden />
              PDF document
            </div>
          ) : null}
          {pub.meta_line.trim() ? (
            <div className="pub-feat-meta-item">
              <i className="fa-solid fa-globe" aria-hidden />
              {pub.meta_line}
            </div>
          ) : null}
        </div>
        <div className="pub-feat-actions">
          {publicationHasPdf(pub) ? (
            <span className="pub-btn-download">
              <i className="fa-solid fa-download" aria-hidden />
              Download PDF
            </span>
          ) : (
            <span className="pub-btn-preview">
              <i className="fa-solid fa-eye" aria-hidden />
              Open
            </span>
          )}
        </div>
      </div>
    </>
  );
}

function CategorySection({
  cat,
  items,
  anchor,
  visible,
  yearFilter,
  onOpenDrawer,
  onLockedClick,
}: {
  cat: PublicationCategoryRow;
  items: PublicationRow[];
  anchor: string;
  visible: boolean;
  yearFilter: number | "all";
  onOpenDrawer: (row: PublicationRow) => void;
  onLockedClick: (row: PublicationRow) => void;
}) {
  const headingId = `pub-${cat.slug}-heading`;
  const gridClass = gridClassForKind(cat.kind, cat.slug);
  const filteredItems = items.filter((row) =>
    matchesYearFilter(publicationYear(row), yearFilter),
  );

  if (!visible) {
    return (
      <section
        className="pub-section pub-section--hidden"
        id={anchor}
        aria-labelledby={headingId}
      />
    );
  }

  if (yearFilter !== "all" && filteredItems.length === 0) {
    return null;
  }

  return (
    <section
      className="pub-section"
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
            {yearFilter !== "all" ? `${cat.label} · ${yearFilter}` : cat.label}
          </h2>
        </div>
      </div>
      {filteredItems.length > 0 ? (
        <div className={gridClass}>
          {filteredItems.map((p) => (
            <CategoryCard key={p.id} cat={cat} row={p} onOpenDrawer={onOpenDrawer} onLockedClick={onLockedClick} />
          ))}
        </div>
      ) : (
        <div className="pub-empty-state">
          <div className="pub-empty-state-icon">
            <i className={cat.icon || "fa-solid fa-file"} aria-hidden />
          </div>
          <p className="pub-empty-state-title">No {cat.plural_label?.toLowerCase() || cat.label?.toLowerCase() || "items"} yet</p>
          <p className="pub-empty-state-text">Check back later for updates.</p>
        </div>
      )}
    </section>
  );
}

/* ── Unified card design matching the success story / news card pattern from the programs page ── */
function CategoryCard({ cat, row, onOpenDrawer, onLockedClick }: { cat: PublicationCategoryRow; row: PublicationRow; onOpenDrawer: (row: PublicationRow) => void; onLockedClick: (row: PublicationRow) => void }) {
  const hasPdf = publicationHasPdf(row);
  const imageUrl = row.cover_image_url.trim()
    ? encodePublicationAssetUrl(row.cover_image_url)
    : null;
  const isPdfKind = cat.slug === "annual_report" || cat.slug === "newsletter" || cat.kind === "pdf" || cat.kind === "file";

  /* 1. Determine meta line (date / period / tag) */
  const metaLine = row.period_label?.trim()
    ? row.period_label
    : row.tag_label?.trim()
      ? row.tag_label
      : row.published_at
        ? formatHeroDate(row.published_at)
        : null;

  /* 2. Build action text */
  const actionIcon = hasPdf ? "fa-download" : "fa-arrow-right";
  const actionText = hasPdf
    ? cat.kind === "file"
      ? "Download file"
      : "Download PDF"
    : "Read more";

  /* 3. Card content (image + body, same structure for all types) */
  const cardContent = (
    <>
      {/* Image */}
      <div className="pub-card-image-wrap">
        {imageUrl ? (
          <MediaFigure
            src={imageUrl}
            alt={row.cover_image_alt || row.title}
            hideCaption
            figureClassName="pub-card-figure"
            imgClassName="pub-card-image"
          />
        ) : (
          <div className="pub-card-image pub-card-image-placeholder" />
        )}
        {(row as any).is_locked ? (
          <div className="pub-card-lock-badge">
            <i className="fa-solid fa-lock" aria-hidden />
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div className="pub-card-body">
        {metaLine ? (
          <span className="pub-card-meta">{metaLine}</span>
        ) : null}

        <h4 className="pub-card-title">{row.title}</h4>

        {row.excerpt?.trim() ? (
          <p className="pub-card-desc">{row.excerpt}</p>
        ) : null}

        <span className="pub-card-action">
          <i className={`fa-solid ${actionIcon}`} aria-hidden /> {actionText}
        </span>
      </div>
    </>
  );

  /* 4. Check if locked — locked pubs always go to detail page */
  const isLocked = Boolean((row as any).is_locked);

  /* 5. Wrap in <a> for PDF/external, <div> for drawer, <Link> for locked */
  if (isLocked) {
    return (
      <div
        className="pub-card"
        role="button"
        tabIndex={0}
        onClick={() => onLockedClick(row)}
        onKeyDown={(e) => e.key === "Enter" && onLockedClick(row)}
      >
        {cardContent}
      </div>
    );
  }

  if (hasPdf) {
    return (
      <a
        href={publicationPrimaryHref(row)}
        target="_blank"
        rel="noopener noreferrer"
        className="pub-card"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div
      className="pub-card"
      role="button"
      tabIndex={0}
      onClick={() => onOpenDrawer(row)}
      onKeyDown={(e) => e.key === "Enter" && onOpenDrawer(row)}
    >
      {cardContent}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Publication Drawer                                                   */
/* ------------------------------------------------------------------ */
function PublicationDrawer({
  publication,
  categories,
  onClose,
}: {
  publication: PublicationRow | null;
  categories: PublicationCategoryRow[];
  onClose: () => void;
}) {
  const isOpen = Boolean(publication);
  const cat = publication ? categories.find(c => c.slug === publication.category) : null;
  const tagLabel = cat?.label || publication?.tag_label || "Publication";
  
  const hasExternal = Boolean(publication?.external_url?.trim());
  const hasBody = Boolean((publication as any)?.body?.trim());

  return (
    <>
      {/* Backdrop */}
      <div
        className={`pub-drawer-backdrop${isOpen ? " open" : ""}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <aside
        className={`pub-drawer-panel${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={publication?.title || "Publication details"}
      >
        {publication && (
          <>
            <ViewTracker pageType="publication" pageId={publication.id} />
            {/* Close button */}
            <button className="pub-drawer-close" type="button" onClick={onClose} aria-label="Close">
              <i className="fa-solid fa-xmark" aria-hidden />
            </button>

            {/* Hero image */}
            {publication.cover_image_url?.trim() ? (
              <div className="pub-drawer-hero">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodePublicationAssetUrl(publication.cover_image_url)}
                  alt={publication.cover_image_alt || publication.title}
                />
              </div>
            ) : (
              <div className="pub-drawer-hero-placeholder" />
            )}

            {/* Content */}
            <div className="pub-drawer-content">
              {/* Top: category pill + date */}
              <div className="pub-drawer-meta">
                <span className="pub-drawer-cat">
                  {cat?.icon ? <i className={cat.icon} aria-hidden /> : null}{" "}
                  {tagLabel}
                </span>
                {(publication.period_label || publication.published_at) && (
                  <span className="pub-drawer-date">
                    <i className="fa-regular fa-calendar" aria-hidden />
                    {publication.period_label || formatHeroDate(publication.published_at)}
                  </span>
                )}
              </div>

              <h2 className="pub-drawer-title">{publication.title}</h2>
              {publication.excerpt ? (
                <p className="pub-drawer-excerpt">{publication.excerpt}</p>
              ) : null}

              <div className="pub-drawer-divider" />

              {/* Action buttons: External */}
              {hasExternal && (
                <div className="pub-drawer-actions">
                  <a
                    href={publication.external_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pub-drawer-btn"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden />
                    Read Full Article
                  </a>
                </div>
              )}

              {/* Written body */}
              {hasBody ? (
                <div
                  className="pub-drawer-body"
                  dangerouslySetInnerHTML={{ __html: (publication as any).body! }}
                />
              ) : !hasExternal ? (
                <p className="pub-drawer-no-body">
                  Full content is not available here. Check back later.
                </p>
              ) : null}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function PublicationsYearFilter({
  years,
  value,
  onChange,
}: {
  years: number[];
  value: number | "all";
  onChange: (year: number | "all") => void;
}) {
  return (
    <aside className="pub-year-filter" aria-label="Filter publications by year">
      <span className="pub-year-filter-label">Year</span>
      <button
        type="button"
        className={`pub-year-filter-btn${value === "all" ? " is-active" : ""}`}
        onClick={() => onChange("all")}
        aria-pressed={value === "all"}
      >
        All
      </button>
      {years.map((year) => (
        <button
          key={year}
          type="button"
          className={`pub-year-filter-btn${value === year ? " is-active" : ""}`}
          onClick={() => onChange(year)}
          aria-pressed={value === year}
        >
          {year}
        </button>
      ))}
    </aside>
  );
}
