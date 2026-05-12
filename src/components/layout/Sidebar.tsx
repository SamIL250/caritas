"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Newspaper,
  BookOpen,
  Megaphone,
  Image as ImageIcon, 
  Heart, 
  Users, 
  Settings,
  LogOut,
  X,
  ChevronRight,
  UserCircle,
  Grid3x3,
  HandHeart,
  CalendarDays,
  Mail,
  MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isDashboardNavActive } from "@/lib/dashboard-nav";

const navGroups = [
  {
    label: "Main",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Pages", href: "/dashboard/pages", icon: FileText },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "News", href: "/dashboard/news", icon: Newspaper },
      { name: "Programs", href: "/dashboard/programs", icon: Grid3x3 },
      { name: "Publications", href: "/dashboard/publications", icon: BookOpen },
      { name: "Campaigns", href: "/dashboard/community-campaigns", icon: Megaphone },
      { name: "Media", href: "/dashboard/media", icon: ImageIcon },
      { name: "Donations", href: "/dashboard/donations", icon: Heart },
      { name: "Volunteers", href: "/dashboard/volunteers", icon: HandHeart },
      { name: "Events", href: "/dashboard/events", icon: CalendarDays },
      { name: "Newsletter", href: "/dashboard/newsletter", icon: Mail },
      { name: "Contact inbox", href: "/dashboard/contact", icon: MessageSquare },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
      { name: "Users", href: "/dashboard/users", icon: Users },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  profile?: any;
  /** Server-rendered count; Sidebar refetches on dashboard navigations to stay in sync after CRUD. */
  initialPagesCount?: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ profile, initialPagesCount = 0, isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [pagesCount, setPagesCount] = useState<number>(initialPagesCount);

  useEffect(() => {
    if (!pathname?.startsWith("/dashboard")) return;
    let cancelled = false;
    void (async () => {
      const { count, error } = await supabase.from("pages").select("*", { count: "exact", head: true });
      if (!cancelled && !error) setPagesCount(count ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const fullName = profile?.full_name || "Unknown User";
  const roleName = profile?.role === "admin" ? "Administrator" : "Editor";
  const initials = fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "??";

  const SidebarContent = (
    <div className="flex h-full flex-col bg-white">
      {/* Brand Header */}
      <div className="flex min-h-[4rem] items-center px-4 sm:px-5 border-b border-stone-200/80 dash-sidebar-brand">
        <Link
          href="/dashboard"
          className="flex min-w-0 flex-1 items-center gap-2"
          onClick={() => setIsOpen(false)}
        >
          <span className="relative block h-9 w-[148px] shrink-0">
            <Image
              src="/logo_bg.png"
              alt="Caritas Rwanda CMS"
              fill
              sizes="148px"
              className="object-contain object-left"
              priority
            />
          </span>
          <span className="sr-only">Caritas CMS — home</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="ml-auto shrink-0 rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="custom-scrollbar flex-1 space-y-7 overflow-y-auto px-3 py-5 sm:px-3.5">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
              {group.label}
            </h4>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = isDashboardNavActive(pathname, item.href);
                const badge =
                  item.href === "/dashboard/pages"
                    ? String(pagesCount)
                    : "badge" in item && item.badge != null
                      ? String(item.badge)
                      : undefined;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`group flex min-h-10 items-center justify-between rounded-lg px-3 py-2.5 text-[13px] leading-tight transition-[background-color,color,transform] duration-200 motion-reduce:transition-none ${
                      isActive
                        ? "bg-[var(--color-primary)] text-white ring-1 ring-[var(--color-primary)]/90"
                        : "text-stone-600 hover:bg-stone-50/90 hover:text-[var(--color-primary)] active:scale-[0.99]"
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon 
                        size={18} 
                        className={`mr-3 transition-colors ${isActive ? "text-white" : "text-stone-400 group-hover:text-[var(--color-primary)]"}`} 
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {badge ? (
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"}`}>
                        {badge}
                      </span>
                    ) : (
                      isActive && <ChevronRight size={14} className="text-white/50" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Profile Footer */}
      <div className="mt-auto border-t border-stone-200/80 bg-stone-50/50 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="relative group shrink-0">
            <div className="h-10 w-10 rounded-full bg-stone-900 flex items-center justify-center text-white font-bold text-xs ring-1 ring-stone-200 transition-transform duration-200 motion-reduce:transition-none group-hover:scale-[1.02]">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-stone-800 truncate" title={fullName}>{fullName}</p>
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.15em] mt-0.5">{roleName}</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="group/logout p-2 text-stone-400 hover:text-[#7A1515] hover:bg-[#7A1515]/5 rounded-xl transition-all"
            title="Sign Out"
          >
            <LogOut size={18} className="transition-transform group-hover/logout:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 hidden lg:flex flex-col border-r border-stone-200/80 bg-white">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        id="dashboard-sidebar"
        className={`fixed left-0 top-0 z-50 h-screen w-72 flex flex-col border-r border-stone-200/80 bg-white transition-transform duration-300 ease-out motion-reduce:transition-none lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!isOpen}
      >
        {SidebarContent}
      </aside>
    </>
  );
}
