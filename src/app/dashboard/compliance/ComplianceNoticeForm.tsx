"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ComplianceNotice } from "@/components/website/ComplianceNotice";
import { updateComplianceNoticeSettings } from "@/app/actions/compliance-notice";
import type { ComplianceNoticeSettings } from "@/lib/compliance-notice";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
      {children}
    </p>
  );
}

const fieldClass =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20";

export function ComplianceNoticeForm({ initial }: { initial: ComplianceNoticeSettings }) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [title, setTitle] = useState(initial.title);
  const [imageUrl, setImageUrl] = useState(initial.image_url);
  const [imageAlt, setImageAlt] = useState(initial.image_alt);
  const [reportLabel, setReportLabel] = useState(initial.report_label);
  const [contactEmail, setContactEmail] = useState(initial.contact_email);
  const [contactPhone, setContactPhone] = useState(initial.contact_phone);
  const [infoLabel, setInfoLabel] = useState(initial.info_label);
  const [infoUrl, setInfoUrl] = useState(initial.info_url);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const draft: ComplianceNoticeSettings = {
    id: initial.id,
    enabled,
    title,
    image_url: imageUrl,
    image_alt: imageAlt,
    report_label: reportLabel,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    info_label: infoLabel,
    info_url: infoUrl,
  };

  async function handleSave() {
    setSaving(true);
    setNotice(null);
    const result = await updateComplianceNoticeSettings({
      enabled,
      title,
      image_url: imageUrl,
      image_alt: imageAlt,
      report_label: reportLabel,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      info_label: infoLabel,
      info_url: infoUrl,
    });
    if (result.success) {
      setNotice({
        type: "ok",
        text: enabled
          ? "Saved. Visitors see this notice when they open the homepage."
          : "Saved. The homepage notice is hidden.",
      });
    } else {
      setNotice({ type: "err", text: result.error || "Could not save this notice." });
    }
    setSaving(false);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,34rem)_minmax(18rem,24rem)]">
      <Card className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-800">Homepage notice</h3>
              <Badge variant={enabled ? "success" : "default"}>{enabled ? "Showing" : "Hidden"}</Badge>
            </div>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-stone-500">
              Visitors see this panel when they open the homepage. They can close it, and the side tab opens it again.
              Leave a contact field empty to hide that line.
            </p>
          </div>
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {enabled ? "Enabled" : "Disabled"}
            </span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              className="h-4 w-4 rounded text-[#7A1515] focus:ring-[#7A1515]/30"
            />
          </label>
        </div>

        <div>
          <Label>Side tab and heading</Label>
          <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>

        <div>
          <Label>Poster image</Label>
          <input className={fieldClass} value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
        </div>

        <div>
          <Label>Image description</Label>
          <textarea
            className={`${fieldClass} min-h-20`}
            value={imageAlt}
            onChange={(event) => setImageAlt(event.target.value)}
          />
        </div>

        <div>
          <Label>Report line</Label>
          <input
            className={fieldClass}
            value={reportLabel}
            onChange={(event) => setReportLabel(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Email</Label>
            <input
              className={fieldClass}
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <input
              className={fieldClass}
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>More information label</Label>
            <input className={fieldClass} value={infoLabel} onChange={(event) => setInfoLabel(event.target.value)} />
          </div>
          <div>
            <Label>More information link</Label>
            <input className={fieldClass} value={infoUrl} onChange={(event) => setInfoUrl(event.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
          {notice ? (
            <p className={`text-sm ${notice.type === "ok" ? "text-green-700" : "text-red-600"}`}>
              {notice.text}
            </p>
          ) : null}
        </div>
      </Card>

      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">Preview</p>
        <ComplianceNotice settings={draft} preview />
      </div>
    </div>
  );
}
