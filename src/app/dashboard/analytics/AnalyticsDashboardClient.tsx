"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  Cell,
} from "recharts";
import {
  Eye,
  Newspaper,
  BookOpen,
  Grid3x3,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Globe,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { TopItem, ViewsByDay, CategoryBreakdown, LocationBreakdown } from "@/lib/page-analytics";
import { getRegionsForCountry } from "@/app/actions/analytics";

/* ────── Props ────── */

type Props = {
  totalViews: { page_type: string; total: number }[];
  viewsByDay: ViewsByDay[];
  topNews: TopItem[];
  topPublications: TopItem[];
  topPrograms: TopItem[];
  newsCatBreakdown: CategoryBreakdown[];
  pubCatBreakdown: CategoryBreakdown[];
  progCatBreakdown: CategoryBreakdown[];
  viewsByCountry: LocationBreakdown[];
};

/* ────── Helpers ────── */

const typeLabel: Record<string, string> = {
  news_article: "News",
  publication: "Publications",
  program: "Programs",
};

const typeIcon: Record<string, any> = {
  news_article: Newspaper,
  publication: BookOpen,
  program: Grid3x3,
};

const COLORS = ["#7A1515", "#C0392B", "#E67E22", "#F1C40F", "#2ECC71", "#3498DB", "#9B59B6", "#1ABC9C", "#E74C3C", "#34495E"];

const tooltipStyle: any = {
  contentStyle: { borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 13 },
};

/* ────── Component ────── */

export function AnalyticsDashboardClient({
  totalViews,
  viewsByDay,
  topNews,
  topPublications,
  topPrograms,
  newsCatBreakdown,
  pubCatBreakdown,
  progCatBreakdown,
  viewsByCountry,
}: Props) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [regionData, setRegionData] = useState<LocationBreakdown[] | null>(null);
  const [loadingRegion, setLoadingRegion] = useState(false);
  const grandTotal = totalViews.reduce((acc, r) => acc + r.total, 0);

  async function handleSelectCountry(country: string) {
    if (country === selectedCountry) {
      setSelectedCountry(null);
      setRegionData(null);
      return;
    }
    setSelectedCountry(country);
    setLoadingRegion(true);
    try {
      const regions = await getRegionsForCountry(country);
      setRegionData(regions);
    } finally {
      setLoadingRegion(false);
    }
  }

  const totalByType = [
    { name: "News", value: totalViews.find((r) => r.page_type === "news_article")?.total ?? 0, color: "#7A1515" },
    { name: "Publications", value: totalViews.find((r) => r.page_type === "publication")?.total ?? 0, color: "#C0392B" },
    { name: "Programs", value: totalViews.find((r) => r.page_type === "program")?.total ?? 0, color: "#E67E22" },
  ];

  return (
    <div className="w-full space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Content Analytics</h1>
          <p className="mt-1 text-sm text-stone-500">
            Track reader engagement across news, publications, and programs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {viewsByCountry.length > 0 && (
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-stone-400 shrink-0" aria-hidden />
              <select
                className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7A1515]/30"
                value={selectedCountry || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) handleSelectCountry(val);
                  else {
                    setSelectedCountry(null);
                    setRegionData(null);
                  }
                }}
                aria-label="Filter by country"
              >
                <option value="">All countries</option>
                {viewsByCountry.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              {selectedCountry && regionData && regionData.length > 0 && (
                <select
                  className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7A1515]/30"
                  aria-label="Filter by region"
                >
                  <option value="">All regions</option>
                  {regionData.map((r) => (
                    <option key={r.name} value={r.name}>{r.name} ({r.views})</option>
                  ))}
                </select>
              )}
            </div>
          )}
          <Button
            variant="secondary"
            className="h-9 gap-2"
            disabled={isRefreshing}
            onClick={() => startTransition(() => router.refresh())}
          >
            {isRefreshing ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <RefreshCw size={16} aria-hidden />}
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7A1515]/10 text-[#7A1515]">
            <Eye size={24} aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-900">{grandTotal.toLocaleString()}</p>
            <p className="text-xs text-stone-500">Total page views</p>
          </div>
        </Card>
        {totalByType.map((t) => {
          const Icon = t.name === "News" ? Newspaper : t.name === "Publications" ? BookOpen : Grid3x3;
          return (
            <Card key={t.name} className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${t.color}15`, color: t.color }}>
                <Icon size={24} aria-hidden />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{t.value.toLocaleString()}</p>
                <p className="text-xs text-stone-500">{t.name}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Location Breakdown ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {selectedCountry ? (
          <LocationCard
            title={`Regions in ${selectedCountry}`}
            data={regionData || []}
            emptyMessage={loadingRegion ? "Loading…" : "No region data available."}
            loading={loadingRegion}
            onBack={() => {
              setSelectedCountry(null);
              setRegionData(null);
            }}
          />
        ) : (
          <LocationCard
            title="Views by country"
            data={viewsByCountry}
            emptyMessage="No location data yet — will populate as readers visit content."
          />
        )}
      </div>

      {/* ── Views Over Time ── */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-[#7A1515]" aria-hidden />
          <h2 className="text-lg font-bold text-stone-800">Views over time (30 days)</h2>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={viewsByDay} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="newsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7A1515" stopOpacity={0.25} /><stop offset="95%" stopColor="#7A1515" stopOpacity={0.02} /></linearGradient>
                <linearGradient id="pubGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C0392B" stopOpacity={0.25} /><stop offset="95%" stopColor="#C0392B" stopOpacity={0.02} /></linearGradient>
                <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E67E22" stopOpacity={0.25} /><stop offset="95%" stopColor="#E67E22" stopOpacity={0.02} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="news_article" name="News" stroke="#7A1515" fill="url(#newsGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="publication" name="Publications" stroke="#C0392B" fill="url(#pubGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="program" name="Programs" stroke="#E67E22" fill="url(#progGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── Top Viewed Grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TopViewedCard title="Most viewed news" icon={Newspaper} items={topNews} color="#7A1515" />
        <TopViewedCard title="Most viewed publications" icon={BookOpen} items={topPublications} color="#C0392B" />
        <TopViewedCard title="Most viewed programs" icon={Grid3x3} items={topPrograms} color="#E67E22" />
      </div>

      {/* ── Category Breakdown ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CategoryBreakdownCard
          title="News by category"
          data={newsCatBreakdown}
          color="#7A1515"
        />
        <CategoryBreakdownCard
          title="Publications by category"
          data={pubCatBreakdown}
          color="#C0392B"
        />
        <CategoryBreakdownCard
          title="Programs by category"
          data={progCatBreakdown}
          color="#E67E22"
        />
      </div>
    </div>
  );
}

/* ────── Sub-components ────── */

function TopViewedCard({
  title,
  icon: Icon,
  items,
  color,
}: {
  title: string;
  icon: any;
  items: TopItem[];
  color: string;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={18} style={{ color }} aria-hidden />
        <h3 className="text-sm font-bold text-stone-800">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-xs text-stone-400">No data yet</p>
      ) : (
        <div className="space-y-2">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={items.map((i) => ({ name: i.title.length > 30 ? i.title.slice(0, 30) + "…" : i.title, views: i.total_views }))}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="views" fill={color} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  );
}

function LocationCard({
  title,
  data,
  emptyMessage,
  onSelect,
  onBack,
  loading,
}: {
  title: string;
  data: LocationBreakdown[];
  emptyMessage: string;
  onSelect?: (name: string) => void;
  onBack?: () => void;
  loading?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mr-1 rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            title="Back to countries"
          >
            <ArrowLeft size={16} aria-hidden />
          </button>
        )}
        <Globe size={18} className="text-[#7A1515]" aria-hidden />
        <h3 className="text-sm font-bold text-stone-800">{title}</h3>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-stone-400" />
        </div>
      ) : data.length === 0 ? (
        <p className="py-6 text-center text-xs text-stone-400">{emptyMessage}</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.map((d) => ({ name: d.name.length > 20 ? d.name.slice(0, 20) + "…" : d.name, views: d.views }))}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              <Bar
                dataKey="views"
                radius={[0, 4, 4, 0]}
                cursor={onSelect ? "pointer" : "default"}
                onClick={(entry: any) => {
                  if (onSelect && entry?.name) onSelect(entry.name);
                }}
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

function CategoryBreakdownCard({
  title,
  data,
  color,
}: {
  title: string;
  data: CategoryBreakdown[];
  color: string;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 size={18} style={{ color }} aria-hidden />
        <h3 className="text-sm font-bold text-stone-800">{title}</h3>
      </div>
      {data.length === 0 ? (
        <p className="py-6 text-center text-xs text-stone-400">No data yet</p>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.map((d) => ({ name: d.name, views: d.views }))} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
