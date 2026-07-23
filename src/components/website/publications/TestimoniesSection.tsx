"use client";

import Link from "next/link";
import {
  encodeTestimonyAssetUrl,
  TESTIMONIES_SECTION_ANCHOR,
  testimonyDetailHref,
  type TestimonyRow,
} from "@/lib/testimonies";
import { MediaFigure } from "@/components/website/MediaCaptionProvider";

type Props = {
  testimonies: TestimonyRow[];
  visible: boolean;
  yearFilter?: number | "all";
};

export function TestimoniesSection({ testimonies, visible, yearFilter = "all" }: Props) {
  if (!visible) {
    return (
      <section
        className="pub-section testimony-section pub-section--hidden"
        id={TESTIMONIES_SECTION_ANCHOR}
        aria-labelledby="pub-testimonies-heading"
      />
    );
  }

  if (yearFilter !== "all" && testimonies.length === 0) {
    return null;
  }

  return (
    <section
      className="pub-section testimony-section"
      id={TESTIMONIES_SECTION_ANCHOR}
      aria-labelledby="pub-testimonies-heading"
    >
      <div className="testimony-section-head">
        <h2 className="testimony-section-title" id="pub-testimonies-heading">
          {yearFilter !== "all" ? `Testimonials · ${yearFilter}` : "Some of Our Testimonials"}
        </h2>
      </div>

      {testimonies.length > 0 ? (
        <div className="testimony-card-grid">
          {testimonies.map((row) => (
            <TestimonyCard key={row.id} row={row} />
          ))}
        </div>
      ) : (
        <div className="pub-empty-state">
          <div className="pub-empty-state-icon">
            <i className="fa-solid fa-user" aria-hidden />
          </div>
          <p className="pub-empty-state-title">No testimonies yet</p>
          <p className="pub-empty-state-text">Check back later for inspiring stories.</p>
        </div>
      )}
    </section>
  );
}

function TestimonyCard({ row }: { row: TestimonyRow }) {
  const imageUrl = row.cover_image_url.trim()
    ? encodeTestimonyAssetUrl(row.cover_image_url)
    : null;
  const href = testimonyDetailHref(row);

  return (
    <article className="testimony-card">
      <Link href={href} className="testimony-card-link">
        <div className="testimony-card-image-wrap">
          {imageUrl ? (
            <MediaFigure
              src={imageUrl}
              alt={row.cover_image_alt || row.title}
              hideCaption
              figureClassName="testimony-card-figure"
              imgClassName="testimony-card-image"
            />
          ) : (
            <div className="testimony-card-image testimony-card-image-placeholder" aria-hidden />
          )}
        </div>
        <div className="testimony-card-body">
          <h3 className="testimony-card-title">{row.title}</h3>
          {row.excerpt.trim() ? <p className="testimony-card-excerpt">{row.excerpt}</p> : null}
          <span className="testimony-card-readmore">
            <span className="testimony-card-readmore-icon" aria-hidden>
              <i className="fa-solid fa-arrow-right" />
            </span>
            Read more
          </span>
        </div>
      </Link>
    </article>
  );
}
