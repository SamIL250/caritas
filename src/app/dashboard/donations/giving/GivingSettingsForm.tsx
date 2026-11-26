"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DonationReachOut } from "@/components/website/DonationReachOut";
import { updateDonationGivingSettings } from "@/app/actions/donation-giving";
import type { DonationGivingSettings } from "@/lib/donation-giving";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">{children}</p>
  );
}

const fieldClass =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20";

export function GivingSettingsForm({ initial }: { initial: DonationGivingSettings }) {
  const [onlinePayments, setOnlinePayments] = useState(initial.online_payments_enabled);
  const [title, setTitle] = useState(initial.title);
  const [message, setMessage] = useState(initial.message);
  const [email, setEmail] = useState(initial.contact_email);
  const [phone, setPhone] = useState(initial.contact_phone);
  const [mtnCode, setMtnCode] = useState(initial.mtn_code);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const draft: DonationGivingSettings = {
    id: initial.id,
    online_payments_enabled: onlinePayments,
    title,
    message,
    contact_email: email,
    contact_phone: phone,
    mtn_code: mtnCode,
  };
  async function handleSave() {
    setSaving(true);
    setNotice(null);
    const result = await updateDonationGivingSettings({
      online_payments_enabled: onlinePayments,
      title,
      message,
      contact_email: email,
      contact_phone: phone,
      mtn_code: mtnCode,
    });
    if (result.success) {
      setNotice({
        type: "ok",
        text: onlinePayments
          ? "Saved. Donors can use online checkout."
          : "Saved. Donors see these contact details after they choose a cause.",
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
              <h3 className="text-sm font-bold text-stone-800">Online payment</h3>
              <Badge variant={onlinePayments ? "success" : "warning"}>
                {onlinePayments ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-stone-500">
              Leave this off until card payments are decided. Donors still choose a cause, then see the
              message, email, phone, and MTN MoMo code below.
            </p>
          </div>
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {onlinePayments ? "On" : "Off"}
            </span>
            <input
              type="checkbox"
              checked={onlinePayments}
              onChange={(event) => setOnlinePayments(event.target.checked)}
              className="h-4 w-4 rounded text-[#7A1515] focus:ring-[#7A1515]/30"
            />
          </label>
        </div>

        <div>
          <Label>Heading</Label>
          <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>

        <div>
          <Label>Message</Label>
          <textarea
            className={fieldClass}
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Email</Label>
            <input
              type="email"
              className={fieldClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="info@caritasrwanda.org"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <input
              type="tel"
              className={fieldClass}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(+250) 252 574 344"
            />
          </div>
        </div>

        <div>
          <Label>MTN MoMo code</Label>
          <input
            className={fieldClass}
            value={mtnCode}
            onChange={(event) => setMtnCode(event.target.value)}
            placeholder="*182*8*1*…"
          />
          <p className="mt-1 text-[11px] text-stone-400">
            Donors see this exactly as you type it. Leave it empty to hide the MoMo line.
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
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">Preview</p>
        <DonationReachOut settings={draft} causeName="General Donation" preview />
      </div>
    </div>
  );
}
