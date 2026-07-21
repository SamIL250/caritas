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
};

export function TestimoniesSection({ testimonies, visible }: Props) {
  return (
    <section
      className={`pub-section testimony-section${visible ? "" : " pub-section--hidden"}`}
      id={TESTIMONIES_SECTION_ANCHOR}
      aria-labelledby="pub-testimonies-heading"
    >
      <div className="testimony-section-head">
        <h2 className="testimony-section-title" id="pub-testimonies-heading">
          Some of Our Testimonials
        </h2>
      </div>

      {testimonies.length > 0 ? (
        <div className="testimony-card-grid">
          {testimonies.map((row) => (
            <TestimonyCard key={row.id} row={row} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <i className="fa-solid fa-user" aria-hidden />
          </div>
          <p className="text-sm font-semibold text-stone-600">No testimonies yet</p>
          <p className="mt-1 text-xs text-stone-400">Check back later for inspiring stories.</p>
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
