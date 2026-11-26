"use client";

import { useState } from "react";
import type { DonationGivingSettings } from "@/lib/donation-giving";
import "./donation-reach-out.css";

type Props = {
  settings: DonationGivingSettings;
  causeName: string;
  onDone?: () => void;
  preview?: boolean;
};

function phoneHref(phone: string): string {
  const compact = phone.replace(/[^\d+]/g, "");
  return compact ? `tel:${compact}` : "";
}

export function DonationReachOut({ settings, causeName, onDone, preview = false }: Props) {
  const [copied, setCopied] = useState(false);
  const code = settings.mtn_code.trim();
  const email = settings.contact_email.trim();
  const phone = settings.contact_phone.trim();
  const tel = phoneHref(phone);

  async function copyDial() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className={preview ? "cr-give cr-give--preview" : "cr-give"} aria-label="How to give">
      <p className="cr-give__cause">For {causeName}</p>
      <h2 className="cr-give__title">{settings.title}</h2>
      <p className="cr-give__message">{settings.message}</p>
      <ul className="cr-give__list">
        {email ? (
          <li className="cr-give__row">
            <p className="cr-give__label">Email</p>
            <a className="cr-give__value" href={`mailto:${encodeURI(email)}`}>
              {email}
            </a>
          </li>
        ) : null}
        {phone ? (
          <li className="cr-give__row">
            <p className="cr-give__label">Phone</p>
            {tel ? (
              <a className="cr-give__value" href={tel}>
                {phone}
              </a>
            ) : (
              <span className="cr-give__value">{phone}</span>
            )}
          </li>
        ) : null}
        {code ? (
          <li className="cr-give__row">
            <p className="cr-give__label">MTN MoMo</p>
            <div className="cr-give__dial">
              <code>{code}</code>
              {preview ? null : (
                <button type="button" className="cr-give__copy" onClick={copyDial}>
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          </li>
        ) : null}
      </ul>
      {onDone ? (
        <button type="button" className="cr-give__done" onClick={onDone}>
          Close
        </button>
      ) : null}
    </section>
  );
}
