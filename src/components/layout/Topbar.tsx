"use client";

import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";

interface TopbarProps {
  title?: string;
  /** Short line under the title — keeps intro copy inside the sticky header band. */
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  const pathname = usePathname();
  
  // Advanced breadcrumb generation
  const paths = pathname?.split("/").filter(Boolean).filter(p => p !== 'dashboard') || [];
  const breadcrumbs = paths.map((p, i) => ({
    name: p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '),
    href: '/dashboard' + (paths.slice(0, i + 1).length > 0 ? '/' + paths.slice(0, i + 1).join('/') : ''),
    isLast: i === paths.length - 1
  }));

  const displayTitle = title || (breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : "Overview");

  return (
    <header
      className="sticky top-0 z-40 -mx-4 mb-8 w-full border-b border-stone-200 bg-[var(--color-page-bg)]/98 px-4 pb-6 pt-2 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <nav
            className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400"
            aria-label="Breadcrumb"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center text-stone-400 transition-colors hover:text-[var(--color-primary)]"
            >
              <Home size={10} className="mr-1 shrink-0" aria-hidden />
              Dashboard
            </Link>
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight size={10} className="mx-0.5 shrink-0 text-stone-300" aria-hidden />
                <Link
                  href={bc.href}
                  className={
                    bc.isLast
                      ? "text-stone-600 transition-colors hover:text-[var(--color-primary)]"
                      : "text-stone-400 transition-colors hover:text-[var(--color-primary)]"
                  }
                >
                  {bc.name}
                </Link>
              </React.Fragment>
            ))}
          </nav>

          <h1 className="text-xl font-bold leading-tight tracking-tight text-stone-900 sm:text-2xl">
            {displayTitle}
          </h1>

          {subtitle != null && subtitle !== false && (
            <div className="max-w-2xl text-sm leading-relaxed text-stone-500">{subtitle}</div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <LanguageSwitcher variant="compact" />
          {actions != null && actions !== false ? actions : null}
        </div>
      </div>
    </header>
  );
}
