"use client";

import { useEffect, useState } from "react";
import type { ComplianceNoticeSettings } from "@/lib/compliance-notice";
import "./compliance-notice.css";

type Props = {
  settings: ComplianceNoticeSettings;
  preview?: boolean;
};

function phoneHref(phone: string): string {
  const compact = phone.replace(/[^\d+]/g, "");
  return compact ? `tel:${compact}` : "";
}

export function ComplianceNotice({ settings, preview = false }: Props) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (preview || !open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, preview]);

  const email = settings.contact_email.trim();
  const phone = settings.contact_phone.trim();
  const infoUrl = settings.info_url.trim();
  const infoLabel = settings.info_label.trim();
  const reportLabel = settings.report_label.trim();
  const showFoot = Boolean(email || phone || (infoUrl && infoLabel) || reportLabel);

  return (
    <div
      className={`cr-notice${open ? " is-open" : ""}${preview ? " is-preview" : ""}`}
      role={open ? "dialog" : undefined}
      aria-modal={open && !preview ? true : undefined}
      aria-label={open ? settings.title : undefined}
    >
      <div
        className="cr-notice-scrim"
        onClick={() => setOpen(false)}
      />
      <aside className="cr-notice-sheet" data-lenis-prevent>
        <button type="button" className="cr-notice-tab" onClick={() => setOpen(true)}>
          {settings.title}
        </button>
        <div className="cr-notice-head">
          <p className="cr-notice-title">{settings.title}</p>
          <button
            type="button"
            className="cr-notice-close"
            aria-label="Close notice"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="cr-notice-body">
          <img className="cr-notice-image" src={settings.image_url} alt={settings.image_alt} />
        </div>
        {showFoot ? (
          <div className="cr-notice-foot">
            {reportLabel ? <p className="cr-notice-report">{reportLabel}</p> : null}
            <div className="cr-notice-contacts">
              {email ? <a href={`mailto:${email}`}>{email}</a> : null}
              {phone && phoneHref(phone) ? <a href={phoneHref(phone)}>{phone}</a> : null}
            </div>
            {infoUrl && infoLabel ? (
              <a className="cr-notice-info" href={infoUrl}>
                {infoLabel}
              </a>
            ) : null}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
