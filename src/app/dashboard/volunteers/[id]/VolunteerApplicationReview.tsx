"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateVolunteerApplicationStaff } from "@/app/actions/volunteer-applications";
import type { VolunteerApplicationRow } from "@/app/actions/volunteer-applications";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type CampaignOpt = { id: string; title: string };

export default function VolunteerApplicationReview({
  application,
  campaignOptions,
  preferredCampaignTitle,
}: {
  application: VolunteerApplicationRow;
  campaignOptions: CampaignOpt[];
  preferredCampaignTitle: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await updateVolunteerApplicationStaff(application.id, fd);
    setPending(false);
    if (res.error) setError(res.error);
    else router.refresh();
  }

  const acceptSent = Boolean(application.acceptance_email_sent_at);
  const rejectSent = Boolean(application.rejection_email_sent_at);

  return (
    <form onSubmit={(ev) => void handleSubmit(ev)} className="space-y-8">
      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Applicant</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-bold uppercase text-stone-400">Name</dt>
            <dd className="font-medium text-stone-900">{application.full_name}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-stone-400">Email</dt>
            <dd className="text-stone-800">{application.email}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-stone-400">Phone</dt>
            <dd className="text-stone-800">{application.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-stone-400">City</dt>
            <dd className="text-stone-800">{application.city || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-bold uppercase text-stone-400">Preferred programme</dt>
            <dd className="text-stone-800">{preferredCampaignTitle}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-bold uppercase text-stone-400">Motivation</dt>
            <dd className="whitespace-pre-wrap text-stone-800">{application.motivation || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-bold uppercase text-stone-400">Skills &amp; experience</dt>
            <dd className="whitespace-pre-wrap text-stone-800">{application.skills_experience || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-bold uppercase text-stone-400">Availability</dt>
            <dd className="whitespace-pre-wrap text-stone-800">{application.availability || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-bold uppercase text-stone-400">Languages</dt>
            <dd className="whitespace-pre-wrap text-stone-800">{application.languages || "—"}</dd>
          </div>
        </dl>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Staff review</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-stone-500">Status</span>
            <select
              name="status"
              defaultValue={application.status}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
            >
              <option value="pending">pending</option>
              <option value="accepted">accepted</option>
              <option value="rejected">rejected</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-stone-500">Assign to campaign</span>
            <select
              name="assigned_campaign_id"
              defaultValue={application.assigned_campaign_id ?? ""}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
            >
              <option value="">— none —</option>
              {campaignOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-[10px] font-bold uppercase text-stone-500">Role label (shown in acceptance email)</span>
          <input
            name="assigned_role_label"
            defaultValue={application.assigned_role_label}
            placeholder="e.g. Field assistant, Event helper"
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-[10px] font-bold uppercase text-stone-500">Staff notes (internal)</span>
          <textarea
            name="staff_notes"
            rows={3}
            defaultValue={application.staff_notes}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-[10px] font-bold uppercase text-stone-500">Rejection reason (applicant-facing)</span>
          <textarea
            name="rejection_reason"
            rows={3}
            defaultValue={application.rejection_reason}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-[10px] font-bold uppercase text-stone-500">
            Extra note for acceptance email (optional)
          </span>
          <textarea
            name="acceptance_note"
            rows={2}
            placeholder="Orientation date, meeting point, etc."
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          />
        </label>

        <div className="flex flex-col gap-3 rounded-lg border border-stone-100 bg-stone-50/80 p-4 text-sm">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="notify_accept"
              defaultChecked={false}
              disabled={acceptSent}
              className="mt-1 h-4 w-4 accent-[var(--color-primary)] disabled:opacity-40"
            />
            <span className="text-stone-800">
              Send acceptance email when status is <strong>accepted</strong>
              {acceptSent ? (
                <span className="mt-1 block text-xs text-stone-500">
                  Already sent {new Date(application.acceptance_email_sent_at!).toLocaleString()}
                </span>
              ) : null}
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="notify_reject"
              defaultChecked={false}
              disabled={rejectSent}
              className="mt-1 h-4 w-4 accent-[var(--color-primary)] disabled:opacity-40"
            />
            <span className="text-stone-800">
              Send rejection email when status is <strong>rejected</strong>
              {rejectSent ? (
                <span className="mt-1 block text-xs text-stone-500">
                  Already sent {new Date(application.rejection_email_sent_at!).toLocaleString()}
                </span>
              ) : null}
            </span>
          </label>
          <p className="text-xs leading-relaxed text-stone-500">
            Server mail uses Nodemailer (SMTP). Set{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">SMTP_HOST</code>,{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">SMTP_USER</code>,{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">SMTP_PASS</code> (Gmail app
            password), and a From line via{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">SMTP_FROM</code> or{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">VOLUNTEER_EMAIL_FROM</code>. Import{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">sendMail</code> from{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">@/lib/mail</code> for other flows.
          </p>
        </div>

        {error ? (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending} className="gap-2">
            {pending ? "Saving…" : "Save review"}
          </Button>
          <Link
            href="/dashboard/volunteers"
            className="inline-flex h-10 items-center rounded-lg border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            Back to list
          </Link>
        </div>
      </Card>
    </form>
  );
}
