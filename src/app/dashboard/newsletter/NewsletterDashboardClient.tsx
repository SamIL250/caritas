"use client";

import { useMemo, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  exportNewsletterSubscribersCsv,
  sendNewsletterBroadcast,
  type NewsletterBroadcastRow,
  type NewsletterSubscriberRow,
} from "@/app/actions/newsletter";
import { sanitizeNewsletterHtml } from "@/lib/newsletter-html";
import { wrapBroadcastMessageHtml } from "@/lib/newsletter-email-layout";

type SubscriberSnippet = Pick<
  NewsletterSubscriberRow,
  "id" | "email" | "status" | "subscribed_at"
>;
type BroadcastSnippet = Pick<
  NewsletterBroadcastRow,
  "id" | "subject" | "recipient_count" | "failed_recipients" | "sent_at"
>;

export default function NewsletterDashboardClient(props: {
  /** Canonical site URL from server (`resolveSiteOrigin`) — keeps preview HTML aligned with emailed links. */
  siteOrigin: string;
  activeSubscribers: number;
  unsubscribedCount: number;
  broadcastCount: number;
  recentSubscribers: SubscriberSnippet[];
  broadcasts: BroadcastSnippet[];
}) {
  const router = useRouter();
  const [htmlBody, setHtmlBody] = useState(
    `<p>Dear friends,</p>\n<p>We’re sharing a short update from Caritas Rwanda.</p>\n<p>Wishing you peace and solidarity,<br/><strong>Caritas Rwanda</strong></p>`,
  );
  const [subject, setSubject] = useState("");
  const [confirmSend, setConfirmSend] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const previewHtml = useMemo(() => {
    const inner = sanitizeNewsletterHtml(htmlBody);
    const sampleUrl = `${props.siteOrigin.replace(/\/$/, "")}/newsletter/unsubscribe?token=preview`;
    return wrapBroadcastMessageHtml({ innerHtml: inner || "<p style=\"color:#94a3b8\">(Nothing to preview yet)</p>", unsubscribeUrl: sampleUrl });
  }, [htmlBody, props.siteOrigin]);

  async function onExportCsv() {
    setFeedback(null);
    const r = await exportNewsletterSubscribersCsv();
    if (r.error) {
      setFeedback({ kind: "error", message: r.error });
      return;
    }
    if (!r.csv) return;
    const blob = new Blob([r.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function submitBroadcast(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("subject", subject.trim());
    fd.set("html_body", htmlBody);
    fd.set("confirm_send", confirmSend ? "send" : "");

    setFeedback(null);
    startTransition(async () => {
      const result = await sendNewsletterBroadcast(fd);
      if (result.ok) {
        const detail =
          result.failed && result.failed > 0
            ? ` Delivered ${result.sent}; ${result.failed} failed (check SMTP logs).`
            : ` Delivered to ${result.sent} inbox(es).`;
        setFeedback({
          kind: "success",
          message: `Broadcast sent.${detail}`,
        });
        setConfirmSend(false);
        router.refresh();
      } else {
        setFeedback({
          kind: "error",
          message: result.error ?? "Could not send.",
        });
      }
    });
  }

  return (
    <div className="mt-6 space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border border-stone-200 bg-white p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Active list</div>
          <div className="mt-1 text-3xl font-bold tabular-nums text-stone-900">{props.activeSubscribers}</div>
          <p className="mt-2 text-xs text-stone-500">Subscribers who receive campaigns.</p>
        </Card>
        <Card className="border border-stone-200 bg-white p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Unsubscribed</div>
          <div className="mt-1 text-3xl font-bold tabular-nums text-stone-900">{props.unsubscribedCount}</div>
          <p className="mt-2 text-xs text-stone-500">Honoured automatically via email links.</p>
        </Card>
        <Card className="border border-stone-200 bg-white p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Campaigns sent</div>
          <div className="mt-1 text-3xl font-bold tabular-nums text-stone-900">{props.broadcastCount}</div>
          <p className="mt-2 text-xs text-stone-500">Stored as an audit trail below.</p>
        </Card>
      </div>

      {feedback ? (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Compose broadcast</h2>
          <p className="mt-1 text-sm text-stone-500">
            HTML is wrapped in your branded shell; each recipient gets a unique unsubscribe link at the bottom.
          </p>
          <form className="mt-5 space-y-4" onSubmit={submitBroadcast}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Subject line</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Programme highlights — March update"
                maxLength={400}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">HTML body</label>
              <textarea
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                rows={14}
                className="w-full rounded-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 font-mono text-[13px] leading-relaxed text-stone-800"
                spellCheck={false}
              />
              <p className="text-[11px] text-stone-400">
                Tip: keep layouts simple — paragraphs, headings, and links work best across mail clients.
              </p>
            </div>
            <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-stone-200 bg-stone-50/80 px-3 py-2.5 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={confirmSend}
                onChange={(e) => setConfirmSend(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I confirm this message should go to <strong>{props.activeSubscribers}</strong> active subscriber
                {props.activeSubscribers === 1 ? "" : "s"} now.
              </span>
            </label>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="submit"
                disabled={pending || props.activeSubscribers === 0}
                className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-[#7A1515] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#681212] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Sending…" : "Send newsletter"}
              </button>
              <button
                type="button"
                onClick={() => void onExportCsv()}
                className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
              >
                Export CSV (all statuses)
              </button>
            </div>
          </form>
        </Card>

        <Card className="flex flex-col border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Live preview</h2>
          <p className="mt-1 text-sm text-stone-500">
            Approximates what recipients see (sample unsubscribe URL shown).
          </p>
          <div className="mt-4 min-h-[280px] flex-1 overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-inner">
            <iframe title="Newsletter preview" className="h-[480px] w-full bg-white" sandbox="" srcDoc={previewHtml} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 bg-stone-50 px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Recent subscribers</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-100 bg-white text-[10px] font-bold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {props.recentSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-stone-500">
                    No subscribers yet. Promote the footer form on{" "}
                    <Link href="/" className="font-semibold text-[#7A1515] underline underline-offset-2">
                      the public site
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                props.recentSubscribers.map((row) => (
                  <tr key={row.id} className="hover:bg-stone-50/80">
                    <td className="max-w-[14rem] truncate px-4 py-2.5 text-xs font-medium text-stone-900">{row.email}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={row.status === "active" ? "success" : "default"}>{row.status}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-stone-600">
                      {new Date(row.subscribed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 bg-stone-50 px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Broadcast history</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-100 bg-white text-[10px] font-bold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-2">Sent</th>
                <th className="px-4 py-2">Subject</th>
                <th className="px-4 py-2 text-right">Reach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {props.broadcasts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-stone-500">
                    Your first send will appear here with counts for auditing.
                  </td>
                </tr>
              ) : (
                props.broadcasts.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/80">
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-stone-600">
                      {new Date(b.sent_at).toLocaleString()}
                    </td>
                    <td className="max-w-[12rem] truncate px-4 py-2.5 text-xs font-medium text-stone-900">{b.subject}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right text-xs text-stone-600">
                      {b.recipient_count}
                      {b.failed_recipients > 0 ? (
                        <span className="text-red-600"> ({b.failed_recipients} failed)</span>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
