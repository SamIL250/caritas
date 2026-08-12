"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Filter,
  LayoutTemplate,
  Lock,
  Plus,
  Search,
  Settings2,
  Star,
  User,
  X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Topbar } from "@/components/layout/Topbar";
import {
  DashboardPaginationBar,
  DASHBOARD_LIST_PAGE_SIZE,
} from "@/components/dashboard/DashboardPaginationBar";
import { deletePublication } from "@/app/actions/publications";
import { deleteTestimony } from "@/app/actions/testimonies";
import {
  type PublicationCategoryRow,
  type PublicationRow,
} from "@/lib/publications";
import type { TestimonyRow } from "@/lib/testimonies";
import { PublicationCategoryIcon } from "@/components/dashboard/publications/PublicationCategoryIcon";
import { PublicationRowItem } from "@/components/dashboard/publications/PublicationRowItem";
import { TestimonyRowItem } from "@/components/dashboard/publications/TestimonyRowItem";
import { PublicationsCategoriesPanel } from "@/components/dashboard/publications/PublicationsCategoriesPanel";

type Tab =
  | { key: "all"; label: string; kind: "all" }
  | { key: "testimonies"; label: string; kind: "testimonies" }
  | { key: "settings"; label: string; kind: "settings" }
  | { key: string; label: string; kind: "category"; category: PublicationCategoryRow };

type StatusFilter = "all" | "published" | "draft";

function tabFromSearch(raw: string | null): string {
  if (!raw || !raw.trim()) return "all";
  return raw.trim();
}

