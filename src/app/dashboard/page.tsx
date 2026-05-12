import React from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { FileText, MonitorPlay, Heart, Users, ArrowUpRight, Activity, Zap, Image as ImageIcon, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAuditEventsByDay, getDonationsByDay } from "@/lib/overview-analytics";
import { OverviewMonitoringPanel } from "@/components/dashboard/OverviewMonitoringPanel";

export const metadata = {
  title: "Overview - Caritas Rwanda CMS",
};

export default async function OverviewPage() {
  const supabase = await createClient();

  // Fetch stats concurrently
  const [
    { count: pagesCount },
    { count: campaignsCount },
    { count: usersCount },
    { data: donations },
    { data: recentActivity },
    donationSeries,
    auditSeries,
  ] = await Promise.all([
    supabase.from('pages').select('*', { count: 'exact', head: true }),
    supabase
      .from("community_campaigns")
      .select("*", { count: "exact", head: true })
      .eq("donations_enabled", true)
      .eq("status", "published"),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('donations').select('amount').eq('status', 'succeeded'),
    supabase.from('audit_logs').select('action, table_name, created_at, profiles(full_name)').order('created_at', { ascending: false }).limit(5),
    getDonationsByDay(supabase, 14),
    getAuditEventsByDay(supabase, 14),
  ]);

  const totalDonationsRwf = (donations || []).reduce((acc: number, curr: any) => acc + curr.amount, 0);

  const stats = [
    { label: "Total Pages", value: pagesCount || 0, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Campaigns", value: campaignsCount || 0, icon: MonitorPlay, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Donations", value: `${totalDonationsRwf.toLocaleString()} RWF`, icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Registered Users", value: usersCount || 0, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="w-full motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
      <Topbar />

      <div className="space-y-8 sm:space-y-9">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-800">Welcome to your Dashboard</h2>
            <p className="mt-1 max-w-md text-stone-500">Manage your content, monitor donations, and collaborate with your team all in one place.</p>
          </div>
          <div className="flex shrink-0 gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-200/80 bg-stone-50 text-stone-500">
              <Zap size={20} aria-hidden />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dash-stagger grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i} className="group transition-[border-color,transform] duration-200 hover:border-[var(--color-primary)]/25 motion-reduce:transition-none">
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color} transition-transform duration-200 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100`}>
                  <stat.icon size={22} />
                </div>
                <div className="text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={16} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400">{stat.label}</p>
                <h3 className="text-xl font-bold text-stone-800 mt-1">{stat.value}</h3>
              </div>
            </Card>
          ))}
        </div>

        <OverviewMonitoringPanel donationSeries={donationSeries} auditSeries={auditSeries} />

        {/* Bottom Section */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-stone-200/80">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-[var(--color-primary)]" />
                <h3 className="text-lg font-bold text-stone-800">Recent Activity</h3>
              </div>
              <button className="text-xs font-bold text-[var(--color-primary)] hover:underline uppercase tracking-wider">View All</button>
            </div>
            
            <div className="space-y-6">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity: any, i: number) => (
                  <div key={i} className="flex gap-4 relative group">
                    {i !== recentActivity.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-stone-100 group-hover:bg-stone-200 transition-colors"></div>
                    )}
                    <div className="h-8 w-8 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 relative z-10">
                      <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-pulse"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-semibold text-stone-700 capitalize">
                        {activity.action} {activity.table_name.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                        <span>{new Date(activity.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        <span className="h-1 w-1 rounded-full bg-stone-300"></span>
                        <span>{activity.profiles?.full_name || 'System Administrator'}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-3">
                    <Activity size={24} />
                  </div>
                  <p className="text-sm text-stone-400 font-medium">No activity recorded yet.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 px-1">Quick Actions</h3>
            <div className="grid gap-3">
              {[
                { title: "Create New Page", desc: "Add content to the website", icon: FileText, href: "/dashboard/pages" },
                { title: "Active Campaigns", desc: "Manage current donations", icon: Heart, href: "/dashboard/donations" },
                { title: "Upload Media", desc: "Add images and files", icon: ImageIcon, href: "/dashboard/media" },
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="group block w-full rounded-xl border border-stone-200/80 bg-white p-4 text-left transition-[border-color,transform] duration-200 hover:border-[var(--color-primary)]/35 active:scale-[0.99] motion-reduce:transition-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-50 text-stone-400 transition-colors duration-200 group-hover:bg-[var(--color-primary)]/8 group-hover:text-[var(--color-primary)]">
                      <action.icon size={18} aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-800">{action.title}</p>
                      <p className="mt-0.5 text-[10px] font-medium text-stone-400">{action.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl border border-stone-800 bg-stone-900 p-6 text-white">
              <div className="relative z-10">
                <h4 className="text-sm font-bold">Need help?</h4>
                <p className="mt-1 text-[10px] leading-relaxed text-white/65">Check our documentation or contact the administrator for support.</p>
                <button
                  type="button"
                  className="mt-4 rounded-lg bg-white/12 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 hover:bg-white/20"
                >
                  Contact Support
                </button>
              </div>
              <div className="pointer-events-none absolute -bottom-4 -right-4 text-white/10 transition-transform duration-300 motion-reduce:transition-none group-hover:scale-105">
                <Settings size={80} aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

