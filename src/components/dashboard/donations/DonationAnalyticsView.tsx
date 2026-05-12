"use client";

import React from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  Wallet,
  Gift,
  Clock,
  AlertCircle,
  TrendingUp,
  PiggyBank,
} from "lucide-react";

import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import {
  PAYMENT_METHOD_LABELS,
  type DonationPaymentMethod,
} from "@/lib/donation-payment-methods";
import {
  type DonationAnalyticsRow,
  buildSucceededDailySeries,
  breakdownByPaymentMethod,
  breakdownByStatus,
  sumAmount,
  countRows,
} from "@/lib/donation-analytics";

const chartTooltip = {
  contentStyle: {
    borderRadius: 10,
    border: "1px solid #e7e5e4",
    fontSize: 12,
  },
  labelStyle: { fontWeight: 600, color: "#44403c" },
};

function paymentLabel(raw: string): string {
  if (raw === "manual") return "Manual (staff)";
  if (!raw || raw === "stripe") return PAYMENT_METHOD_LABELS.stripe;
  if (raw in PAYMENT_METHOD_LABELS) return PAYMENT_METHOD_LABELS[raw as DonationPaymentMethod];
  return raw;
}

type Props = {
  title: string;
  subtitle?: string;
  currency: string;
  goalAmount: number | null;
  donations: DonationAnalyticsRow[];
  loading: boolean;
  backHref: string;
  editHref?: string;
  publicHref?: string;
};

