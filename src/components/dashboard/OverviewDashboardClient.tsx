"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  Newspaper,
  Megaphone,
  Heart,
  Users,
  Mail,
  MessageSquare,
  HandHeart,
  ArrowUpRight,
  Activity,
  ExternalLink,
  Settings,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import type {
  ContentStatusBreakdown,
  DonationSummary,
  EngagementSummary,
  RecentContentItem,
} from "@/lib/overview-analytics";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export type DonationsDayPoint = { day: string; amount: number; label: string };

export type OverviewDashboardProps = {
  contentBreakdowns: ContentStatusBreakdown[];
  donationSeries: DonationsDayPoint[];
  donationSummary: DonationSummary;
  engagement: EngagementSummary;
  recentItems: RecentContentItem[];
  totalMedia: number;
  totalDonationCampaigns: number;
};

/* ------------------------------------------------------------------ */
/*  Tooltip shared style                                               */
/* ------------------------------------------------------------------ */

const tooltipStyle = {
  contentStyle: {
    borderRadius: 8,
    border: "1px solid #e7e5e4",
    fontSize: 12,
    background: "#fff",
    padding: "8px 12px",
  } as React.CSSProperties,
  labelStyle: { fontWeight: 600, color: "#44403c" } as React.CSSProperties,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function statusDot(status: string): string {
  switch (status) {
    case "published":
      return "bg-emerald-500";
    case "draft":
    case "pending_review":
      return "bg-amber-400";
    case "archived":
    case "cancelled":
      return "bg-stone-300";
    default:
      return "bg-stone-300";
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  href?: string;
  accent?: string;
}) {
  const inner = (
    <Card className="group border-stone-200/80 transition-[border-color] duration-200 hover:border-[var(--color-primary)]/20">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-100 bg-stone-50 text-stone-500 transition-colors duration-200 group-hover:border-[var(--color-primary)]/15 group-hover:bg-[var(--color-primary)]/5 group-hover:text-[var(--color-primary)]">
          <Icon size={18} />
        </div>
        {href && (
          <div className="text-stone-300 transition-colors group-hover:text-[var(--color-primary)]">
            <ArrowUpRight size={14} />
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
          {label}
        </p>
        <p
          className="mt-0.5 text-xl font-bold text-stone-800 tabular-nums"
          style={accent ? { color: accent } : undefined}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

/* ------------------------------------------------------------------ */
/*  Mini stat (inline label + number)                                  */
/* ------------------------------------------------------------------ */

function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-stone-100 py-2.5 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-stone-100 bg-stone-50 text-stone-400">
        <Icon size={14} />
      </div>
      <div className="flex-1">
        <p className="text-[11px] font-medium text-stone-500">{label}</p>
      </div>
      <p className="text-sm font-bold text-stone-800 tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : String(value)}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Donation mini stats                                                */
/* ------------------------------------------------------------------ */

function DonationMiniStats({ summary }: { summary: DonationSummary }) {
  const items = [
    { label: "Succeeded", value: summary.totalSucceeded, color: "text-emerald-600" },
    { label: "Pending", value: summary.totalPending, color: "text-amber-600" },
    { label: "Failed", value: summary.totalFailed, color: "text-red-600" },
    { label: "Refunded", value: summary.totalRefunded, color: "text-stone-500" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="inline-flex items-center gap-1.5 rounded-md border border-stone-100 bg-stone-50 px-2.5 py-1"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${item.color.replace("text-", "bg-")}`} />
          <span className="text-[11px] font-semibold text-stone-500">{item.label}</span>
          <span className="text-xs font-bold text-stone-800 tabular-nums">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Charts                                                             */
/* ------------------------------------------------------------------ */

function ContentStatusChart({ data }: { data: ContentStatusBreakdown[] }) {
  if (!data.length) return null;

  const primary = "var(--color-primary)";
  const draftColor = "#a8a29e";
  const archivedColor = "#d6d3d1";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-stone-800">Content status</h3>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-stone-500">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: primary }} />
            Published
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-stone-500">
            <span className="h-2.5 w-2.5 rounded-sm bg-stone-400" />
            Draft
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-stone-500">
            <span className="h-2.5 w-2.5 rounded-sm bg-stone-200" />
            Archived
          </span>
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, left: -12, bottom: 0 }}
            barGap={4}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#78716c" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#78716c" }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number, name: string) => [
                value,
                name === "published" ? "Published" : name === "draft" ? "Draft" : "Archived",
              ]}
            />
            <Bar dataKey="published" stackId="a" fill={primary} radius={[3, 3, 0, 0]} maxBarSize={40} />
            <Bar dataKey="draft" stackId="a" fill={draftColor} radius={[3, 3, 0, 0]} maxBarSize={40} />
            {data[0]?.archived !== undefined && (
              <Bar dataKey="archived" stackId="a" fill={archivedColor} radius={[3, 3, 0, 0]} maxBarSize={40} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DonationAreaChart({ data: fullData }: { data: DonationsDayPoint[] }) {
  if (!fullData.length) return null;

  const [selectedDays, setSelectedDays] = useState(14);
  const ranges = [7, 14, 30, 60, 90] as const;

  const sliced = fullData.slice(-selectedDays);
  const total = sliced.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-stone-800">Donations</h3>
          <p className="mt-0.5 text-xs text-stone-400">
            {total.toLocaleString()} RWF total succeeded
          </p>
        </div>
        <div className="flex shrink-0 gap-1 rounded-lg border border-stone-200 bg-stone-50 p-0.5">
          {ranges.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setSelectedDays(days)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                selectedDays === days
                  ? "bg-white text-stone-800 border border-stone-300"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      <div className="h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sliced} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="donArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#78716c" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#78716c" }}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number) => [`${value.toLocaleString()} RWF`, "Donations"]}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#donArea)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: "var(--color-primary)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function OverviewDashboardClient({
  contentBreakdowns,
  donationSeries,
  donationSummary,
  engagement,
  recentItems,
  totalMedia,
  totalDonationCampaigns,
}: OverviewDashboardProps) {
  const primary = "var(--color-primary)";

  return (
    <div className="w-full space-y-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
      {/* ── Welcome ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-stone-800">
          Dashboard overview
        </h2>
        <p className="text-sm text-stone-500">
          All your content, donations, and engagement metrics at a glance.
        </p>
      </div>

      {/* ── Stats row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Pages"
          value={contentBreakdowns.find((c) => c.type === "pages")?.total ?? 0}
          icon={FileText}
          href="/dashboard/pages"
        />
        <StatCard
          label="News articles"
          value={contentBreakdowns.find((c) => c.type === "news_articles")?.total ?? 0}
          icon={Newspaper}
          href="/dashboard/news"
        />
        <StatCard
          label="Donations raised"
          value={`${donationSummary.totalAmountRwf.toLocaleString()} RWF`}
          icon={Heart}
          href="/dashboard/donations"
          accent="#b91c1c"
        />
        <StatCard
          label="Subscribers"
          value={engagement.newsletterActive}
          icon={Mail}
          href="/dashboard/newsletter"
        />
        <StatCard
          label="Pending volunteers"
          value={engagement.volunteerPending}
          icon={HandHeart}
          href="/dashboard/volunteers"
        />
        <StatCard
          label="Unread messages"
          value={engagement.contactNew}
          icon={MessageSquare}
          href="/dashboard/contact"
        />
      </div>

      {/* ── Charts row ─────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-stone-200/80 p-4 sm:p-5">
          <ContentStatusChart data={contentBreakdowns} />
        </Card>
        <Card className="border-stone-200/80 p-4 sm:p-5">
          <DonationAreaChart data={donationSeries} />
        </Card>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Engagement stats */}
        <Card className="border-stone-200/80 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={16} className="text-[var(--color-primary)]" />
            <h3 className="text-sm font-bold text-stone-800">Engagement</h3>
          </div>
          <div className="space-y-0">
            <MiniStat
              label="Newsletter subscribers"
              value={engagement.newsletterActive}
              icon={Mail}
            />
            <MiniStat
              label="Newsletter broadcasts sent"
              value={engagement.newsletterBroadcasts}
              icon={Mail}
            />
            <MiniStat
              label="Contact messages"
              value={engagement.contactTotal}
              icon={MessageSquare}
            />
            <MiniStat
              label="Volunteer applications"
              value={engagement.volunteerTotal}
              icon={HandHeart}
            />
            <MiniStat label="Media files" value={totalMedia} icon={FileText} />
            <MiniStat
              label="Donation campaigns"
              value={totalDonationCampaigns}
              icon={Megaphone}
            />
          </div>
        </Card>

        {/* Quick actions & mini cards */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-400 px-0.5">
            Quick actions
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href="/dashboard/pages"
              className="group flex items-center gap-3 rounded-lg border border-stone-200/80 bg-white px-4 py-3 transition-[border-color] duration-200 hover:border-[var(--color-primary)]/25"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-100 bg-stone-50 text-stone-400 transition-colors group-hover:border-[var(--color-primary)]/15 group-hover:bg-[var(--color-primary)]/5 group-hover:text-[var(--color-primary)]">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-stone-800">Create a page</p>
                <p className="truncate text-[10px] font-medium text-stone-400">
                  Add content to the website
                </p>
              </div>
            </Link>
            <Link
              href="/dashboard/community-campaigns/new"
              className="group flex items-center gap-3 rounded-lg border border-stone-200/80 bg-white px-4 py-3 transition-[border-color] duration-200 hover:border-[var(--color-primary)]/25"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-100 bg-stone-50 text-stone-400 transition-colors group-hover:border-[var(--color-primary)]/15 group-hover:bg-[var(--color-primary)]/5 group-hover:text-[var(--color-primary)]">
                <Megaphone size={16} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-stone-800">New campaign</p>
                <p className="truncate text-[10px] font-medium text-stone-400">
                  Start a fundraising campaign
                </p>
              </div>
            </Link>
            <Link
              href="/dashboard/users"
              className="group flex items-center gap-3 rounded-lg border border-stone-200/80 bg-white px-4 py-3 transition-[border-color] duration-200 hover:border-[var(--color-primary)]/25"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-100 bg-stone-50 text-stone-400 transition-colors group-hover:border-[var(--color-primary)]/15 group-hover:bg-[var(--color-primary)]/5 group-hover:text-[var(--color-primary)]">
                <Users size={16} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-stone-800">Manage users</p>
                <p className="truncate text-[10px] font-medium text-stone-400">
                  Invite editors &amp; admins
                </p>
              </div>
            </Link>
            <Link
              href="/dashboard/settings"
              className="group flex items-center gap-3 rounded-lg border border-stone-200/80 bg-white px-4 py-3 transition-[border-color] duration-200 hover:border-[var(--color-primary)]/25"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-100 bg-stone-50 text-stone-400 transition-colors group-hover:border-[var(--color-primary)]/15 group-hover:bg-[var(--color-primary)]/5 group-hover:text-[var(--color-primary)]">
                <Settings size={16} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-stone-800">Site settings</p>
                <p className="truncate text-[10px] font-medium text-stone-400">
                  Site name, logo, email config
                </p>
              </div>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Donation summary mini card */}
            <Card className="border-stone-200/80 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Heart size={14} className="text-rose-600" />
                <h4 className="text-xs font-bold text-stone-800">Donation details</h4>
              </div>
              <DonationMiniStats summary={donationSummary} />
              <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                <span className="text-stone-500">Avg. gift</span>
                <span className="font-bold text-stone-800 tabular-nums">
                  {donationSummary.averageAmount.toLocaleString()} RWF
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="text-stone-500">Unique donors</span>
                <span className="font-bold text-stone-800 tabular-nums">
                  {donationSummary.donorCount}
                </span>
              </div>
              <Link
                href="/dashboard/donations"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-800"
              >
                View all donations
                <ExternalLink size={12} />
              </Link>
            </Card>

            {/* Support card */}
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Settings size={14} className="text-stone-400" />
                <h4 className="text-xs font-bold text-stone-700">Need help?</h4>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                Questions about your dashboard or content management? 
                Reach out to us at{" "}
                <a
                  href="mailto:info@lerony.com"
                  className="font-semibold text-[var(--color-primary)] underline decoration-[var(--color-primary)]/20 underline-offset-2 hover:decoration-[var(--color-primary)]/60"
                >
                  info@lerony.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent activity ────────────────────────────────────── */}
      <Card className="border-stone-200/80 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[var(--color-primary)]" />
            <h3 className="text-sm font-bold text-stone-800">Recent activity</h3>
          </div>
          <span className="text-[10px] font-medium text-stone-400">
            Across all content types
          </span>
        </div>

        {recentItems.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {recentItems.map((item, i) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="flex items-center gap-3 py-2.5 transition-colors hover:bg-stone-50/80 -mx-2 px-2 rounded-lg"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${statusDot(item.status)}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-stone-800 truncate">
                      {item.title}
                    </span>
                    <span className="shrink-0 rounded border border-stone-100 bg-stone-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-stone-500">
                      {item.typeLabel}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-stone-400">
                  {timeAgo(item.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Activity size={24} className="text-stone-200 mb-2" />
            <p className="text-sm font-medium text-stone-400">No content yet.</p>
            <p className="text-xs text-stone-400 mt-0.5">
              Create your first page or article to get started.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
