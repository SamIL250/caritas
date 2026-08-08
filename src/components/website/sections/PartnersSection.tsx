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

function PartnerCard({
  partner,
  className,
}: {
  partner: Partner;
  className?: string;
}) {
  const url = (partner.url || "").trim();
  const img = (
    <img
      className="cr-partners__logo"
      src={partner.logo_url}
      alt={partner.name}
      loading="lazy"
    />
  );
  const label = <span className="cr-partners__name">{partner.name}</span>;
  const cardClass = `cr-partners__card${className ? ` ${className}` : ""}`;

  if (url) {
    const external = /^https?:\/\//i.test(url);
    return (
      <a
        href={url}
        className={cardClass}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {img}
        {label}
      </a>
    );
  }

  return (
    <div className={cardClass}>
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

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  const scrollStep = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 200;
    const card = track.querySelector<HTMLElement>(".cr-partners__card");
    return (card?.offsetWidth ?? 180) + 14;
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
    setTimeout(() => {
      pausedRef.current = false;
    }, 3000);
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
    setTimeout(() => {
      pausedRef.current = false;
    }, 3000);
  }, [scrollStep]);

  return (
    <>
      <section
        className="cr-partners partners-section"
        id="partners"
        aria-labelledby="partners-section-title"
      >
        <div className="cr-partners__inner partners-inner">
          <header className="cr-partners__header partners-header">
            {eyebrow ? (
              <p className="cr-partners__eyebrow partners-eyebrow">
                <i className="fa-solid fa-handshake" aria-hidden />
                {eyebrow}
              </p>
            ) : null}
            <h2 className="cr-partners__title partners-title" id="partners-section-title">
              {title}
            </h2>
            {subtitle ? (
              <p className="cr-partners__subtitle partners-subtitle">{subtitle}</p>
            ) : null}
          </header>

          <div className="cr-partners__shell">
            <div className="cr-partners__frame">
              <div className="cr-partners__slider partners-slider-wrap">
                <button
                  type="button"
                  className="cr-partners__arrow partner-arrow"
                  onClick={scrollPrev}
                  aria-label="Previous partners"
                >
                  <ChevronLeft size={18} strokeWidth={2.5} aria-hidden />
                </button>

                <div
                  className="cr-partners__viewport partners-grid"
                  onMouseEnter={() => {
                    pausedRef.current = true;
                  }}
                  onMouseLeave={() => {
                    pausedRef.current = false;
                  }}
                >
                  <div ref={trackRef} className="cr-partners__track partners-track">
                    {[...list, ...list].map((p, i) => (
                      <PartnerCard key={`${p.name}-${i}`} partner={p} />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="cr-partners__arrow partner-arrow"
                  onClick={scrollNext}
                  aria-label="Next partners"
                >
                  <ChevronRight size={18} strokeWidth={2.5} aria-hidden />
                </button>
              </div>

              <div className="cr-partners__footer partners-footer">
                <button
                  type="button"
                  className="cr-partners__view-all partners-view-all-btn"
                  onClick={() => setModalOpen(true)}
                >
                  <i className="fa-solid fa-grip" aria-hidden />
                  View All Partners
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className={`cr-partners__overlay partners-modal-overlay${modalOpen ? " cr-partners__overlay--open is-open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalOpen(false);
        }}
        role="dialog"
        aria-modal="true"
        aria-label="All Partners"
        aria-hidden={!modalOpen}
      >
        <div className="cr-partners__modal partners-modal">
          <div className="cr-partners__modal-header partners-modal-header">
            <h3 className="cr-partners__modal-title">
              All Our <span className="cr-partners__modal-title-accent">Partners</span>
            </h3>
            <button
              type="button"
              className="cr-partners__modal-close partners-modal-close"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" aria-hidden />
            </button>
          </div>
          <div className="cr-partners__modal-grid partners-modal-grid">
            {list.map((p, i) => (
              <PartnerCard key={`modal-${p.name}-${i}`} partner={p} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
