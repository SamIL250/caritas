"use client";

import React, { useEffect, useState } from "react";
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
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";
import { Activity, Database, Heart, Loader2, ShieldAlert, Timer } from "lucide-react";
import { Card } from "@/components/ui/Card";

export type DonationsDayPoint = { day: string; amount: number; label: string };
export type AuditDayPoint = { day: string; count: number; label: string };

type HealthJson = {
  ok: boolean;
  timestamp: string;
  environment: string;
  checks: { database: { ok: boolean; latencyMs: number; message?: string } };
};

const chartTooltip = {
  contentStyle: {
    borderRadius: 10,
    border: "1px solid #e7e5e4",
    fontSize: 12,
  },
  labelStyle: { fontWeight: 600, color: "#44403c" },
};

function formatMs(n: number | undefined) {
  if (n == null) return "—";
  return `${Math.round(n)} ms`;
}

function WebVitalsBlock() {
  const [lcp, setLcp] = useState<number | undefined>();
  const [inp, setInp] = useState<number | undefined>();
  const [cls, setCls] = useState<number | undefined>();
  const [fcp, setFcp] = useState<number | undefined>();
  const [ttfb, setTtfb] = useState<number | undefined>();

  useEffect(() => {
    const toNum = (set: (n: number) => void) => (m: Metric) => set(m.value);
    const opts = { reportAllChanges: true } as const;
    onLCP(toNum(setLcp), opts);
    onINP(toNum(setInp), opts);
    onCLS(toNum(setCls), opts);
    onFCP(toNum(setFcp), opts);
    onTTFB(toNum(setTtfb), opts);
  }, []);

  const row = (label: string, value: string) => (
    <div className="flex items-center justify-between gap-3 border-b border-stone-100 py-2 text-sm last:border-0">
      <span className="text-stone-500">{label}</span>
      <span className="font-mono text-xs font-semibold text-stone-800 tabular-nums">{value}</span>
    </div>
  );

  return (
    <div>
      {row("LCP (largest contentful paint)", formatMs(lcp))}
      {row("INP (interaction to next paint)", formatMs(inp))}
      {row("CLS (layout shift)", cls != null ? cls.toFixed(3) : "—")}
      {row("FCP (first contentful paint)", formatMs(fcp))}
      {row("TTFB (time to first byte)", formatMs(ttfb))}
      <p className="mt-2 text-[10px] leading-snug text-stone-400">
        Values update as you use this page. Error reporting uses{" "}
        <span className="font-medium text-stone-600">Sentry</span> when{" "}
        <code className="rounded bg-stone-100 px-0.5">NEXT_PUBLIC_SENTRY_DSN</code> is set.
      </p>
    </div>
  );
}

function HealthPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        ok ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80" : "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </div>
  );
}

export function OverviewMonitoringPanel({
  donationSeries,
  auditSeries,
}: {
  donationSeries: DonationsDayPoint[];
  auditSeries: AuditDayPoint[];
}) {
  const [health, setHealth] = useState<HealthJson | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const json = (await res.json()) as HealthJson;
        if (!cancel) {
          setHealth(json);
          setHealthError(json?.ok && json?.checks?.database?.ok ? null : json?.checks?.database?.message || "Degraded");
        }
      } catch (e) {
        if (!cancel) setHealthError(e instanceof Error ? e.message : "Health check failed");
      } finally {
        if (!cancel) setHealthLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-stone-800">System health & monitoring</h3>
            <p className="text-sm text-stone-500">Live status, key metrics, and the last 14 days of activity.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-stone-200/90 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-stone-800">
              <Database className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
              <span className="text-sm font-bold">Service status</span>
            </div>
            {healthLoading ? (
              <div className="flex items-center gap-2 py-2 text-stone-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Checking…</span>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <HealthPill
                    ok={!!health?.checks.database.ok}
                    label={health?.checks.database.ok ? "Database online" : "Database issue"}
                  />
                  <HealthPill ok={!healthError} label={healthError ? "API degraded" : "API healthy"} />
                </div>
                <p className="text-xs text-stone-500">
                  DB latency:{" "}
                  <span className="font-mono font-semibold text-stone-700">
                    {health != null ? `${health.checks.database.latencyMs} ms` : "—"}
                  </span>
                </p>
                <p className="text-[10px] uppercase tracking-wider text-stone-400">
                  Environment: {health?.environment || "—"} · {health?.timestamp?.slice(0, 19) || ""}
                </p>
                {healthError && (
                  <p className="flex items-start gap-1.5 text-xs text-amber-800">
                    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {healthError}
                  </p>
                )}
              </div>
            )}
          </Card>

          <Card className="border-stone-200/90 p-4 sm:p-5 lg:col-span-2">
            <div className="mb-1 flex items-center gap-2 text-stone-800">
              <Timer className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
              <span className="text-sm font-bold">This session (Core Web Vitals)</span>
            </div>
            <WebVitalsBlock />
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-stone-200/90 p-3 sm:p-4">
          <div className="mb-1 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="text-sm font-bold text-stone-800">CMS activity</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Audit events / day</span>
          </div>
          <div className="h-[220px] w-full min-h-0 sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={auditSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#78716c" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="count" fill="var(--color-primary)" fillOpacity={0.88} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-stone-200/90 p-3 sm:p-4">
          <div className="mb-1 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-600" />
              <span className="text-sm font-bold text-stone-800">Donations</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">RWF / day (succeeded)</span>
          </div>
          <div className="h-[220px] w-full min-h-0 sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={donationSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="donFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#78716c" }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
                />
                <Tooltip
                  {...chartTooltip}
                  formatter={(value: number) => [`${value.toLocaleString()} RWF`, "Amount"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#donFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="border-dashed border-stone-200 bg-stone-50/40 p-4 sm:p-5">
        <h4 className="text-sm font-bold text-stone-800">Errors & APM in production</h4>
        <p className="mt-1 max-w-3xl text-sm text-stone-600">
          For <strong>crash reporting</strong>, <strong>release health</strong>, and <strong>server-side performance</strong>, we recommend
          connecting{" "}
          <a
            className="font-semibold text-[var(--color-primary)] underline decoration-[var(--color-primary)]/30 underline-offset-2 hover:decoration-[var(--color-primary)]"
            href="https://docs.sentry.io/platforms/javascript/guides/nextjs/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sentry for Next.js
          </a>
          . Set <code className="rounded bg-stone-200/80 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_SENTRY_DSN</code> and run the
          Sentry wizard to enable dashboards and alerts in their UI.
        </p>
      </Card>
    </div>
  );
}
