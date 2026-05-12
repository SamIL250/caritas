import React from "react";

const DEFAULTS = {
  eyebrow: "Find Us",
  heading: "Our Location on",
  heading_accent: "G-Map",
  subtext:
    "Visit us at the Caritas Rwanda offices in Kigali — we'd love to welcome you.",
  map_a_title: "Street View",
  map_a_subtitle: "Explore our surroundings in 360°",
  map_a_embed_url:
    "https://www.google.com/maps/embed?pb=!4v1776831990082!6m8!1m7!1shQopyAPx9qTD4VQMaDmVfg!2m2!1d-1.948423749421037!2d30.05942523532954!3f245.44809355904687!4f1.5795459231316045!5f0.7820865974627469",
  map_b_title: "Caritas Rwanda HQ",
  map_b_subtitle: "Kigali, Rwanda — get directions",
  map_b_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5112492331314!2d30.05660827473925!3d-1.9485541980337648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425b5be2a55%3A0xcc6cf890e6ae864!2sCaritas%20Rwanda!5e0!3m2!1sen!2srw!4v1776832048548!5m2!1sen!2srw"
};

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
};

export default function OurLocationSection(props: OurLocationSectionProps) {
  const c = { ...DEFAULTS, ...props };
  const aUrl = (c.map_a_embed_url || DEFAULTS.map_a_embed_url).trim();
  const bUrl = (c.map_b_embed_url || DEFAULTS.map_b_embed_url).trim();

  return (
    <section className="map-section" id="our-location" aria-labelledby="our-location-title">
      <div className="map-section-header">
        <div className="map-eyebrow">
          <i className="fa-solid fa-location-dot" aria-hidden />
          {c.eyebrow}
        </div>
        <h2 id="our-location-title">
          {c.heading} <span>{c.heading_accent}</span>
        </h2>
        <p>{c.subtext}</p>
      </div>

      <div className="map-grid">
        <div className="map-card">
          <div className="map-card-header">
            <div className="map-card-icon" aria-hidden>
              <i className="fa-solid fa-street-view" />
            </div>
            <div className="map-card-label">
              <h3>{c.map_a_title}</h3>
              <p>{c.map_a_subtitle}</p>
            </div>
          </div>
          {aUrl ? (
            <iframe
              src={aUrl}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Caritas Rwanda Street View"
            />
          ) : null}
        </div>

        <div className="map-card">
          <div className="map-card-header">
            <div className="map-card-icon" aria-hidden>
              <i className="fa-solid fa-map-pin" />
            </div>
            <div className="map-card-label">
              <h3>{c.map_b_title}</h3>
              <p>{c.map_b_subtitle}</p>
            </div>
          </div>
          {bUrl ? (
            <iframe
              src={bUrl}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Caritas Rwanda HQ Location"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
