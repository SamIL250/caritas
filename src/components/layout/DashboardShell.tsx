"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  profile?: any;
  /** Row count for `pages` — sidebar badge; Sidebar refreshes on client navigations too. */
  initialPagesCount?: number;
}

export function DashboardShell({ children, profile, initialPagesCount = 0 }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  /** Full-bleed: page editor only (not /dashboard/pages list). */
  const isPageEditor = Boolean(pathname?.startsWith("/dashboard/pages/"));

  return (
    <div className="flex min-h-screen w-full bg-[var(--color-page-bg)]">
      <a
        href="#dashboard-main"
        className="absolute left-0 top-0 z-[100] m-0 h-px w-px overflow-hidden p-0 focus:fixed focus:left-4 focus:top-4 focus:m-0 focus:h-auto focus:w-auto focus:overflow-visible focus:whitespace-normal focus:rounded-md focus:bg-white focus:px-4 focus:py-2.5 focus:shadow-md focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-primary)]"
      >
        Skip to main content
      </a>
      <Sidebar
        profile={profile}
        initialPagesCount={initialPagesCount}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all">
        <div className="lg:hidden sticky top-0 z-30 flex h-14 items-center gap-3 px-3 sm:px-4 bg-white/95 backdrop-blur-sm border-b border-stone-200/80">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-stone-700 transition-colors hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            aria-expanded={isSidebarOpen}
            aria-controls="dashboard-sidebar"
            aria-label="Open sidebar navigation"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link
            href="/dashboard"
            className="relative flex h-8 min-w-0 flex-1 max-w-[200px] items-center"
            aria-label="Dashboard home"
          >
            <Image
              src="/logo_bg.png"
              alt=""
              fill
              sizes="180px"
              className="object-contain object-left"
              priority
            />
          </Link>
        </div>

        <main
          id="dashboard-main"
          className={
            isPageEditor
              ? "dash-main-enter flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden"
              : "dash-main-enter flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto"
          }
          tabIndex={-1}
        >
          {isPageEditor ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
          ) : (
            <div className="mx-auto flex w-full min-h-0 max-w-[80rem] flex-1 flex-col px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-5 lg:px-8 lg:pb-12 lg:pt-6">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
