import Link from "next/link";
import React from "react";

const DEFAULTS = {
  eyebrow: "Find Us",
  heading: "Our Location on",
  heading_accent: "The Map",
  subtext:
    "Visit us at the Caritas Rwanda offices in Kigali — we'd love to welcome you.",
  map_a_title: "Street View",
  map_a_subtitle: "Explore our surroundings in 360°",
  map_a_embed_url:
    "https://www.google.com/maps/embed?pb=!4v1776831990082!6m8!1m7!1shQopyAPx9qTD4VQMaDmVfg!2m2!1d-1.948423749421037!2d30.05942523532954!3f245.44809355904687!4f1.5795459231316045!5f0.7820865974627469",
  map_b_title: "Caritas Rwanda HQ",
  map_b_subtitle: "Kigali, Rwanda — get directions",
  map_b_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5112492331314!2d30.05660827473925!3d-1.9485541980337648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425b5be2a55%3A0xcc6cf890e6ae864!2sCaritas%20Rwanda!5e0!3m2!1sen!2srw!4v1776832048548!5m2!1sen!2srw",
  cta_label: "Send us a message",
  cta_url: "/contact",
};

const DEFAULT_CTA_LABEL = "Send us a message";
const DEFAULT_CTA_URL = "/contact";

export type OurLocationSectionProps = {
  eyebrow?: string;
  heading?: string;
  heading_accent?: string;
  subtext?: string;
  map_a_title?: string;
  map_a_subtitle?: string;
  map_a_embed_url?: string;
  map_b_title?: string;
  map_b_subtitle?: string;
  map_b_embed_url?: string;
  cta_label?: string;
  cta_url?: string;
  /** When true, renders the full-width CTA link below the map cards. */
  show_cta?: boolean;
};

function MapCard({
  iconClass,
  title,
  subtitle,
  embedUrl,
  iframeTitle,
}: {
  iconClass: string;
  title: string;
  subtitle: string;
  embedUrl: string;
  iframeTitle: string;
}) {
  return (
    <article className="cr-location__card map-card">
      <div className="cr-location__card-head map-card-header">
        <div className="cr-location__card-icon map-card-icon" aria-hidden>
          <i className={iconClass} />
        </div>
        <div className="cr-location__card-label map-card-label">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      {embedUrl ? (
        <iframe
          className="cr-location__embed"
          src={embedUrl}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={iframeTitle}
        />
      ) : null}
    </article>
  );
}

export default function OurLocationSection(props: OurLocationSectionProps) {
  const c = { ...DEFAULTS, ...props };
  const aUrl = (c.map_a_embed_url || DEFAULTS.map_a_embed_url).trim();
  const bUrl = (c.map_b_embed_url || DEFAULTS.map_b_embed_url).trim();
  const showCta = props.show_cta === true;
  const ctaLabel =
    (props.cta_label ?? c.cta_label ?? DEFAULT_CTA_LABEL).trim() || DEFAULT_CTA_LABEL;
  const ctaUrl =
    (props.cta_url ?? c.cta_url ?? DEFAULT_CTA_URL).trim() || DEFAULT_CTA_URL;

  return (
    <section
      className="cr-location map-section"
      id="our-location"
      aria-labelledby="our-location-title"
    >
      <div className="cr-location__inner">
        <header className="cr-location__header map-section-header">
          <p className="cr-location__eyebrow map-eyebrow">
            <i className="fa-solid fa-location-dot" aria-hidden />
            {c.eyebrow}
          </p>
          <h2 className="cr-location__title" id="our-location-title">
            {c.heading}{" "}
            <span className="cr-location__title-accent">{c.heading_accent}</span>
          </h2>
          <p className="cr-location__subtitle">{c.subtext}</p>
        </header>

        <div className="cr-location__shell">
          <div className="cr-location__frame">
            <div className="cr-location__grid map-grid">
              <MapCard
                iconClass="fa-solid fa-street-view"
                title={c.map_a_title}
                subtitle={c.map_a_subtitle}
                embedUrl={aUrl}
                iframeTitle="Caritas Rwanda Street View"
              />
              <MapCard
                iconClass="fa-solid fa-map-pin"
                title={c.map_b_title}
                subtitle={c.map_b_subtitle}
                embedUrl={bUrl}
                iframeTitle="Caritas Rwanda HQ Location"
              />
            </div>

            {showCta ? (
              <div className="cr-location__footer map-section-cta-wrap">
                <Link href={ctaUrl} className="cr-location__cta map-section-cta">
                  <i className="fa-solid fa-envelope" aria-hidden />
                  {ctaLabel}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
