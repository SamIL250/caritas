"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MaintenanceScreen } from "@/components/website/MaintenanceScreen";
import { updateMaintenanceSettings } from "@/app/actions/maintenance";
import type { MaintenanceSettings } from "@/lib/maintenance";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
      {children}
    </p>
  );
}

export function MaintenanceForm({ initial }: { initial: MaintenanceSettings }) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [eyebrow, setEyebrow] = useState(initial.eyebrow);
  const [title, setTitle] = useState(initial.title);
  const [message, setMessage] = useState(initial.message);
  const [contactLabel, setContactLabel] = useState(initial.contact_label);
  const [contactEmail, setContactEmail] = useState(initial.contact_email);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const draft: MaintenanceSettings = {
    id: initial.id,
    enabled,
    eyebrow,
    title,
    message,
    contact_label: contactLabel,
    contact_email: contactEmail,
  };

  async function handleSave() {
    setSaving(true);
    setNotice(null);
    const result = await updateMaintenanceSettings({
      enabled,
      eyebrow,
      title,
      message,
      contact_label: contactLabel,
      contact_email: contactEmail,
    });
    if (result.success) {
      setNotice({
        type: "ok",
        text: enabled
          ? "Maintenance mode is on. Visitors now see this screen."
          : "Saved. The public website is live.",
      });
    } else {
      setNotice({ type: "err", text: result.error || "Could not save these settings." });
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-800">Public website</h3>
              <Badge variant={enabled ? "warning" : "success"}>
                {enabled ? "Under maintenance" : "Live"}
              </Badge>
            </div>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-stone-500">
              When maintenance is on, visitors see the screen below instead of the public site.
              The dashboard, including this page, stays available so you can turn it off.
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Eyebrow</Label>
            <input
              type="text"
              value={eyebrow}
              onChange={(event) => setEyebrow(event.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
            />
          </div>
          <div>
            <Label>Contact label</Label>
            <input
              type="text"
              value={contactLabel}
              onChange={(event) => setContactLabel(event.target.value)}
              placeholder="Need to reach us?"
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
            />
          </div>
        </div>

        <div>
          <Label>Heading</Label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
          />
        </div>

        <div>
          <Label>Message</Label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
          />
        </div>

        <div>
          <Label>Contact email</Label>
          <input
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="info@caritasrwanda.org"
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
          />
          <p className="mt-1 text-[11px] text-stone-400">
            Leave this empty to hide the contact line.
          </p>
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
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Preview
        </p>
        <MaintenanceScreen settings={draft} preview />
      </div>
    </div>
  );
}
