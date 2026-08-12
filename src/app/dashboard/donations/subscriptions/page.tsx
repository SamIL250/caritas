"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import {
  cancelDonationSubscription,
  pauseDonationSubscription,
  resumeDonationSubscription,
  syncDonationSubscriptionsFromStripe,
} from "@/app/actions/donation-subscriptions";
import { Loader2, Pause, Play, RefreshCw, XCircle } from "lucide-react";

type SubRow = {
  id: string;
  donor_name: string | null;
  donor_email: string | null;
  campaign_name: string | null;
  amount: number;
  currency: string;
  interval: string;
  interval_count: number;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  created_at: string;
  stripe_subscription_id: string;
};

function statusTone(status: string): "success" | "warning" | "danger" | "default" {
  if (status === "active") return "success";
  if (status === "paused" || status === "past_due") return "warning";
  if (status === "canceled" || status === "unpaid") return "danger";
  return "default";
}

function formatAmount(amount: number, currency: string) {
  return `${amount.toLocaleString()} ${(currency || "RWF").toUpperCase()}`;
}

function formatInterval(interval: string, count: number) {
  if (count === 1) return interval === "month" ? "Monthly" : `Every ${interval}`;
  return `Every ${count} ${interval}s`;
}

export default function DonationSubscriptionsPage() {
  const [rows, setRows] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("donation_subscriptions")
      .select(
        "id, donor_name, donor_email, campaign_name, amount, currency, interval, interval_count, status, cancel_at_period_end, current_period_end, created_at, stripe_subscription_id",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      setMessage(error.message);
      setRows([]);
    } else {
      setRows((data || []) as SubRow[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function runAction(
    label: string,
    action: () => Promise<{ ok: boolean; error?: string; synced?: number }>,
  ) {
    startTransition(async () => {
      setMessage(null);
      const result = await action();
      if (!result.ok) {
        setMessage(result.error || `${label} failed`);
        return;
      }
      setMessage(
        typeof result.synced === "number"
          ? `Synced ${result.synced} subscription(s) from Stripe.`
          : `${label} succeeded.`,
      );
      await load();
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="Recurring donations" />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-stone-500">
              Pause, resume, or cancel Stripe recurring gifts. Renewals are recorded via webhooks; a nightly cron
              also syncs status.
            </p>
            <Link
              href="/dashboard/donations"
              className="mt-1 inline-block text-sm font-semibold text-[#7A1515] hover:underline"
            >
              ← Back to donations
            </Link>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              runAction("Sync", () => syncDonationSubscriptionsFromStripe())
            }
          >
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Sync from Stripe
          </Button>
        </div>

        {message ? (
          <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
            {message}
          </div>
        ) : null}

        <Card className="overflow-hidden p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-stone-400">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-stone-500">
              No recurring donations yet. Monthly gifts will appear here after Stripe checkout completes.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-stone-100 bg-stone-50 text-[11px] uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Donor</th>
                    <th className="px-4 py-3 font-semibold">Campaign</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Next / period</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-stone-100 last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-stone-800">{row.donor_name || "—"}</div>
                        <div className="text-xs text-stone-500">{row.donor_email || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-stone-700">{row.campaign_name || "General"}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{formatAmount(row.amount, row.currency)}</div>
                        <div className="text-xs text-stone-500">
                          {formatInterval(row.interval, row.interval_count)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusTone(row.status)}>{row.status}</Badge>
                        {row.cancel_at_period_end ? (
                          <div className="mt-1 text-[11px] text-amber-700">Cancels at period end</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-500">
                        {row.current_period_end
                          ? new Date(row.current_period_end).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {row.status === "active" ? (
                            <Button
                              type="button"
                              variant="secondary"
                              className="h-8 px-2 text-xs"
                              disabled={pending}
                              onClick={() =>
                                runAction("Pause", () => pauseDonationSubscription(row.id))
                              }
                            >
                              <Pause className="mr-1 h-3.5 w-3.5" /> Pause
                            </Button>
                          ) : null}
                          {row.status === "paused" || row.status === "past_due" ? (
                            <Button
                              type="button"
                              variant="secondary"
                              className="h-8 px-2 text-xs"
                              disabled={pending}
                              onClick={() =>
                                runAction("Resume", () => resumeDonationSubscription(row.id))
                              }
                            >
                              <Play className="mr-1 h-3.5 w-3.5" /> Resume
                            </Button>
                          ) : null}
                          {row.status !== "canceled" ? (
                            <Button
                              type="button"
                              variant="secondary"
                              className="h-8 px-2 text-xs text-red-700"
                              disabled={pending}
                              onClick={() =>
                                runAction("Cancel", () =>
                                  cancelDonationSubscription(row.id, { atPeriodEnd: true }),
                                )
                              }
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" /> Cancel
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
