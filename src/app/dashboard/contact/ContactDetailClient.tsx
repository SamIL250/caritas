"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  replyToContactMessage,
  updateContactMessageMeta,
  type ContactMessageRow,
  type ContactReplyRow,
} from "@/app/actions/contact-messages";

function statusVariant(s: ContactMessageRow["status"]): "success" | "warning" | "danger" | "default" {
  if (s === "new") return "warning";
  if (s === "read") return "default";
  if (s === "replied") return "success";
  return "default";
}

export default function ContactDetailClient({
  message,
  replies,
  notifyInboxEmail,
}: {
  message: ContactMessageRow;
  replies: ContactReplyRow[];
  notifyInboxEmail: string;
}) {
  const router = useRouter();
  const [metaError, setMetaError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replyOk, setReplyOk] = useState<string | null>(null);
  const [pendingMeta, startMeta] = useTransition();
  const [pendingReply, startReply] = useTransition();

  function saveMeta(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMetaError(null);
    const fd = new FormData(e.currentTarget);
    startMeta(async () => {
      const r = await updateContactMessageMeta(message.id, fd);
      if (r.error) setMetaError(r.error);
      else router.refresh();
    });
  }

  function sendReply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setReplyError(null);
    setReplyOk(null);
    const fd = new FormData(form);
    startReply(async () => {
      const r = await replyToContactMessage(message.id, fd);
      if (r.error) setReplyError(r.error);
      else {
        setReplyOk("Reply sent by email.");
        form.reset();
        router.refresh();
      }
    });
  }

  const inboxHint =
    notifyInboxEmail.trim() ||
    "Configure footer email under Dashboard → Settings so visitor replies route to your inbox.";

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/contact"
          className="text-xs font-semibold text-[#7A1515] underline underline-offset-2 hover:decoration-[#7A1515]/70"
        >
          ← Back to inbox
        </Link>
        <Badge variant={statusVariant(message.status)}>{message.status}</Badge>
        <span className="text-xs text-stone-500">
          Received {new Date(message.created_at).toLocaleString()}
        </span>
      </div>

      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Visitor message</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-bold uppercase text-stone-400">Name</dt>
            <dd className="font-medium text-stone-900">{message.full_name}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-stone-400">Email</dt>
            <dd>
              <a className="text-[#7A1515] underline underline-offset-2" href={`mailto:${message.email}`}>
                {message.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-stone-400">Phone</dt>
            <dd className="text-stone-800">{message.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-stone-400">Organization</dt>
            <dd className="text-stone-800">{message.organization || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-bold uppercase text-stone-400">Topic</dt>
            <dd className="font-medium text-stone-900">{message.topic}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-bold uppercase text-stone-400">Message</dt>
            <dd className="whitespace-pre-wrap rounded-lg border border-stone-100 bg-stone-50/80 p-4 text-stone-800">
              {message.message_body}
            </dd>
          </div>
        </dl>
      </Card>

      {replies.length > 0 ? (
        <Card className="space-y-4 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Your replies (logged)</h2>
          <ul className="space-y-4">
            {replies.map((r) => (
              <li key={r.id} className="rounded-xl border border-stone-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  <span>Staff reply</span>
                  <span>{new Date(r.sent_at).toLocaleString()}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-stone-800">{r.body_text}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Reply by email</h2>
        <p className="text-xs leading-relaxed text-stone-500">
          Sends from your SMTP identity with <strong>Reply-To</strong> set to{" "}
          <span className="font-mono text-stone-700">{notifyInboxEmail.trim() || "(fallback sender)"}</span>{" "}
          when configured — so follow-ups stay threaded in your mail client.
        </p>
        <form className="space-y-3" onSubmit={sendReply}>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase text-stone-500">Message</span>
            <textarea
              name="reply_body"
              required
              rows={8}
              placeholder="Write your reply… Plain text works best across mail clients."
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
            />
          </label>
          {replyError ? (
            <p className="text-sm text-red-600" role="alert">
              {replyError}
            </p>
          ) : null}
          {replyOk ? (
            <p className="text-sm text-emerald-700" role="status">
              {replyOk}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pendingReply}
            className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-[#7A1515] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#681212] disabled:opacity-50"
          >
            {pendingReply ? "Sending…" : "Send email reply"}
          </button>
        </form>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Internal workflow</h2>
        <form className="space-y-4" onSubmit={saveMeta}>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase text-stone-500">Status</span>
            <select
              name="status"
              defaultValue={message.status}
              className="w-full max-w-xs rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
            >
              <option value="new">new</option>
              <option value="read">read</option>
              <option value="replied">replied</option>
              <option value="archived">archived</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase text-stone-500">Staff notes (internal)</span>
            <textarea
              name="staff_notes"
              rows={4}
              defaultValue={message.staff_notes}
              placeholder="Notes visible only in the dashboard…"
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
            />
          </label>
          <p className="text-[11px] text-stone-400">{inboxHint}</p>
          {metaError ? (
            <p className="text-sm text-red-600" role="alert">
              {metaError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pendingMeta}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50 disabled:opacity-50"
          >
            {pendingMeta ? "Saving…" : "Save notes & status"}
          </button>
        </form>
      </Card>
    </div>
  );
}
