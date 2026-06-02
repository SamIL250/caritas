"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  encodeProgramAssetUrl,
  formatProgramDate,
  type ProgramCategoryRow,
  type ProgramRow,
} from "@/lib/programs";
import {
  encodePublicationAssetUrl,
  publicationHasPdf,
  type PublicationRow,
} from "@/lib/publications";

type Props = {
  programs: ProgramRow[];
  categories: ProgramCategoryRow[];
  successStories: PublicationRow[];
};

function pillarSlugFromHash(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#/, "").trim();
}

export default function ProgramsLibrary({ programs, categories, successStories }: Props) {
  const [filter, setFilter] = useState<string>(categories[0]?.slug || "");
  const [activeProgram, setActiveProgram] = useState<(ProgramRow & any) | null>(null);
  const [activeStory, setActiveStory] = useState<PublicationRow | null>(null);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label),
      ),
    [categories],
  );

  useEffect(() => {
    function syncFilterFromHash() {
      const raw = pillarSlugFromHash();
      if (!raw) return;
      const match = sortedCategories.some((c) => c.slug === raw);
      if (match) setFilter(raw);
    }
    syncFilterFromHash();
    window.addEventListener("hashchange", syncFilterFromHash);
    return () => window.removeEventListener("hashchange", syncFilterFromHash);
  }, [sortedCategories]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    programs.forEach((p) => {
      m[p.category] = (m[p.category] ?? 0) + 1;
    });
    return m;
  }, [programs]);

  // Close drawers on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (activeStory) setActiveStory(null);
        else setActiveProgram(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeStory]);

  // Lock body scroll when any drawer is open
  useEffect(() => {
    document.body.style.overflow = (activeProgram || activeStory) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeProgram, activeStory]);

  return (
    <>
      {/* Filter bar */}
      <div className="prog-filter-bar">
        <div className="prog-filter-inner">
          {sortedCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`prog-filter-btn${filter === c.slug ? " active" : ""}`}
              onClick={() => setFilter(c.slug)}
              aria-pressed={filter === c.slug}
            >
              {c.icon ? <i className={c.icon} aria-hidden /> : null}
              {c.plural_label || c.label}
              <span className="prog-filter-count">{counts[c.slug] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="pdf-main">
        {sortedCategories.map((cat) => {
          if (filter !== cat.slug) return null;

          const items = programs.filter((p) => p.category === cat.slug);
          if (!items.length) {
            return (
              <div key={cat.id} className="prog-empty">
                Programs are coming soon for this pillar.
              </div>
            );
          }

          const featuredProg = items.find((p) => p.featured) || items[0];
          const remainingItems = items.filter((p) => p.id !== featuredProg.id);

          return (
            <div
              key={cat.id}
              className="pdf-section"
              style={{ "--cat-accent": cat.accent || "#B5272D" } as React.CSSProperties}
            >
              {/* Featured Program */}
              <div
                className="pdf-featured"
                onClick={() => setActiveProgram(featuredProg)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setActiveProgram(featuredProg)}
                aria-label={`View details for ${featuredProg.title}`}
              >
                <div className="pdf-featured-img-col">
                  {featuredProg.cover_image_url?.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={encodeProgramAssetUrl(featuredProg.cover_image_url)}
                      alt={featuredProg.cover_image_alt || featuredProg.title}
                      className="pdf-featured-img"
                    />
                  ) : (
                    <div className="pdf-featured-img-placeholder" />
                  )}
                  <span className="pdf-featured-badge">Featured</span>
                </div>
                <div className="pdf-featured-body">
                  <p className="pdf-featured-eyebrow">
                    {cat.icon ? <i className={cat.icon} aria-hidden /> : null}
                    {cat.label}
                  </p>
                  <h2 className="pdf-featured-title">{featuredProg.title}</h2>
                  {(featuredProg as any).subtitle ? (
                    <p className="pdf-featured-subtitle">&ldquo;{(featuredProg as any).subtitle}&rdquo;</p>
                  ) : null}
                  <div className="pdf-featured-divider" />
                  {featuredProg.excerpt ? (
                    <p className="pdf-featured-desc">{featuredProg.excerpt}</p>
                  ) : null}
                  <div className="pdf-featured-meta">
                    {(featuredProg as any).location ? (
                      <span className="pdf-featured-meta-item">
                        <i className="fa-solid fa-location-dot" aria-hidden />
                        {(featuredProg as any).location}
                      </span>
                    ) : null}
                    {(featuredProg as any).contact_phone ? (
                      <span className="pdf-featured-meta-item">
                        <i className="fa-solid fa-phone" aria-hidden />
                        {(featuredProg as any).contact_phone}
                      </span>
                    ) : null}
                  </div>
                  <button className="pdf-featured-cta" type="button">
                    View Program Details
                    <i className="fa-solid fa-arrow-right" aria-hidden />
                  </button>
                </div>
              </div>

              {/* Program Cards Grid */}
              {remainingItems.length > 0 && (
                <div className="pdf-grid">
                  {remainingItems.map((p) => (
                    <ProgramCard
                      key={p.id}
                      row={p}
                      onClick={() => setActiveProgram(p)}
                    />
                  ))}
                </div>
              )}

              {/* Success Stories */}
              <SuccessStoriesSection
                catId={cat.id}
                successStories={successStories}
                onStoryClick={setActiveStory}
              />
            </div>
          );
        })}
      </main>

      {/* Program Slide-in Drawer */}
      <ProgramDrawer
        program={activeProgram}
        categories={categories}
        onClose={() => setActiveProgram(null)}
      />

      {/* Success Story Slide-in Drawer */}
      <SuccessStoryDrawer
        story={activeStory}
        onClose={() => setActiveStory(null)}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Program Card                                                         */
/* ------------------------------------------------------------------ */
function ProgramCard({ row, onClick }: { row: any; onClick: () => void }) {
  const imageUrl = row.cover_image_url?.trim()
    ? encodeProgramAssetUrl(row.cover_image_url)
    : null;

  return (
    <div
      className="pdf-card-wrapper"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`View details for ${row.title}`}
    >
      <div className="pdf-card-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl || "https://placehold.co/130x95/f1f0ef/aaa?text=Image"}
          alt={row.cover_image_alt || row.title}
          className="pdf-card-img-float"
        />

        <div className="pdf-card-top-content">
          <h3 className="pdf-card-title">{row.title}</h3>
          {row.subtitle ? (
            <p className="pdf-card-subtitle">&ldquo;{row.subtitle}&rdquo;</p>
          ) : null}
          <div className="pdf-card-divider" />
        </div>

        <div className="pdf-card-body">
          {row.excerpt ? <p className="pdf-card-desc">{row.excerpt}</p> : null}
        </div>

        <div className="pdf-card-chips">
          <div className="pdf-chip pdf-chip-location">
            <i className="fa-solid fa-location-dot pdf-chip-icon" aria-hidden />
            <span>{row.location || "District TBD"}</span>
          </div>
          <div className="pdf-chip pdf-chip-contact">
            <div className="pdf-chip-contact-inner">
              <span className="pdf-contact-phone">{row.contact_phone || "+250 078X XXX XXX"}</span>
              <span className="pdf-contact-sub">Reach out project manager</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slide-in Drawer                                                      */
/* ------------------------------------------------------------------ */
function ProgramDrawer({
  program,
  categories,
  onClose,
}: {
  program: (ProgramRow & any) | null;
  categories: ProgramCategoryRow[];
  onClose: () => void;
}) {
  const cat = categories.find((c) => program && c.slug === program.category) ?? null;
  const isOpen = Boolean(program);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop${isOpen ? " open" : ""}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <aside
        className={`drawer-panel${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={program?.title || "Program details"}
      >
        {program && (
          <>
            {/* Close button */}
            <button className="drawer-close" type="button" onClick={onClose} aria-label="Close">
              <i className="fa-solid fa-xmark" aria-hidden />
            </button>

            {/* Hero image */}
            {program.cover_image_url?.trim() ? (
              <div className="drawer-hero-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodeProgramAssetUrl(program.cover_image_url)}
                  alt={program.cover_image_alt || program.title}
                />
              </div>
            ) : (
              <div className="drawer-hero-placeholder" />
            )}

            {/* Content */}
            <div className="drawer-content">
              {/* Top: category pill + title + subtitle */}
              <div className="drawer-content-top">
                <div>
                  {cat ? (
                    <span className="drawer-category-pill">
                      {cat.icon ? <i className={cat.icon} aria-hidden /> : null}
                      {cat.label}
                    </span>
                  ) : null}
                  <h2 className="drawer-title">{program.title}</h2>
                  {program.subtitle ? (
                    <p className="drawer-subtitle">&ldquo;{program.subtitle}&rdquo;</p>
                  ) : null}
                </div>
                {/* Quick contact badge */}
                {program.contact_phone ? (
                  <a
                    href={`tel:${program.contact_phone.replace(/\s/g, "")}`}
                    className="drawer-quick-contact"
                  >
                    <i className="fa-solid fa-phone" aria-hidden />
                    {program.contact_phone}
                  </a>
                ) : null}
              </div>

              <div className="drawer-divider" />

              {/* Summary */}
              {program.excerpt ? (
                <p className="drawer-desc">{program.excerpt}</p>
              ) : null}

              {/* Key details — 2-column grid */}
              <div className="drawer-info-section">
                <h4 className="drawer-info-heading">Program Details</h4>
                <div className="drawer-info-grid-2col">
                  {program.location ? (
                    <div className="drawer-info-item">
                      <div className="drawer-info-icon">
                        <i className="fa-solid fa-location-dot" aria-hidden />
                      </div>
                      <div>
                        <span className="drawer-info-label">Location</span>
                        <span className="drawer-info-value">{program.location}</span>
                      </div>
                    </div>
                  ) : null}

                  {program.contact_phone ? (
                    <div className="drawer-info-item">
                      <div className="drawer-info-icon">
                        <i className="fa-solid fa-phone" aria-hidden />
                      </div>
                      <div>
                        <span className="drawer-info-label">Contact</span>
                        <a
                          href={`tel:${program.contact_phone.replace(/\s/g, "")}`}
                          className="drawer-info-value drawer-info-link"
                        >
                          {program.contact_phone}
                        </a>
                      </div>
                    </div>
                  ) : null}

                  {program.tag_label ? (
                    <div className="drawer-info-item">
                      <div className="drawer-info-icon">
                        <i className={program.tag_icon || "fa-solid fa-tag"} aria-hidden />
                      </div>
                      <div>
                        <span className="drawer-info-label">Program Type</span>
                        <span className="drawer-info-value">{program.tag_label}</span>
                      </div>
                    </div>
                  ) : null}

                  {program.published_at ? (
                    <div className="drawer-info-item">
                      <div className="drawer-info-icon">
                        <i className="fa-solid fa-calendar-days" aria-hidden />
                      </div>
                      <div>
                        <span className="drawer-info-label">Since</span>
                        <span className="drawer-info-value">{formatProgramDate(program.published_at)}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Full body (rich text) */}
              {program.body ? (
                <div className="drawer-body-section">
                  <h4 className="drawer-info-heading">About this Program</h4>
                  <div
                    className="drawer-body-html"
                    dangerouslySetInnerHTML={{ __html: program.body }}
                  />
                </div>
              ) : null}

              {/* External link */}
              {program.external_url?.trim() ? (
                <div className="drawer-ext-link">
                  <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden />
                  <div>
                    <span className="drawer-info-label">Learn more</span>
                    <a
                      href={program.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="drawer-info-link"
                    >
                      Visit program page
                    </a>
                  </div>
                </div>
              ) : null}

              {/* CTA */}
              <div className="drawer-cta-block">
                <p className="drawer-cta-text">
                  For more information, reach out to the project manager.
                </p>
                {program.contact_phone ? (
                  <a
                    href={`tel:${program.contact_phone.replace(/\s/g, "")}`}
                    className="drawer-cta-btn"
                  >
                    <i className="fa-solid fa-phone" aria-hidden />
                    {program.contact_phone}
                  </a>
                ) : null}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Success Stories Section                                              */
/* ------------------------------------------------------------------ */
function SuccessStoriesSection({
  catId,
  successStories,
  onStoryClick,
}: {
  catId: string;
  successStories: PublicationRow[];
  onStoryClick: (story: PublicationRow) => void;
}) {
  const stories = successStories.filter((s) => s.department_id === catId);
  if (stories.length === 0) return null;

  return (
    <div className="pdf-success-section">
      <h3 className="pdf-success-heading">
        <i className="fa-solid fa-star" aria-hidden /> Success Stories
      </h3>
      <div className="pdf-success-grid">
        {stories.map((story) => (
          <div
            key={story.id}
            role="button"
            tabIndex={0}
            className="pdf-success-card"
            onClick={() => onStoryClick(story)}
            onKeyDown={(e) => e.key === "Enter" && onStoryClick(story)}
            aria-label={`Read story: ${story.title}`}
          >
            <div className="pdf-success-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.cover_image_url ? encodePublicationAssetUrl(story.cover_image_url) : "https://placehold.co/400x300/f1f0ef/aaa?text=Story"}
                alt={story.cover_image_alt || story.title}
              />
            </div>
            <div className="pdf-success-body">
              {publicationHasPdf(story) ? (
                <span className="pdf-success-badge">
                  <i className="fa-solid fa-file-pdf" aria-hidden /> PDF
                </span>
              ) : story.external_url?.trim() ? (
                <span className="pdf-success-badge pdf-success-badge--ext">
                  <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden /> External
                </span>
              ) : null}
              <h4 className="pdf-success-title">{story.title}</h4>
              {story.excerpt ? <p className="pdf-success-desc">{story.excerpt}</p> : null}
              <span className="pdf-success-read">
                Read Story <i className="fa-solid fa-arrow-right" aria-hidden />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Success Story Drawer                                                 */
/* ------------------------------------------------------------------ */
function SuccessStoryDrawer({
  story,
  onClose,
}: {
  story: PublicationRow | null;
  onClose: () => void;
}) {
  const isOpen = Boolean(story);
  const hasPdf = story ? publicationHasPdf(story) : false;
  const hasExternal = Boolean(story?.external_url?.trim());
  const hasBody = Boolean(story?.body?.trim());

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop${isOpen ? " open" : ""}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <aside
        className={`drawer-panel${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={story?.title || "Success story"}
      >
        {story && (
          <>
            {/* Close button */}
            <button className="drawer-close" type="button" onClick={onClose} aria-label="Close">
              <i className="fa-solid fa-xmark" aria-hidden />
            </button>

            {/* Hero image */}
            {story.cover_image_url?.trim() ? (
              <div className="drawer-hero-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodePublicationAssetUrl(story.cover_image_url)}
                  alt={story.cover_image_alt || story.title}
                />
              </div>
            ) : (
              <div className="drawer-hero-placeholder" />
            )}

            {/* Content */}
            <div className="drawer-content">
              <div className="drawer-content-top">
                <div>
                  <span className="drawer-category-pill">
                    <i className="fa-solid fa-star" aria-hidden /> Success Story
                  </span>
                  <h2 className="drawer-title">{story.title}</h2>
                  {story.excerpt ? (
                    <p className="drawer-subtitle">{story.excerpt}</p>
                  ) : null}
                </div>
              </div>

              <div className="drawer-divider" />

              {/* Action buttons: PDF / External / Article */}
              <div className="story-drawer-actions">
                {hasPdf && (
                  <a
                    href={encodePublicationAssetUrl(story.file_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="story-drawer-btn story-drawer-btn--pdf"
                  >
                    <i className="fa-solid fa-file-pdf" aria-hidden />
                    Open PDF
                  </a>
                )}
                {hasExternal && (
                  <a
                    href={story.external_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="story-drawer-btn story-drawer-btn--ext"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden />
                    Read Full Article
                  </a>
                )}
              </div>

              {/* Written body */}
              {hasBody ? (
                <div className="drawer-body-section">
                  <h4 className="drawer-info-heading">Story</h4>
                  <div
                    className="drawer-body-html"
                    dangerouslySetInnerHTML={{ __html: story.body! }}
                  />
                </div>
              ) : !hasPdf && !hasExternal ? (
                <p className="drawer-desc" style={{ color: "#9ca3af", fontStyle: "italic" }}>
                  Full story content coming soon.
                </p>
              ) : null}

              {/* Meta */}
              {(story.meta_line || story.period_label) ? (
                <div className="drawer-info-section">
                  <div className="drawer-info-grid-2col">
                    {story.meta_line ? (
                      <div className="drawer-info-item">
                        <div className="drawer-info-icon">
                          <i className="fa-solid fa-circle-info" aria-hidden />
                        </div>
                        <div>
                          <span className="drawer-info-label">Details</span>
                          <span className="drawer-info-value">{story.meta_line}</span>
                        </div>
                      </div>
                    ) : null}
                    {story.period_label ? (
                      <div className="drawer-info-item">
                        <div className="drawer-info-icon">
                          <i className="fa-solid fa-calendar" aria-hidden />
                        </div>
                        <div>
                          <span className="drawer-info-label">Period</span>
                          <span className="drawer-info-value">{story.period_label}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </aside>
    </>
  );
}


