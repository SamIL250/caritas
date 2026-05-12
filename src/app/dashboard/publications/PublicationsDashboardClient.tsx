"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  LayoutTemplate,
  Plus,
  Settings2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deletePublication } from "@/app/actions/publications";
import {
  type PublicationCategoryRow,
  type PublicationRow,
} from "@/lib/publications";
import { PublicationCategoryIcon } from "@/components/dashboard/publications/PublicationCategoryIcon";
import { PublicationRowItem } from "@/components/dashboard/publications/PublicationRowItem";
import { PublicationsCategoriesPanel } from "@/components/dashboard/publications/PublicationsCategoriesPanel";

type Tab =
  | { key: "all"; label: string; kind: "all" }
  | { key: "settings"; label: string; kind: "settings" }
  | { key: string; label: string; kind: "category"; category: PublicationCategoryRow };

function tabFromSearch(raw: string | null): string {
  if (!raw || !raw.trim()) return "all";
  return raw.trim();
}

function PublicationsDashboardClient({
  items,
  categories,
  publicationsPageEditorHref,
}: {
  items: PublicationRow[];
  categories: PublicationCategoryRow[];
  publicationsPageEditorHref: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabKey = tabFromSearch(searchParams.get("tab"));

  const [delId, setDelId] = useState<string | null>(null);
  const [deletingPending, startDeleting] = useTransition();

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
      all.push({ key: c.slug, label: c.plural_label || c.label, kind: "category", category: c }),
    );
    all.push({ key: "settings", label: "Categories", kind: "settings" });
    return all;
  }, [sortedCategories]);

  const counts = useMemo(() => {
    const total = items.length;
    const published = items.filter((p) => p.status === "published").length;
    const drafts = items.filter((p) => p.status === "draft").length;
    const featured = items.filter((p) => p.featured).length;
    const byCategory: Record<string, number> = {};
    items.forEach((p) => {
      byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
    });
    return { total, published, drafts, featured, byCategory };
  }, [items]);

  const categoryById = useMemo(() => {
    const m = new Map<string, PublicationCategoryRow>();
    categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  const categoryBySlug = useMemo(() => {
    const m = new Map<string, PublicationCategoryRow>();
    categories.forEach((c) => m.set(c.slug, c));
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

  const activeTab = tabs.find((t) => t.key === tabKey) ?? tabs[0];
  const activeCategory =
    activeTab.kind === "category" ? activeTab.category : null;

  const filteredItems = activeCategory
    ? items.filter((r) => r.category === activeCategory.slug)
    : items;

  const newPublicationHref = activeCategory
    ? `/dashboard/publications/new?category=${encodeURIComponent(activeCategory.slug)}`
    : "/dashboard/publications/new";

  const newCtaLabel = activeCategory
    ? `New ${activeCategory.label.toLowerCase()}`
    : "New publication";

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-stone-100/55 px-6 py-7 sm:px-8 sm:py-8">
        <div className="relative">
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-5">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#7A1515] text-white">
                <BookOpen className="size-7" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 space-y-2">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
                    Publications library
                  </h2>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-stone-500">
                    Annual reports, newsletters, strategic plan, success stories and updates — manage one
                    library, broken into categories so each type uses the right form.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-stone-500">
                  <a
                    href="/publications"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[#7A1515] transition-colors hover:bg-white"
                  >
                    Open /publications <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
                  </a>
                  {publicationsPageEditorHref ? (
                    <Link
                      href={publicationsPageEditorHref}
                      className="inline-flex items-center gap-1.5 text-stone-600 underline decoration-stone-300/90 underline-offset-2 hover:text-[#7A1515]"
                    >
                      Page layout & hero
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/pages"
                      className="text-stone-500 underline decoration-stone-200 underline-offset-2 hover:text-[#7A1515]"
                    >
                      Pages — migration pending for Publications CMS page
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              {publicationsPageEditorHref ? (
                <Link
                  href={publicationsPageEditorHref}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-50/95"
                >
                  <LayoutTemplate className="size-4 text-stone-500" aria-hidden />
                  Edit layout
                </Link>
              ) : null}
              {activeTab.kind !== "settings" ? (
                <Link
                  href={newPublicationHref}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7A1515] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#651212]"
                >
                  <Plus className="size-5" strokeWidth={2.25} aria-hidden />
                  {newCtaLabel}
                </Link>
              ) : null}
            </div>
          </div>

          {counts.total > 0 ? (
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-6 border-t border-stone-200/60 pt-8 sm:gap-x-14">
              <Stat label="Total" value={counts.total} />
              <Stat label="Live" value={counts.published} tone="emerald" />
              <Stat label="Drafts" value={counts.drafts} tone="amber" />
              <Stat label="Featured" value={counts.featured} />
              <Stat label="Categories" value={categories.length} />
            </dl>
          ) : null}
        </div>
      </section>

      <div className="-mx-1 overflow-x-auto">
        <div className="flex min-w-max flex-wrap gap-1 border-b border-stone-200 px-1 pb-px">
          {tabs.map((t) => {
            const active = t.key === activeTab.key;
            const showBadge = t.kind === "category" || t.kind === "all";
            const badgeCount =
              t.kind === "all"
                ? counts.total
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

      {activeTab.kind === "settings" ? (
        <PublicationsCategoriesPanel categories={sortedCategories} />
      ) : (
        <PublicationsListPanel
          activeCategory={activeCategory}
          items={filteredItems}
          categoryBySlug={categoryBySlug}
          allCategoryById={categoryById}
          onDelete={(id) => setDelId(id)}
          newPublicationHref={newPublicationHref}
          newCtaLabel={newCtaLabel}
        />
      )}

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
    </div>
  );
}

export default PublicationsDashboardClient;

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "emerald" | "amber";
}) {
  const valueColor =
    tone === "emerald"
      ? "text-emerald-700"
      : tone === "amber"
        ? "text-amber-700/90"
        : "text-stone-900";
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">{label}</dt>
      <dd className={`mt-1 text-2xl font-bold tabular-nums tracking-tight ${valueColor}`}>{value}</dd>
    </div>
  );
}

function PublicationsListPanel({
  activeCategory,
  items,
  categoryBySlug,
  allCategoryById,
  onDelete,
  newPublicationHref,
  newCtaLabel,
}: {
  activeCategory: PublicationCategoryRow | null;
  items: PublicationRow[];
  categoryBySlug: Map<string, PublicationCategoryRow>;
  allCategoryById: Map<string, PublicationCategoryRow>;
  onDelete: (id: string) => void;
  newPublicationHref: string;
  newCtaLabel: string;
}) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-stone-100">
            {activeCategory ? (
              <PublicationCategoryIcon
                icon={activeCategory.icon}
                accent={activeCategory.accent}
                size={56}
              />
            ) : (
              <BookOpen className="size-10 text-[#7A1515]/45" strokeWidth={1.25} aria-hidden />
            )}
          </div>
          <h3 className="text-lg font-semibold text-stone-900">
            {activeCategory ? `No ${activeCategory.plural_label.toLowerCase() || activeCategory.label.toLowerCase()} yet` : "No publications yet"}
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
            {activeCategory?.description ||
              "Add your first publication to surface it on /publications when published."}
          </p>
          <Link
            href={newPublicationHref}
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-[#7A1515] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#651212]"
          >
            <Plus className="size-5" aria-hidden /> {newCtaLabel}
          </Link>
        </div>
      </div>
    );
  }

  if (activeCategory) {
    return (
      <div>
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
          <div className="flex items-center gap-3">
            <PublicationCategoryIcon icon={activeCategory.icon} accent={activeCategory.accent} size={28} />
            <div>
              <h3 className="text-sm font-bold text-stone-900">{activeCategory.label}</h3>
              {activeCategory.description ? (
                <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
                  {activeCategory.description}
                </p>
              ) : null}
            </div>
          </div>
          <p className="text-xs tabular-nums text-stone-400">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {items.map((row) => (
            <PublicationRowItem
              key={row.id}
              row={row}
              category={allCategoryById.get(row.category_id)}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    );
  }

  // "All" tab: group by category for orientation, but use the same row component everywhere.
  const grouped = new Map<string, PublicationRow[]>();
  items.forEach((row) => {
    const list = grouped.get(row.category) ?? [];
    list.push(row);
    grouped.set(row.category, list);
  });
  const orderedSlugs = Array.from(categoryBySlug.values())
    .sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label))
    .map((c) => c.slug);

  return (
    <div className="space-y-10">
      {orderedSlugs.map((slug) => {
        const list = grouped.get(slug) ?? [];
        if (!list.length) return null;
        const cat = categoryBySlug.get(slug);
        return (
          <div key={slug}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {cat ? (
                  <PublicationCategoryIcon icon={cat.icon} accent={cat.accent} size={26} />
                ) : null}
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {cat?.plural_label || cat?.label || slug}
                </h3>
                <span className="text-[11px] tabular-nums text-stone-400">
                  {list.length} {list.length === 1 ? "item" : "items"}
                </span>
              </div>
              {cat ? (
                <Link
                  href={`/dashboard/publications/new?category=${encodeURIComponent(cat.slug)}`}
                  className="text-[11px] font-semibold text-[#7A1515] hover:underline"
                >
                  + Add {cat.label.toLowerCase()}
                </Link>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              {list.map((row) => (
                <PublicationRowItem
                  key={row.id}
                  row={row}
                  category={allCategoryById.get(row.category_id)}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
