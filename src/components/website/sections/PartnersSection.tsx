"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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

function PartnerCard({ partner, className }: { partner: Partner; className?: string }) {
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
        className={`partner-card${className ? " " + className : ""}`}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {img}
        {label}
      </a>
    );
  }

  return (
    <div className={`partner-card${className ? " " + className : ""}`}>
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
  const list = filterPartnersForDisplay(
    itemsProp && itemsProp.length > 0 ? itemsProp : DEFAULT_PARTNERS,
  );

  const [modalOpen, setModalOpen] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  const SCROLL_SPEED = 0.35;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || list.length === 0) return;

    const step = () => {
      if (track && !pausedRef.current) {
        posRef.current -= SCROLL_SPEED;
        const half = track.scrollWidth / 2;
        if (Math.abs(posRef.current) >= half - 1) {
          posRef.current += half;
        }
        track.style.transform = `translateX(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [list.length]);

  const scrollStep = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 200;
    const card = track.querySelector<HTMLElement>(".partner-card");
    return (card?.offsetWidth ?? 180) + 24;
  }, []);

  const scrollPrev = useCallback(() => {
    pausedRef.current = true;
    posRef.current += scrollStep();
    const track = trackRef.current;
    if (track) {
      const half = track.scrollWidth / 2;
      if (posRef.current > 0) posRef.current -= half;
      track.style.transform = `translateX(${posRef.current}px)`;
    }
    setTimeout(() => { pausedRef.current = false; }, 3000);
  }, [scrollStep]);

  const scrollNext = useCallback(() => {
    pausedRef.current = true;
    posRef.current -= scrollStep();
    const track = trackRef.current;
    if (track) {
      const half = track.scrollWidth / 2;
      if (Math.abs(posRef.current) >= half - 1) posRef.current += half;
      track.style.transform = `translateX(${posRef.current}px)`;
    }
    setTimeout(() => { pausedRef.current = false; }, 3000);
  }, [scrollStep]);

  return (
    <>
      <section className="partners-section" id="partners" aria-labelledby="partners-section-title">
        <div className="partners-inner">
          <div className="partners-header">
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
          </div>

          <div className="partners-slider-wrap">
            <button
              type="button"
              className="partner-arrow"
              onClick={scrollPrev}
              aria-label="Previous"
            >
              <ChevronLeft size={18} strokeWidth={2.5} aria-hidden />
            </button>

            <div
              className="partners-grid"
              onMouseEnter={() => { pausedRef.current = true; }}
              onMouseLeave={() => { pausedRef.current = false; }}
            >
              <div ref={trackRef} className="partners-track">
                {[...list, ...list].map((p, i) => (
                  <PartnerCard key={`${p.name}-${i}`} partner={p} />
                ))}
              </div>
            </div>

            <button
              type="button"
              className="partner-arrow"
              onClick={scrollNext}
              aria-label="Next"
            >
              <ChevronRight size={18} strokeWidth={2.5} aria-hidden />
            </button>
          </div>

          <div className="partners-footer">
            <button
              type="button"
              className="partners-view-all-btn"
              onClick={() => setModalOpen(true)}
            >
              <i className="fa-solid fa-grip" aria-hidden />
              View All Partners
            </button>
          </div>
        </div>
      </section>

      <div
        className={`partners-modal-overlay${modalOpen ? " is-open" : ""}`}
        onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        onKeyDown={(e) => { if (e.key === "Escape") setModalOpen(false); }}
        role="dialog"
        aria-modal="true"
        aria-label="All Partners"
        tabIndex={-1}
      >
        <div className="partners-modal">
          <div className="partners-modal-header">
            <h3>All Our <span>Partners</span></h3>
            <button
              type="button"
              className="partners-modal-close"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
          <div className="partners-modal-grid">
            {list.map((p, i) => (
              <PartnerCard key={`modal-${p.name}-${i}`} partner={p} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
