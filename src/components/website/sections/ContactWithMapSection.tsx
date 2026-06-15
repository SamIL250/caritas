"use client";

import type { ContactInfoProps, FormFieldConfig } from "@/components/website/sections/ContactInfo";
import { ContactMessageForm } from "@/components/website/sections/ContactInfo";

const MAP_DEFAULTS = {
  map_a_embed_url:
    "https://www.google.com/maps/embed?pb=!4v1776831990082!6m8!1m7!1shQopyAPx9qTD4VQMaDmVfg!2m2!1d-1.948423749421037!2d30.05942523532954!3f245.44809355904687!4f1.5795459231316045!5f0.7820865974627469",
  map_b_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5112492331314!2d30.05660827473925!3d-1.9485541980337648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425b5be2a55%3A0xcc6cf890e6ae864!2sCaritas%20Rwanda!5e0!3m2!1en!2srw!4v1776832048548!5m2!1en!2srw",
};

export type ContactWithMapProps = ContactInfoProps & {
  map_a_embed_url?: string;
  map_b_embed_url?: string;
};

const FALLBACK_FORM_FIELDS: FormFieldConfig[] = [
  { key: "name", type: "text", label: "Full Name", required: true, placeholder: "e.g. Jean Hakizimana" },
  { key: "email", type: "email", label: "Email Address", required: true, placeholder: "you@example.com" },
  { key: "phone", type: "tel", label: "Phone Number", required: false, placeholder: "+250 7xx xxx xxx" },
  { key: "organization", type: "text", label: "Organization", required: false, placeholder: "Your organization" },
  { key: "topic", type: "select", label: "Topic", required: true, placeholder: "Select a topic", options: ["General Inquiry", "Partnership", "Volunteering", "Donation", "Media"] },
  { key: "message", type: "textarea", label: "Your Message", required: true, placeholder: "Tell us how we can help you..." },
];

function mergeProps(p: ContactWithMapProps) {
  const c = {
    form_title: (p.form_title || "Send Us a Message").trim(),
    form_subtitle:
      (p.form_subtitle || "We'll get back to you within 24 hours.").trim(),
    form_fields: Array.isArray(p.form_fields) && p.form_fields.length > 0
      ? p.form_fields
      : FALLBACK_FORM_FIELDS,
    map_a_embed_url: (p.map_a_embed_url || MAP_DEFAULTS.map_a_embed_url).trim(),
    map_b_embed_url: (p.map_b_embed_url || MAP_DEFAULTS.map_b_embed_url).trim(),
  };
  return c;
}

export default function ContactWithMapSection(props: ContactWithMapProps) {
  const c = mergeProps(props);

  return (
    <section
      className="contact-section contact-with-map-section"
      id="contact"
    >
      <div className="contact-orb" aria-hidden />
      <div className="contact-inner">
        {/* Left: Maps */}
        <div className="contact-map-panel">
          <div className="contact-map-grid">
            <div className="contact-map-card">
              {c.map_a_embed_url ? (
                <iframe
                  src={c.map_a_embed_url}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Caritas Rwanda Street View"
                />
              ) : null}
            </div>

            <div className="contact-map-card">
              {c.map_b_embed_url ? (
                <iframe
                  src={c.map_b_embed_url}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Caritas Rwanda HQ Location"
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="contact-form-card">
          <ContactMessageForm
            formTitle={c.form_title}
            formSubtitle={c.form_subtitle}
            formFields={c.form_fields}
          />
        </div>
      </div>
    </section>
  );
}
