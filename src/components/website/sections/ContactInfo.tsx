"use client";

import React, { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { submitContactMessage } from "@/app/actions/contact-messages";

export type FormFieldConfig = {
  key: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

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
  form_fields?: FormFieldConfig[];
  /** @deprecated Legacy field; merged into `headquarters` when set */
  address?: string;
};

const DEFAULT_FORM_FIELDS: FormFieldConfig[] = [
  { key: "name", type: "text", label: "Full Name", required: true, placeholder: "e.g. Jean Hakizimana" },
  { key: "email", type: "email", label: "Email Address", required: true, placeholder: "you@example.com" },
  { key: "phone", type: "tel", label: "Phone Number", required: false, placeholder: "+250 7xx xxx xxx" },
  { key: "organization", type: "text", label: "Organization", required: false, placeholder: "Your organization" },
  { key: "topic", type: "select", label: "Topic", required: true, placeholder: "Select a topic", options: ["General Inquiry", "Partnership", "Volunteering", "Donation", "Media"] },
  { key: "message", type: "textarea", label: "Your Message", required: true, placeholder: "Tell us how we can help you..." },
];

const STANDARD_KEYS = new Set(["name", "email", "phone", "organization", "topic", "message"]);

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
      "Please reach out to us with any questions, partnership opportunities, or to learn more about our initiatives across Rwanda.",
    headquarters_label: (p.headquarters_label || "Headquarters").trim(),
    headquarters,
    phone_label: (p.phone_label || "Phone").trim(),
    phone: (p.phone || "(+250) 252 574 344").trim(),
    email_label: (p.email_label || "Email").trim(),
    email: (p.email || "info@caritasrwanda.org").trim(),
    hours_label: (p.hours_label || "Office Hours").trim(),
    office_hours:
      (p.office_hours || "").trim() || "Mon – Fri, 8:00 AM – 5:00 PM",
    form_title: (p.form_title || "Send Us a Message").trim(),
    form_subtitle: (p.form_subtitle || "We'll get back to you within 24 hours.").trim(),
    form_fields: Array.isArray(p.form_fields) && p.form_fields.length > 0
      ? p.form_fields
      : DEFAULT_FORM_FIELDS,
  };
}

function FormFieldInput({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FormFieldConfig;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const fieldId = `cf-${field.key}`;

  if (field.type === "textarea") {
    return (
      <div className="cf-full cf-field">
        <label htmlFor={fieldId}>{field.label}</label>
        <textarea
          id={fieldId}
          name={field.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          rows={5}
          disabled={disabled}
        />
      </div>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <div className="cf-full cf-field">
        <label htmlFor={fieldId}>{field.label}</label>
        <select
          id={fieldId}
          name={field.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          disabled={disabled}
          className="cf-select"
        >
          <option value="">{field.placeholder || "Select..."}</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="cf-field">
      <label htmlFor={fieldId}>{field.label}</label>
      <input
        type={field.type}
        id={fieldId}
        name={field.key}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        autoComplete={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "off"}
        disabled={disabled}
      />
    </div>
  );
}

export function ContactMessageForm({
  formTitle,
  formSubtitle,
  formFields,
}: {
  formTitle: string;
  formSubtitle: string;
  formFields: FormFieldConfig[];
}) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of formFields) {
      initial[f.key] = "";
    }
    return initial;
  });
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function setField(key: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }

  function isLast(field: FormFieldConfig, idx: number): boolean {
    if (idx === formFields.length - 2) {
      const next = formFields[idx + 1];
      return next?.type === "textarea" || next?.type === "select";
    }
    return false;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const fieldsData: Record<string, string> = {};

      for (const f of formFields) {
        fieldsData[f.key] = fieldValues[f.key] ?? "";
      }

      const r = await submitContactMessage({
        fullName: fieldsData["name"] ?? "",
        email: fieldsData["email"] ?? "",
        phone: fieldsData["phone"] ?? "",
        organization: fieldsData["organization"] ?? "",
        topic: fieldsData["topic"] ?? "",
        message: fieldsData["message"] ?? "",
        fieldsData,
      });

      if (r.ok) {
        setFeedback({
          ok: true,
          text: "Thank you — your message is on its way. Please check your inbox for a quick confirmation.",
        });
        const reset: Record<string, string> = {};
        for (const f of formFields) {
          reset[f.key] = "";
        }
        setFieldValues(reset);
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
        {formFields.map((field, idx) => {
          if (field.type === "textarea" || field.type === "select") {
            return (
              <FormFieldInput
                key={field.key}
                field={field}
                value={fieldValues[field.key] ?? ""}
                onChange={(v) => setField(field.key, v)}
                disabled={pending}
              />
            );
          }
          const nextIsNewRow = idx < formFields.length - 1 && (isLast(field, idx) || (
            idx % 2 === 0 && idx < formFields.length - 1 &&
            formFields[idx + 1].type !== "textarea" &&
            formFields[idx + 1].type !== "select"
          ));
          if (nextIsNewRow && idx % 2 === 0) {
            const next = formFields[idx + 1];
            return (
              <div className="cf-row" key={`row-${field.key}`}>
                <FormFieldInput
                  field={field}
                  value={fieldValues[field.key] ?? ""}
                  onChange={(v) => setField(field.key, v)}
                  disabled={pending}
                />
                <FormFieldInput
                  field={next}
                  value={fieldValues[next.key] ?? ""}
                  onChange={(v) => setField(next.key, v)}
                  disabled={pending}
                />
              </div>
            );
          }
          if (idx % 2 === 0) return null;
          return (
            <div className="cf-row" key={`row-${field.key}`}>
              <FormFieldInput
                field={formFields[idx - 1]}
                value={fieldValues[formFields[idx - 1].key] ?? ""}
                onChange={(v) => setField(formFields[idx - 1].key, v)}
                disabled={pending}
              />
              <FormFieldInput
                field={field}
                value={fieldValues[field.key] ?? ""}
                onChange={(v) => setField(field.key, v)}
                disabled={pending}
              />
            </div>
          );
        })}

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
