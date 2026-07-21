"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, Search, X } from "lucide-react";
import {
  FONT_AWESOME_ICON_CATEGORIES,
  formatFaSolidClass,
  type FontAwesomeIconCategory,
  type FontAwesomeIconEntry,
} from "@/lib/fontawesome-icon-catalog";

function filterCategories(query: string): FontAwesomeIconCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return FONT_AWESOME_ICON_CATEGORIES;

  return FONT_AWESOME_ICON_CATEGORIES.map((cat) => ({
    ...cat,
    icons: cat.icons.filter(
      (icon) =>
        icon.name.includes(q) ||
        icon.label.toLowerCase().includes(q) ||
        formatFaSolidClass(icon.name).includes(q),
    ),
  })).filter((cat) => cat.icons.length > 0);
}

function IconTile({
  icon,
  copied,
  onCopy,
}: {
  icon: FontAwesomeIconEntry;
  copied: boolean;
  onCopy: (icon: FontAwesomeIconEntry) => void;
}) {
  const className = formatFaSolidClass(icon.name);

  return (
    <button
      type="button"
      onClick={() => onCopy(icon)}
      className="group flex flex-col items-center gap-1.5 rounded-xl border border-stone-200 bg-white p-2.5 text-center transition-colors hover:border-[#7A1515]/40 hover:bg-[#7A1515]/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1515]/30"
      title={`Copy ${className}`}
      aria-label={`Copy icon class ${className}`}
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-stone-50 text-lg text-[#7A1515]">
        <i className={className} aria-hidden />
        {copied ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#7A1515] text-white">
            <Check size={16} aria-hidden />
          </span>
        ) : null}
      </span>
      <span className="line-clamp-2 text-[10px] font-medium leading-tight text-stone-600">{icon.label}</span>
      <span className="font-mono text-[9px] text-stone-400 group-hover:text-stone-500">{icon.name}</span>
    </button>
  );
}

export function FontAwesomeIconPickerFab() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [copiedName, setCopiedName] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const categories = useMemo(() => filterCategories(query), [query]);
  const totalMatches = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.icons.length, 0),
    [categories],
  );

  const handleCopy = useCallback(async (icon: FontAwesomeIconEntry) => {
    const value = formatFaSolidClass(icon.name);
    try {
      await navigator.clipboard.writeText(value);
      setCopiedName(icon.name);
      window.setTimeout(() => setCopiedName((cur) => (cur === icon.name ? null : cur)), 1600);
    } catch {
      window.prompt("Copy icon class:", value);
    }
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#7A1515] text-white shadow-[0_8px_24px_rgba(122,21,21,0.35)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1515] focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
        aria-label="Open Font Awesome icon picker"
        title="Font Awesome icons"
      >
        <i className="fa-solid fa-icons text-xl" aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80]" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close icon picker"
            onClick={() => setOpen(false)}
          />

          <aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-stone-200 bg-white shadow-2xl motion-safe:animate-[dash-fa-drawer-in_0.28s_cubic-bezier(0.22,1,0.36,1)_both]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fa-icon-picker-title"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-200 px-4 py-4">
              <div>
                <h2 id="fa-icon-picker-title" className="text-base font-bold text-stone-900">
                  Font Awesome icons
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Click an icon to copy its class name, e.g.{" "}
                  <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[11px]">fa-solid fa-file-lines</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1515]/30"
                aria-label="Close"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="shrink-0 border-b border-stone-100 px-4 py-3">
              <label className="relative block">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search icons…"
                  className="w-full rounded-lg border border-stone-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#7A1515]/40 focus:ring-2 focus:ring-[#7A1515]/15"
                  autoFocus
                />
              </label>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-stone-400">
                <Copy size={12} aria-hidden />
                {totalMatches} icon{totalMatches === 1 ? "" : "s"}
                {query.trim() ? ` matching “${query.trim()}”` : " available"}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {totalMatches === 0 ? (
                <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
                  No icons match your search.
                </p>
              ) : (
                <div className="space-y-6">
                  {categories.map((cat) => (
                    <section key={cat.id}>
                      <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        {cat.label}
                      </h3>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {cat.icons.map((icon) => (
                          <IconTile
                            key={`${cat.id}-${icon.name}`}
                            icon={icon}
                            copied={copiedName === icon.name}
                            onCopy={handleCopy}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>,
    document.body,
  );
}
