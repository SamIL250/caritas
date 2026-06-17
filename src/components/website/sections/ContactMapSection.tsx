"use client";

import React, { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { CONTACT_TOPICS } from "@/lib/contact-topics";
import { submitContactMessage } from "@/app/actions/contact-messages";

interface ContactMapSectionProps {
  eyebrow?: string;
  heading_line1?: string;
  heading_line2?: string;
  subtext?: string;
}

const DEFAULTS = {
  headquarters_label: "Headquarters",
  headquarters: "Kigali, Rwanda",
  phone_label: "Phone",
  phone: "(+250) 252 574 34",
  email_label: "Email",
  email: "info@caritasrwanda.org",
  hours_label: "Office Hours",
  office_hours: "Mon – Fri, 8:00 AM – 5:00 PM",
  form_title: "Send Us a Message",
  form_subtitle: "We'll get back to you within 24 hours.",
  map_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5112492331314!2d30.05660827473925!3d-1.9485541980337648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425b5be2a55%3A0xcc6cf890e6ae864!2sCaritas%20Rwanda!5e0!3m2!1sen!2srw!4v1776832048548!5m2!1sen!2srw",
};

export default function ContactMapSection({
  eyebrow = "Get In Touch",
  heading_line1 = "We'd love to",
  heading_line2 = "hear from you",
  subtext = "Whether you have a question, want to volunteer, or want to partner with us, we're ready to answer all your questions.",
}: ContactMapSectionProps) {
  const c = DEFAULTS;

  const [subject, setSubject] = useState<string>(CONTACT_TOPICS[0]);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    startTransition(async () => {
      const r = await submitContactMessage({
        fullName: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        organization: String(fd.get("org") ?? ""),
        topic: subject,
        message: String(fd.get("message") ?? ""),
      });

      if (r.ok) {
        setFeedback({
          ok: true,
          text: "Thank you — your message is on its way. Please check your inbox for a quick confirmation.",
        });
        form.reset();
        setSubject(CONTACT_TOPICS[0]);
      } else {
        setFeedback({
          ok: false,
          text: r.error ?? "Something went wrong. Please try again in a moment.",
        });
      }
    });
  }

  return (
    <section className="cm-section" id="contact" aria-labelledby="cm-heading">
      <div className="cm-inner">
        {/* ── Left: Contact Info + Form ── */}
        <div className="cm-left">
          <div className="cm-eyebrow">
            <i className="fa-solid fa-envelope" aria-hidden />
            {eyebrow}
          </div>
          <h2 className="cm-heading" id="cm-heading">
            {heading_line1}
            <br />
            <span>{heading_line2}</span>
          </h2>
          <p className="cm-subtext">{subtext}</p>

          <div className="cm-info-grid">
            <div className="cm-info-item">
              <div className="cm-info-icon" aria-hidden>
                <i className="fa-solid fa-location-dot" />
              </div>
              <div className="cm-info-text">
                <strong>{c.headquarters_label}</strong>
                <span>{c.headquarters}</span>
              </div>
            </div>
            <div className="cm-info-item">
              <div className="cm-info-icon" aria-hidden>
                <i className="fa-solid fa-phone" />
              </div>
              <div className="cm-info-text">
                <strong>{c.phone_label}</strong>
                <span><a href={`tel:${c.phone.replace(/[^+\d]/g, "")}`}>{c.phone}</a></span>
              </div>
            </div>
            <div className="cm-info-item">
              <div className="cm-info-icon" aria-hidden>
                <i className="fa-solid fa-envelope" />
              </div>
              <div className="cm-info-text">
                <strong>{c.email_label}</strong>
                <span><a href={`mailto:${c.email}`}>{c.email}</a></span>
              </div>
            </div>
            <div className="cm-info-item">
              <div className="cm-info-icon" aria-hidden>
                <i className="fa-solid fa-clock" />
              </div>
              <div className="cm-info-text">
                <strong>{c.hours_label}</strong>
                <span>{c.office_hours}</span>
              </div>
            </div>
          </div>

          {/* ── Form ── */}
          <div className="cm-form-card">
            <h3 className="cm-form-title">{c.form_title}</h3>
            <p className="cm-form-subtitle">{c.form_subtitle}</p>

            {feedback ? (
              <div
                role="status"
                aria-live="polite"
                className={`cm-feedback${feedback.ok ? " cm-feedback--success" : " cm-feedback--error"}`}
              >
                {feedback.text}
              </div>
            ) : null}

            <form id="cmForm" onSubmit={handleSubmit}>
              <div className="cm-row">
                <div className="cm-field">
                  <label htmlFor="cm-name">Full Name</label>
                  <input type="text" id="cm-name" name="name" placeholder="e.g. Jean Hakizimana" required autoComplete="name" disabled={pending} />
                </div>
                <div className="cm-field">
                  <label htmlFor="cm-email">Email Address</label>
                  <input type="email" id="cm-email" name="email" placeholder="you@example.com" required autoComplete="email" disabled={pending} />
                </div>
              </div>
              <div className="cm-row">
                <div className="cm-field">
                  <label htmlFor="cm-phone">Phone Number</label>
                  <input type="tel" id="cm-phone" name="phone" placeholder="+250 7xx xxx xxx" autoComplete="tel" disabled={pending} />
                </div>
                <div className="cm-field">
                  <label htmlFor="cm-org">Organization (optional)</label>
                  <input type="text" id="cm-org" name="org" placeholder="Your organization" disabled={pending} />
                </div>
              </div>
              <div className="cm-full">
                <span className="cm-pill-label">Topic</span>
                <div className="cm-pills" role="group" aria-label="Message topic">
                  {CONTACT_TOPICS.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      className={`cm-pill${subject === pill ? " active" : ""}`}
                      onClick={() => setSubject(pill)}
                      disabled={pending}
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>
              <div className="cm-full cm-field">
                <label htmlFor="cm-message">Your Message</label>
                <textarea id="cm-message" name="message" placeholder="Tell us how we can help you..." required rows={4} disabled={pending} />
              </div>
              <button type="submit" className="cm-submit" disabled={pending}>
                {pending ? (
                  <><i className="fa-solid fa-spinner fa-spin" aria-hidden /> Sending…</>
                ) : (
                  <><i className="fa-solid fa-paper-plane" aria-hidden /> Send Message</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: Map ── */}
        <div className="cm-right">
          <div className="cm-map-wrap">
            <iframe
              src={c.map_embed_url}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Caritas Rwanda HQ Location"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
