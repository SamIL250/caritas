"use client";

import React, { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { CONTACT_TOPICS } from "@/lib/contact-topics";
import { submitContactMessage } from "@/app/actions/contact-messages";

export type ContactInfoProps = {
  eyebrow?: string;
  heading_line1?: string;
  heading_line2?: string;
  subtext?: string;
  headquarters_label?: string;
  headquarters?: string;
  phone_label?: string;
  phone?: string;
  email_label?: string;
  email?: string;
  hours_label?: string;
  office_hours?: string;
  form_title?: string;
  form_subtitle?: string;
  /** @deprecated Legacy field; merged into `headquarters` when set */
  address?: string;
};

function mergeLegacy(p: ContactInfoProps) {
  const headquarters =
    (p.headquarters || "").trim() ||
    (p.address || "").trim() ||
    "Kigali, Rwanda";
  return {
    eyebrow: (p.eyebrow || "Get In Touch").trim(),
    heading_line1: (p.heading_line1 || "Let's Talk &").trim(),
    heading_line2: (p.heading_line2 || "Work Together").trim(),
    subtext:
      (p.subtext || "").trim() ||
      "Have a question, want to partner with us, or simply want to learn more about our work across Rwanda? We'd love to hear from you.",
    headquarters_label: (p.headquarters_label || "Headquarters").trim(),
    headquarters,
    phone_label: (p.phone_label || "Phone").trim(),
    phone: (p.phone || "(+250) 252 574 34").trim(),
    email_label: (p.email_label || "Email").trim(),
    email: (p.email || "info@caritasrwanda.org").trim(),
    hours_label: (p.hours_label || "Office Hours").trim(),
    office_hours:
      (p.office_hours || "").trim() || "Mon – Fri, 8:00 AM – 5:00 PM",
    form_title: (p.form_title || "Send Us a Message").trim(),
    form_subtitle: (p.form_subtitle || "We'll get back to you within 24 hours.").trim(),
  };
}

function ContactMessageForm({
  formTitle,
  formSubtitle,
}: {
  formTitle: string;
  formSubtitle: string;
}) {
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
    <div className="cf-form-body" id="cfFormBody">
      <h3 className="contact-form-title">{formTitle}</h3>
      <p className="contact-form-subtitle">{formSubtitle}</p>

      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          className={`cf-feedback${feedback.ok ? " cf-feedback--success" : " cf-feedback--error"}`}
        >
          {feedback.text}
        </div>
      ) : null}

      <form id="contactForm" onSubmit={handleSubmit}>
        <div className="cf-row">
          <div className="cf-field">
            <label htmlFor="cf-name">Full Name</label>
            <input
              type="text"
              id="cf-name"
              name="name"
              placeholder="e.g. Jean Hakizimana"
              required
              autoComplete="name"
              disabled={pending}
            />
          </div>
          <div className="cf-field">
            <label htmlFor="cf-email">Email Address</label>
            <input
              type="email"
              id="cf-email"
              name="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={pending}
            />
          </div>
        </div>

        <div className="cf-row">
          <div className="cf-field">
            <label htmlFor="cf-phone">Phone Number</label>
            <input
              type="tel"
              id="cf-phone"
              name="phone"
              placeholder="+250 7xx xxx xxx"
              autoComplete="tel"
              disabled={pending}
            />
          </div>
          <div className="cf-field">
            <label htmlFor="cf-org">Organization (optional)</label>
            <input
              type="text"
              id="cf-org"
              name="org"
              placeholder="Your organization"
              disabled={pending}
            />
          </div>
        </div>

        <div className="cf-full">
          <span className="cf-pill-label">Topic</span>
          <div className="cf-subject-pills" role="group" aria-label="Message topic">
            {CONTACT_TOPICS.map((pill) => (
              <button
                key={pill}
                type="button"
                className={`cf-pill${subject === pill ? " active" : ""}`}
                onClick={() => setSubject(pill)}
                disabled={pending}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        <div className="cf-full cf-field">
          <label htmlFor="cf-message">Your Message</label>
          <textarea
            id="cf-message"
            name="message"
            placeholder="Tell us how we can help you..."
            required
            rows={5}
            disabled={pending}
          />
        </div>

        <button type="submit" className="cf-submit" disabled={pending}>
          {pending ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" aria-hidden />
              Sending…
            </>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane" aria-hidden />
              Send Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ContactInfo(props: ContactInfoProps) {
  const c = mergeLegacy(props);

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-heading">
      <div className="contact-orb" aria-hidden />
      <div className="contact-inner">
        <div className="contact-info-panel">
          <div className="contact-eyebrow">
            <i className="fa-solid fa-envelope" aria-hidden />
            {c.eyebrow}
          </div>
          <h2 className="contact-heading" id="contact-heading">
            {c.heading_line1}
            <br />
            <span>{c.heading_line2}</span>
          </h2>
          <p className="contact-subtext">{c.subtext}</p>

          <div className="contact-info-cards">
            <div className="contact-info-card">
              <div className="contact-info-card-icon" aria-hidden>
                <i className="fa-solid fa-location-dot" />
              </div>
              <div className="contact-info-card-text">
                <strong>{c.headquarters_label}</strong>
                <span>{c.headquarters}</span>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-card-icon" aria-hidden>
                <i className="fa-solid fa-phone" />
              </div>
              <div className="contact-info-card-text">
                <strong>{c.phone_label}</strong>
                <span>
                  <a href={`tel:${c.phone.replace(/[^+\d]/g, "")}`}>{c.phone}</a>
                </span>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-card-icon" aria-hidden>
                <i className="fa-solid fa-envelope" />
              </div>
              <div className="contact-info-card-text">
                <strong>{c.email_label}</strong>
                <span>
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                </span>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-card-icon" aria-hidden>
                <i className="fa-solid fa-clock" />
              </div>
              <div className="contact-info-card-text">
                <strong>{c.hours_label}</strong>
                <span>{c.office_hours}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-card">
          <ContactMessageForm formTitle={c.form_title} formSubtitle={c.form_subtitle} />
        </div>
      </div>
    </section>
  );
}