export function DonationAnalyticsView({
  title,
  subtitle,
  currency,
  goalAmount,
  donations,
  loading,
  backHref,
  editHref,
  publicHref,
}: Props) {
  const cy = currency.trim() || "RWF";

  const succeededTotal = sumAmount(donations, (r) => r.status === "succeeded");
  const succeededCount = countRows(donations, (r) => r.status === "succeeded");
  const pendingTotal = sumAmount(donations, (r) => r.status === "pending");
  const pendingCount = countRows(donations, (r) => r.status === "pending");
  const failedCount = countRows(donations, (r) => r.status === "failed");

  const avgSucceeded =
    succeededCount > 0 ? Math.round(succeededTotal / succeededCount) : 0;

  const pctGoal =
    goalAmount !== null && goalAmount > 0
      ? Math.min(100, Math.round((succeededTotal / goalAmount) * 100))
      : null;

  const dailySeries = buildSucceededDailySeries(donations);
  const methodSeries = breakdownByPaymentMethod(donations).map((r) => ({
    ...r,
    label: paymentLabel(r.name),
  }));
  const statusSeries = breakdownByStatus(donations);

  return (
    <>
      <Topbar
        title={title}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={backHref}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              <ArrowLeft size={16} aria-hidden />
              Back
            </Link>
            {editHref ? (
              <Link
                href={editHref}
                className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-3 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
              >
                Edit campaign
              </Link>
            ) : null}
            {publicHref ? (
              <a
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-md border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Public page
              </a>
            ) : null}
          </div>
        }
      />

      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-500">
        {subtitle ? (
          <p className="max-w-3xl text-sm leading-relaxed text-stone-600">{subtitle}</p>
        ) : null}

        {loading ? (
          <div className="flex h-56 items-center justify-center rounded-xl border border-stone-100 bg-white">
            <p className="text-sm text-stone-400">Loading analytics…</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Raised (succeeded)
                  </span>
                  <TrendingUp size={18} className="text-emerald-600" aria-hidden />
                </div>
                <p className="mt-3 text-2xl font-bold tabular-nums text-stone-900">
                  {succeededTotal.toLocaleString()} {cy}
                </p>
                <p className="mt-1 text-xs text-stone-500">{succeededCount} gifts recorded</p>
              </Card>

              <Card className="flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Average gift
                  </span>
                  <PiggyBank size={18} className="text-violet-600" aria-hidden />
                </div>
                <p className="mt-3 text-2xl font-bold tabular-nums text-stone-900">
                  {avgSucceeded.toLocaleString()} {cy}
                </p>
                <p className="mt-1 text-xs text-stone-500">Among succeeded payments only</p>
              </Card>

              <Card className="flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Pending pipeline
                  </span>
                  <Clock size={18} className="text-amber-600" aria-hidden />
                </div>
                <p className="mt-3 text-2xl font-bold tabular-nums text-stone-900">
                  {pendingTotal.toLocaleString()} {cy}
                </p>
                <p className="mt-1 text-xs text-stone-500">{pendingCount} open attempts</p>
              </Card>

              <Card className="flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Goal progress
                  </span>
                  <Gift size={18} className="text-sky-600" aria-hidden />
                </div>
                <p className="mt-3 text-2xl font-bold tabular-nums text-stone-900">
                  {pctGoal !== null ? `${pctGoal}%` : "—"}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {goalAmount !== null && goalAmount > 0
                    ? `Goal ${goalAmount.toLocaleString()} ${cy}`
                    : "No numeric goal set"}
                </p>
              </Card>
            </div>

            {failedCount > 0 ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900">
                <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden />
                <span>
                  <strong>{failedCount}</strong> donation attempt(s) recorded as failed — excluded from raised totals.
                </span>
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Wallet size={18} className="text-stone-500" aria-hidden />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Succeeded amount over time (UTC days)
                  </h3>
                </div>
                {dailySeries.length === 0 ? (
                  <p className="py-16 text-center text-sm text-stone-400">No succeeded gifts yet.</p>
                ) : (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="donFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7A1515" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#7A1515" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#a8a29e" />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          stroke="#a8a29e"
                          tickFormatter={(v) => `${Number(v) >= 1000 ? `${Math.round(Number(v) / 1000)}k` : v}`}
                        />
                        <Tooltip
                          formatter={(value: number | undefined) =>
                            value != null ? [`${value.toLocaleString()} ${cy}`, "Amount"] : ["—", ""]
                          }
                          {...chartTooltip}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#7A1515"
                          strokeWidth={2}
                          fill="url(#donFill)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              <Card className="p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-stone-500" aria-hidden />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Succeeded total by payment method
                  </h3>
                </div>
                {methodSeries.length === 0 ? (
                  <p className="py-16 text-center text-sm text-stone-400">No breakdown yet.</p>
                ) : (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={methodSeries} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="#a8a29e" />
                        <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 11 }} stroke="#a8a29e" />
                        <Tooltip
                          formatter={(value: number | undefined, _name: string, item: { payload?: { count?: number } }) =>
                            [
                              `${Number(value ?? 0).toLocaleString()} ${cy} (${item?.payload?.count ?? 0} gifts)`,
                              "Succeeded",
                            ]
                          }
                          {...chartTooltip}
                        />
                        <Bar dataKey="amount" fill="#7A1515" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </div>

            <Card className="overflow-hidden border-stone-200/60 p-0">
              <div className="border-b border-stone-100 bg-stone-50 px-6 py-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Status overview</h3>
                <p className="mt-1 text-xs text-stone-500">Count and gross amount stored per attempt</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stone-200 bg-white text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    <tr>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Attempts</th>
                      <th className="px-6 py-3">Sum of amounts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {statusSeries.map((s) => (
                      <tr key={s.status}>
                        <td className="px-6 py-3 font-semibold capitalize text-stone-800">{s.status}</td>
                        <td className="px-6 py-3 tabular-nums text-stone-600">{s.count}</td>
                        <td className="px-6 py-3 tabular-nums font-medium text-stone-800">
                          {s.amount.toLocaleString()} {cy}
                        </td>
                      </tr>
                    ))}
                    {statusSeries.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-stone-400">
                          No donation rows.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="overflow-hidden border-stone-200/60 p-0">
              <div className="border-b border-stone-100 bg-stone-50 px-6 py-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Recent attempts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stone-200 bg-white text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    <tr>
                      <th className="px-6 py-3">Donor</th>
                      <th className="px-6 py-3">Payment</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {donations.slice(0, 40).map((d) => (
                      <tr key={d.id}>
                        <td className="px-6 py-3">
                          <span className="font-medium text-stone-800">{d.donor_name?.trim() || "Anonymous"}</span>
                          {d.donor_email?.trim() ? (
                            <span className="block text-[10px] text-stone-400">{d.donor_email}</span>
                          ) : null}
                        </td>
                        <td className="px-6 py-3 text-xs text-stone-600">{paymentLabel(d.payment_method || "")}</td>
                        <td className="px-6 py-3 font-semibold tabular-nums">
                          {(Number(d.amount) || 0).toLocaleString()} {d.currency || cy}
                        </td>
                        <td className="px-6 py-3 text-xs font-semibold capitalize">{d.status}</td>
                        <td className="px-6 py-3 text-xs text-stone-500">
                          {new Date(d.created_at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                      </tr>
                    ))}
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                          No rows for this view.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
