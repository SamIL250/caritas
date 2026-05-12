"use client";

import React, { useCallback, useLayoutEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  type Partner,
  DEFAULT_PARTNERS,
  filterPartnersForDisplay,
} from "@/lib/partners-defaults";

export type { Partner } from "@/lib/partners-defaults";

export type PartnersSectionProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Partner[];
};

/**
 * Negative translate moves the strip left → logos drift right-to-left across the viewport.
 * Transform-based marquee works even when native horizontal overflow doesn’t scroll.
 */
const AUTO_SCROLL_PX_PER_SEC = 14;

/** After prev/next / wheel / keyboard nudge, pause auto drift briefly. */
const USER_PAUSE_MS = 4200;

function PartnerCard({ partner }: { partner: Partner }) {
  const url = (partner.url || "").trim();
  const img = (
    <img
      className="partner-logo"
      src={partner.logo_url}
      alt={partner.name}
      loading="lazy"
    />
  );
  const label = <span className="partner-name">{partner.name}</span>;

  if (url) {
    const external = /^https?:\/\//i.test(url);
    return (
      <a
        href={url}
        className="partner-card"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {img}
        {label}
      </a>
    );
  }

  return (
    <div className="partner-card">
      {img}
      {label}
    </div>
  );
}

export default function PartnersSection({
  eyebrow = "Collaboration",
  title = "Our Partners",
  subtitle = "Working together with trusted global and local organizations to deliver lasting impact across Rwanda.",
  items: itemsProp,
}: PartnersSectionProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  /** Horizontal offset (px). Negative = strip shifted left (motion right → left). */
  const translateRef = useRef(0);
  const hoverStripRef = useRef(false);
  const userPauseUntilRef = useRef(0);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);

  const bumpUserPause = useCallback(() => {
    userPauseUntilRef.current = performance.now() + USER_PAUSE_MS;
  }, []);

  const list = filterPartnersForDisplay(
    itemsProp && itemsProp.length > 0 ? itemsProp : DEFAULT_PARTNERS,
  );

  const loopPairs =
    list.length > 0
      ? [...list.map((p, i) => ({ p, key: `a-${p.name}-${i}` })), ...list.map((p, i) => ({ p, key: `b-${p.name}-${i}` }))]
      : [];

  const applyTransform = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    row.style.transform = `translate3d(${translateRef.current}px, 0, 0)`;
  }, []);

  const scrollStepPx = useCallback(() => {
    const row = rowRef.current;
    if (!row) return 280;
    const style = window.getComputedStyle(row);
    const gap = Number.parseFloat(style.columnGap || style.gap || "16") || 16;
    const card = row.querySelector<HTMLElement>(".partner-card");
    const cardW = card?.offsetWidth ?? 260;
    return Math.round(cardW + gap);
  }, []);

  const normalizeLoop = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const half = row.scrollWidth / 2;
    if (half < 8) return;
    while (translateRef.current <= -half + 0.5) translateRef.current += half;
    while (translateRef.current > 0.5) translateRef.current -= half;
  }, []);

  const scrollPrev = useCallback(() => {
    bumpUserPause();
    translateRef.current += scrollStepPx();
    normalizeLoop();
    applyTransform();
  }, [applyTransform, bumpUserPause, normalizeLoop, scrollStepPx]);

  const scrollNext = useCallback(() => {
    bumpUserPause();
    translateRef.current -= scrollStepPx();
    normalizeLoop();
    applyTransform();
  }, [applyTransform, bumpUserPause, normalizeLoop, scrollStepPx]);

  useLayoutEffect(() => {
    translateRef.current = 0;
    const rowEl = rowRef.current;
    if (rowEl) rowEl.style.transform = "translate3d(0, 0, 0)";

    if (list.length === 0) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const tick = (now: number) => {
      const row = rowRef.current;
      const last = lastFrameRef.current || now;
      const dt = Math.min(now - last, 80);
      lastFrameRef.current = now;

      const allowAuto =
        row &&
        !mq.matches &&
        !hoverStripRef.current &&
        performance.now() >= userPauseUntilRef.current;

      if (allowAuto) {
        translateRef.current -= (AUTO_SCROLL_PX_PER_SEC * dt) / 1000;
        const half = row.scrollWidth / 2;
        if (half > 8 && -translateRef.current >= half - 0.5) {
          translateRef.current += half;
        }
        row.style.transform = `translate3d(${translateRef.current}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    lastFrameRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [list]);

  return (
    <section
      className="partners-section"
      id="partners"
      aria-labelledby="partners-section-title"
    >
      <div className="partners-inner">
        <header className="partners-header">
          {eyebrow ? (
            <div className="partners-eyebrow">
              <i className="fa-solid fa-handshake" aria-hidden />
              {eyebrow}
            </div>
          ) : null}
          <h2 className="partners-title" id="partners-section-title">
            {title}
          </h2>
          {subtitle ? <p className="partners-subtitle">{subtitle}</p> : null}
        </header>

        <div className="partners-carousel">
          <button
            type="button"
            className="partners-carousel-btn partners-carousel-btn--prev"
            onClick={scrollPrev}
            aria-label="Previous partners"
          >
            <ChevronLeft size={22} strokeWidth={2.25} aria-hidden />
          </button>

          <div
            className="partners-marquee-mask"
            onMouseEnter={() => {
              hoverStripRef.current = true;
            }}
            onMouseLeave={() => {
              hoverStripRef.current = false;
            }}
            onWheel={(e) => {
              if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
              bumpUserPause();
              translateRef.current -= e.deltaX * 0.45;
              normalizeLoop();
              applyTransform();
            }}
          >
            <div
              ref={rowRef}
              className="partners-marquee-row"
              role="region"
              aria-roledescription="carousel"
              aria-label="Partner organizations"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  scrollPrev();
                } else if (e.key === "ArrowRight") {
                  e.preventDefault();
                  scrollNext();
                }
              }}
            >
              {loopPairs.map(({ p, key }) => (
                <PartnerCard key={key} partner={p} />
              ))}
            </div>
          </div>

          <button
            type="button"
            className="partners-carousel-btn partners-carousel-btn--next"
            onClick={scrollNext}
            aria-label="Next partners"
          >
            <ChevronRight size={22} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
