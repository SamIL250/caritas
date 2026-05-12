"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  encodeProgramAssetUrl,
  formatProgramDate,
  programDetailHref,
  type ProgramCategoryRow,
  type ProgramRow,
} from "@/lib/programs";

type FilterKey = "all" | string;

type Props = {
  programs: ProgramRow[];
  categories: ProgramCategoryRow[];
};

function pillarSlugFromHash(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#/, "").trim();
}

export default function ProgramsLibrary({ programs, categories }: Props) {
  const [filter, setFilter] = useState<FilterKey>("all");

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

  const featured = useMemo(() => programs.find((p) => p.featured) ?? null, [programs]);

  const showSection = (slug: string) => filter === "all" || filter === slug;
  const totalCount = programs.length;

  return (
    <>
      <div className="prog-filter-bar">
        <div className="prog-filter-inner">
          <button
            type="button"
            className={`prog-filter-btn${filter === "all" ? " active" : ""}`}
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
          >
            <i className="fa-solid fa-layer-group" aria-hidden />
            All
            <span className="prog-filter-count">{totalCount}</span>
          </button>

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

      <main className="prog-main">
        {featured && filter === "all" ? <FeaturedCard row={featured} categories={categories} /> : null}

        {sortedCategories.map((cat) => {
          const items = programs
            .filter((p) => p.category === cat.slug)
            .filter((p) => !(featured && filter === "all" && p.id === featured.id));
          const visible = showSection(cat.slug);
          if (!visible) return null;
          if (!items.length) {
            if (filter === "all") return null;
            return (
              <section className="prog-section" id={cat.slug} key={cat.id}>
                <CategoryHead cat={cat} />
                <div className="prog-empty">
                  No programs here yet — check back soon, or explore other pillars.
                </div>
              </section>
            );
          }
          return (
            <section className="prog-section" id={cat.slug} key={cat.id}>
              <CategoryHead cat={cat} />
              <div className="prog-article-grid">
                {items.map((p) => (
                  <ProgramCard key={p.id} row={p} cat={cat} />
                ))}
              </div>
            </section>
          );
        })}

        {totalCount === 0 ? (
          <div className="prog-empty">
            Programs are coming soon. The Caritas team is preparing the first articles.
          </div>
        ) : null}
      </main>
    </>
  );
}

function CategoryHead({ cat }: { cat: ProgramCategoryRow }) {
  return (
    <div className="prog-section-head">
      <div className="prog-section-title-wrap">
        <div className="prog-section-eyebrow">
          {cat.icon ? <i className={cat.icon} aria-hidden /> : null}
          {cat.plural_label || cat.label}
        </div>
        <h2 className="prog-section-title">{cat.label}</h2>
        {cat.description ? <p className="prog-section-desc">{cat.description}</p> : null}
      </div>
    </div>
  );
}

function FeaturedCard({
  row,
  categories,
}: {
  row: ProgramRow;
  categories: ProgramCategoryRow[];
}) {
  const cat = categories.find((c) => c.id === row.category_id) ?? null;
  return (
    <Link href={programDetailHref(row)} className="prog-featured" aria-label={row.title}>
      <div className="prog-feat-img">
        {row.cover_image_url.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={encodeProgramAssetUrl(row.cover_image_url)}
            alt={row.cover_image_alt || row.title}
          />
        ) : null}
        <div className="prog-feat-badge">
          <i className="fa-solid fa-star" aria-hidden /> Featured
        </div>
      </div>
      <div className="prog-feat-body">
        <div className="prog-feat-tag">
          {cat?.icon ? <i className={cat.icon} aria-hidden /> : null}
          {cat?.label ?? "Program"}
        </div>
        <h2 className="prog-feat-title">{row.title}</h2>
        {row.excerpt ? <p className="prog-feat-desc">{row.excerpt}</p> : null}
        <div className="prog-feat-meta">
          {row.published_at ? (
            <div>
              <i className="fa-solid fa-calendar-days" aria-hidden />
              {formatProgramDate(row.published_at)}
            </div>
          ) : null}
          {row.tag_label ? (
            <div>
              <i className="fa-solid fa-tag" aria-hidden />
              {row.tag_label}
            </div>
          ) : null}
        </div>
        <div className="prog-feat-actions">
          <span>
            Read program <i className="fa-solid fa-arrow-right" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProgramCard({ row, cat }: { row: ProgramRow; cat: ProgramCategoryRow }) {
  return (
    <Link href={programDetailHref(row)} className="prog-article-card">
      <div className="prog-article-img">
        {row.cover_image_url.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={encodeProgramAssetUrl(row.cover_image_url)}
            alt={row.cover_image_alt || row.title}
          />
        ) : null}
        <div className="prog-article-tag">
          {cat.icon ? <i className={cat.icon} aria-hidden /> : null}
          {row.tag_label || cat.label}
        </div>
      </div>
      <div className="prog-article-body">
        <div className="prog-article-meta">
          <i className="fa-solid fa-calendar" aria-hidden />
          {formatProgramDate(row.published_at) || "Recently"}
        </div>
        <div className="prog-article-title">{row.title}</div>
        {row.excerpt ? <p className="prog-article-excerpt">{row.excerpt}</p> : null}
        <div className="prog-article-link">
          Read more <i className="fa-solid fa-arrow-right" aria-hidden />
        </div>
      </div>
    </Link>
  );
}