function dedupeById<T extends { id: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

function PublicationsDashboardClient({
  items: itemsProp,
  categories,
  testimonies: testimoniesProp,
  publicationsPageEditorHref,
}: {
  items: PublicationRow[];
  categories: PublicationCategoryRow[];
  testimonies: TestimonyRow[];
  publicationsPageEditorHref: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabKey = tabFromSearch(searchParams.get("tab"));

  const items = useMemo(() => dedupeById(itemsProp), [itemsProp]);
  const testimonies = useMemo(() => dedupeById(testimoniesProp), [testimoniesProp]);

  const [delId, setDelId] = useState<string | null>(null);
  const [delTestimonyId, setDelTestimonyId] = useState<string | null>(null);
  const [deletingPending, startDeleting] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [lockedOnly, setLockedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label),
      ),
    [categories],
  );

  const tabs: Tab[] = useMemo(() => {
    const all: Tab[] = [{ key: "all", label: "All", kind: "all" }];
    sortedCategories.forEach((c) =>
      all.push({
        key: c.slug,
        label: c.plural_label || c.label,
        kind: "category",
        category: c,
      }),
    );
    all.push({ key: "testimonies", label: "Testimonies", kind: "testimonies" });
    all.push({ key: "settings", label: "Categories", kind: "settings" });
    return all;
  }, [sortedCategories]);

  const counts = useMemo(() => {
    const total = items.length;
    const published = items.filter((p) => p.status === "published").length;
    const drafts = items.filter((p) => p.status === "draft").length;
    const featured = items.filter((p) => p.featured).length;
    const locked = items.filter((p) => Boolean((p as { is_locked?: boolean }).is_locked)).length;
    const byCategory: Record<string, number> = {};
    items.forEach((p) => {
      byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
    });
    return { total, published, drafts, featured, locked, byCategory };
  }, [items]);

  const categoryById = useMemo(() => {
    const m = new Map<string, PublicationCategoryRow>();
    categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  function setTab(next: string) {
    const q = new URLSearchParams(searchParams.toString());
    if (next === "all") q.delete("tab");
    else q.set("tab", next);
    router.push(`/dashboard/publications${q.toString() ? `?${q}` : ""}`);
  }

  function handleDelete(id: string) {
    startDeleting(async () => {
      const r = await deletePublication(id);
      setDelId(null);
      if (!r.error) router.refresh();
    });
  }

  function handleDeleteTestimony(id: string) {
    startDeleting(async () => {
      const r = await deleteTestimony(id);
      setDelTestimonyId(null);
      if (!r.error) router.refresh();
    });
  }

  const activeTab = tabs.find((t) => t.key === tabKey) ?? tabs[0];
  const activeCategory = activeTab.kind === "category" ? activeTab.category : null;
  const isTestimoniesTab = activeTab.kind === "testimonies";
  const isSettingsTab = activeTab.kind === "settings";

  const filteredPublications = useMemo(() => {
    let list = activeCategory
      ? items.filter((r) => r.category === activeCategory.slug)
      : items;

    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (featuredOnly) {
      list = list.filter((r) => Boolean(r.featured));
    }
    if (lockedOnly) {
      list = list.filter((r) => Boolean((r as { is_locked?: boolean }).is_locked));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((r) => {
        const hay = [
          r.title,
          r.slug,
          r.category,
          r.excerpt ?? "",
          r.meta_line ?? "",
          r.tag_label ?? "",
          r.period_label ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }, [items, activeCategory, statusFilter, featuredOnly, lockedOnly, searchQuery]);

  const filteredTestimonies = useMemo(() => {
    if (!searchQuery.trim()) return testimonies;
    const q = searchQuery.trim().toLowerCase();
    return testimonies.filter((t) => {
      const hay = [t.title, t.slug, t.excerpt ?? ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [testimonies, searchQuery]);

  const listForPagination = isTestimoniesTab ? filteredTestimonies : filteredPublications;
  const totalPages = Math.max(1, Math.ceil(listForPagination.length / DASHBOARD_LIST_PAGE_SIZE));
  const paginatedPublications = useMemo(() => {
    const start = (currentPage - 1) * DASHBOARD_LIST_PAGE_SIZE;
    return filteredPublications.slice(start, start + DASHBOARD_LIST_PAGE_SIZE);
  }, [filteredPublications, currentPage]);
  const paginatedTestimonies = useMemo(() => {
    const start = (currentPage - 1) * DASHBOARD_LIST_PAGE_SIZE;
    return filteredTestimonies.slice(start, start + DASHBOARD_LIST_PAGE_SIZE);
  }, [filteredTestimonies, currentPage]);

  const filterKey = `${tabKey}|${statusFilter}|${featuredOnly}|${lockedOnly}|${searchQuery.trim()}`;
  useEffect(() => {
    setCurrentPage(1);
  }, [filterKey]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const newPublicationHref = activeCategory
    ? `/dashboard/publications/new?category=${encodeURIComponent(activeCategory.slug)}`
    : "/dashboard/publications/new";

  const newCtaLabel = isTestimoniesTab
    ? "New testimony"
    : activeCategory
      ? `New ${activeCategory.label.toLowerCase()}`
      : "New publication";

  const newItemHref = isTestimoniesTab
    ? "/dashboard/publications/testimonies/new"
    : newPublicationHref;

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setFeaturedOnly(false);
    setLockedOnly(false);
  }

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    statusFilter !== "all" ||
    featuredOnly ||
    lockedOnly;

  return (
    <div className="w-full max-w-full">
      <Topbar
        title="Publications"
        subtitle={
          <>
            PDFs, newsletters, stories and external updates published on{" "}
            <Link
              href="/publications"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-[3px] hover:text-[#7A1515]"
            >
              /publications
            </Link>
            .
          </>
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {publicationsPageEditorHref ? (
              <Link
                href={publicationsPageEditorHref}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-50"
              >
                <LayoutTemplate className="size-4 text-stone-500" aria-hidden />
                Edit layout
              </Link>
            ) : null}
            {!isSettingsTab ? (
              <Link
                href={newItemHref}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#7A1515] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#651212]"
              >
                <Plus className="size-4" strokeWidth={2.25} aria-hidden />
                {newCtaLabel}
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="-mx-1 overflow-x-auto flex-1">
            <div className="flex min-w-max flex-wrap gap-1 border-b border-stone-200 px-1 pb-px">
              {tabs.map((t) => {
                const active = t.key === activeTab.key;
                const showBadge =
                  t.kind === "category" || t.kind === "all" || t.kind === "testimonies";
                const badgeCount =
                  t.kind === "all"
                    ? counts.total
                    : t.kind === "testimonies"
                      ? testimonies.length
                      : t.kind === "category"
                        ? counts.byCategory[t.category.slug] ?? 0
                        : 0;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`relative -mb-px inline-flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                      active
                        ? "border border-b-0 border-stone-200 bg-white text-[#7A1515]"
                        : "border border-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                    }`}
                  >
                    {t.kind === "settings" ? <Settings2 className="size-3.5" aria-hidden /> : null}
                    {t.kind === "testimonies" ? <User className="size-3.5" aria-hidden /> : null}
                    {t.kind === "category" ? (
                      <PublicationCategoryIcon
                        icon={t.category.icon}
                        accent={t.category.accent}
                        size={18}
                        className="!rounded-md"
                      />
                    ) : null}
                    {t.label}
                    {showBadge ? (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                          active ? "bg-[#7A1515]/10 text-[#7A1515]" : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {badgeCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {isSettingsTab ? (
          <PublicationsCategoriesPanel categories={sortedCategories} />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  size={16}
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder={
                    isTestimoniesTab
                      ? "Search testimonies by name, title…"
                      : "Search by title, slug, category…"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                />
              </div>

              {!isTestimoniesTab ? (
                <>
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-stone-400" aria-hidden />
                    {(["all", "published", "draft"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatusFilter(s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          statusFilter === s
                            ? "bg-[#7A1515] text-white"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {s === "all" ? "All" : s === "published" ? "Published" : "Draft"}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setFeaturedOnly((v) => !v)}
                    aria-pressed={featuredOnly}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      featuredOnly
                        ? "bg-amber-100 text-amber-900 ring-1 ring-amber-200"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    <Star
                      className={`size-3.5 ${featuredOnly ? "fill-amber-500 text-amber-500" : ""}`}
                      aria-hidden
                    />
                    Featured
                  </button>

                  {counts.locked > 0 ? (
                    <button
                      type="button"
                      onClick={() => setLockedOnly((v) => !v)}
                      aria-pressed={lockedOnly}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        lockedOnly
                          ? "bg-[#8c2208]/10 text-[#8c2208] ring-1 ring-[#8c2208]/20"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      <Lock size={13} aria-hidden />
                      Locked
                    </button>
                  ) : null}
                </>
              ) : null}

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                >
                  <X size={14} aria-hidden />
                  Clear
                </button>
              ) : null}

              <p className="ml-auto text-xs tabular-nums text-stone-400">
                {listForPagination.length}{" "}
                {isTestimoniesTab
                  ? `of ${testimonies.length}`
                  : activeCategory
                    ? `in ${activeCategory.label}`
                    : `of ${counts.total}`}
                {listForPagination.length > DASHBOARD_LIST_PAGE_SIZE
                  ? ` · page ${currentPage} of ${totalPages}`
                  : ""}
              </p>
            </div>

            {isTestimoniesTab ? (
              filteredTestimonies.length === 0 ? (
                <EmptyState
                  icon={<User className="size-10 text-[#7A1515]/45" strokeWidth={1.25} aria-hidden />}
                  title={
                    hasActiveFilters ? "No testimonies match your search" : "No testimonies yet"
                  }
                  description={
                    hasActiveFilters
                      ? "Try adjusting your search."
                      : "Testimonies appear under the Publications page in their own tab."
                  }
                  actionHref={hasActiveFilters ? undefined : "/dashboard/publications/testimonies/new"}
                  actionLabel="New testimony"
                  onClear={hasActiveFilters ? clearFilters : undefined}
                />
              ) : (
                <div>
                  <div className="mb-5">
                    <h3 className="text-sm font-bold text-stone-900">Testimonies</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
                      Inspirational stories with detail pages at /publications/testimonies/[slug].
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {paginatedTestimonies.map((row) => (
                      <TestimonyRowItem
                        key={row.id}
                        row={row}
                        onDelete={(id) => setDelTestimonyId(id)}
                      />
                    ))}
                  </div>
                  <DashboardPaginationBar
                    page={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredTestimonies.length}
                    pageSize={DASHBOARD_LIST_PAGE_SIZE}
                    itemLabel={filteredTestimonies.length === 1 ? "item" : "items"}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )
            ) : filteredPublications.length === 0 ? (
              <EmptyState
                icon={
                  activeCategory ? (
                    <PublicationCategoryIcon
                      icon={activeCategory.icon}
                      accent={activeCategory.accent}
                      size={56}
                    />
                  ) : (
                    <BookOpen
                      className="size-10 text-[#7A1515]/45"
                      strokeWidth={1.25}
                      aria-hidden
                    />
                  )
                }
                title={
                  hasActiveFilters
                    ? "No publications match your filters"
                    : activeCategory
                      ? `No ${(activeCategory.plural_label || activeCategory.label).toLowerCase()} yet`
                      : "No publications yet"
                }
                description={
                  hasActiveFilters
                    ? "Try adjusting your search or filter criteria."
                    : activeCategory?.description ||
                      "Add your first publication to surface it on /publications when published."
                }
                actionHref={hasActiveFilters ? undefined : newPublicationHref}
                actionLabel={newCtaLabel}
                onClear={hasActiveFilters ? clearFilters : undefined}
              />
            ) : (
              <div>
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {activeCategory ? (
                      <PublicationCategoryIcon
                        icon={activeCategory.icon}
                        accent={activeCategory.accent}
                        size={28}
                      />
                    ) : null}
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        {activeCategory ? activeCategory.label : "All publications"}
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
                        {activeCategory?.description ||
                          "Every category in one list, newest updates first."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {paginatedPublications.map((row) => (
                    <PublicationRowItem
                      key={row.id}
                      row={row}
                      category={categoryById.get(row.category_id)}
                      onDelete={(id) => setDelId(id)}
                    />
                  ))}
                </div>
                <DashboardPaginationBar
                  page={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredPublications.length}
                  pageSize={DASHBOARD_LIST_PAGE_SIZE}
                  itemLabel={filteredPublications.length === 1 ? "item" : "items"}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={delId !== null}
        title="Delete publication?"
        description="This removes the publication from the library. Uploaded media files stay in Media Library unless removed separately."
        confirmLabel={deletingPending ? "Deleting…" : "Delete"}
        onClose={() => setDelId(null)}
        onConfirm={() => {
          if (delId) handleDelete(delId);
        }}
      />

      <ConfirmDialog
        isOpen={delTestimonyId !== null}
        title="Delete testimony?"
        description="This removes the testimony from the Publications page. Media files stay in the Media Library unless removed separately."
        confirmLabel={deletingPending ? "Deleting…" : "Delete"}
        onClose={() => setDelTestimonyId(null)}
        onConfirm={() => {
          if (delTestimonyId) handleDeleteTestimony(delTestimonyId);
        }}
      />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
  onClear,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onClear?: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-stone-100">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-500">{description}</p>
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="mt-6 text-sm font-semibold text-[#7A1515] hover:underline"
          >
            Clear filters
          </button>
        ) : null}
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-[#7A1515] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#651212]"
          >
            <Plus className="size-5" aria-hidden /> {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default PublicationsDashboardClient;
