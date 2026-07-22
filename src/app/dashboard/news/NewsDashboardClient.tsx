"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  Copy,
  Star,
  ArrowUpRight,
  LayoutTemplate,
  Newspaper,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  DashboardPaginationBar,
  DASHBOARD_LIST_PAGE_SIZE,
} from "@/components/dashboard/DashboardPaginationBar";
import type { NewsArticleRow } from "@/lib/news";
import { categoryLabel, effectiveNewsDepartmentSlug } from "@/lib/news";
import type { ProgramDepartmentOption } from "@/lib/program-departments";
import { deleteNewsArticle } from "@/app/actions/news";
import { useRouter } from "next/navigation";

function ArticleThumb({ url, alt }: { url?: string | null; alt?: string }) {
  if (!url?.trim()) {
    return (
      <div
        className="flex h-full min-h-0 w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-50"
        aria-hidden
      >
        <Newspaper className="size-7 text-stone-300/90" strokeWidth={1.25} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external CMS URLs / mixed hosts
    <img
      src={url}
      alt={alt || ""}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
    />
  );
}

function NewsDashboardClient({
  articles,
  departments,
  newsPageEditorHref,
}: {
  articles: NewsArticleRow[];
  departments: ProgramDepartmentOption[];
  newsPageEditorHref: string | null;
}) {
  const router = useRouter();
  const [delId, setDelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const departmentSlugById = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of departments) map.set(d.id, d.slug);
    return map;
  }, [departments]);

  const departmentLabelBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of departments) map.set(d.slug, d.label);
    return map;
  }, [departments]);

  const counts = useMemo(() => {
    const list = articles ?? [];
    const published = list.filter((a) => a.status === "published").length;
    const drafts = list.filter((a) => a.status === "draft").length;
    const featured = list.filter((a) => a.featured).length;
    return { total: list.length, published, drafts, featured };
  }, [articles]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const a of articles ?? []) {
      if (a.category) seen.add(a.category);
    }
    return Array.from(seen).sort();
  }, [articles]);

  const filtered = useMemo(() => {
    let list = articles ?? [];
    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      list = list.filter((a) => a.category === categoryFilter);
    }
    if (departmentFilter !== "all") {
      list = list.filter(
        (a) => effectiveNewsDepartmentSlug(a, departmentSlugById) === departmentFilter,
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((a) =>
        a.title.toLowerCase().includes(q) || a.excerpt?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [articles, statusFilter, categoryFilter, departmentFilter, departmentSlugById, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / DASHBOARD_LIST_PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * DASHBOARD_LIST_PAGE_SIZE;
    return filtered.slice(start, start + DASHBOARD_LIST_PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter, departmentFilter, searchQuery]);

  async function handleDelete(id: string) {
    const r = await deleteNewsArticle(id);
    setDelId(null);
    if (!r.error) router.refresh();
  }

  const hasStories = counts.total > 0;

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-stone-100/55 px-6 py-7 sm:px-8 sm:py-8">
        <div className="relative">
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-5">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#7A1515] text-white">
                <Newspaper className="size-7" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 space-y-2">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
                    Story library
                  </h2>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-stone-500">
                    Publish items that appear as entries on /news; feature one headline per category.
                    Drafts stay hidden until published.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-stone-500">
                  <a
                    href="/news"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[#7A1515] transition-colors hover:bg-white"
                  >
                    Open /news <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
                  </a>
                  {newsPageEditorHref ? (
                    <Link
                      href={newsPageEditorHref}
                      className="inline-flex items-center gap-1.5 text-stone-600 underline decoration-stone-300/90 underline-offset-2 hover:text-[#7A1515]"
                    >
                      Page layout & hero
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/pages"
                      className="text-stone-500 underline decoration-stone-200 underline-offset-2 hover:text-[#7A1515]"
                    >
                      Pages — migration pending for News CMS page
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:w-auto sm:items-center">
              {newsPageEditorHref ? (
                <Link
                  href={newsPageEditorHref}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-50/95"
                >
                  <LayoutTemplate className="size-4 text-stone-500" aria-hidden />
                  Edit layout
                </Link>
              ) : null}
              <Link
                href="/dashboard/news/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7A1515] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#651212]"
              >
                <Plus className="size-5" strokeWidth={2.25} aria-hidden />
                New story
              </Link>
            </div>
          </div>

          {hasStories ? (
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-6 border-t border-stone-200/60 pt-8 sm:gap-x-14">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Total
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-stone-900">
                  {counts.total}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Live
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-emerald-700">
                  {counts.published}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Drafts
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-amber-700/90">
                  {counts.drafts}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Featured
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-stone-900">
                  {counts.featured}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      </section>

      {!hasStories ? (
        <div className="py-16 text-center">
          <div className="mx-auto flex max-w-md flex-col items-center">
            <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-stone-100">
              <FileText className="size-10 text-[#7A1515]/45" strokeWidth={1.25} aria-hidden />
            </div>
            <h3 className="text-lg font-semibold text-stone-900">No stories yet</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Add your first story with a title, image, and link — it appears on{" "}
              <span className="font-medium text-stone-700">/news</span> when published.
            </p>
            <Link
              href="/dashboard/news/new"
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-[#7A1515] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#651212]"
            >
              <Plus className="size-5" aria-hidden /> Create story
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} aria-hidden />
              <input
                type="text"
                placeholder="Search by title or excerpt…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
              />
            </div>
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
            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{categoryLabel(c as any)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                aria-label="Filter by program"
              >
                <option value="all">All programs</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.slug}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs tabular-nums text-stone-400">
              {filtered.length} of {counts.total} {counts.total === 1 ? "item" : "items"}
              {filtered.length > DASHBOARD_LIST_PAGE_SIZE
                ? ` · page ${currentPage} of ${totalPages}`
                : ""}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 py-16 text-center">
              <Search size={28} className="mb-3 text-stone-300" aria-hidden />
              <p className="text-sm font-semibold text-stone-600">No stories match your filters</p>
              <p className="mt-1 text-xs text-stone-400">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
          <>
          <div className="flex flex-col gap-3">
            {paginated.map((row) => {
              const deptSlug = effectiveNewsDepartmentSlug(row, departmentSlugById);
              const deptLabel = deptSlug ? departmentLabelBySlug.get(deptSlug) : null;
              return (
              <article
                key={row.id}
                className="group flex flex-col gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-stone-100/65 sm:flex-row sm:items-center sm:gap-5 sm:py-4 sm:pr-4"
              >
                <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-stone-100/70 sm:aspect-auto sm:h-[5.25rem] sm:w-[8.25rem]">
                  <ArticleThumb url={row.image_url} alt={row.image_alt || row.title} />
                </div>
                <div className="min-w-0 flex-1 px-2 sm:px-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-stone-900">{row.title}</span>
                    {row.featured ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                        <Star className="size-2.5 fill-amber-500 text-amber-500" aria-hidden /> Featured
                      </span>
                    ) : null}
                    <Badge variant={row.status === "published" ? "success" : "warning"}>
                      {row.status === "published" ? "Published" : "Draft"}
                    </Badge>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                      {categoryLabel(row.category)}
                    </span>
                    {deptLabel ? (
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                        {deptLabel}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">{row.excerpt}</p>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-0.5 px-2 sm:w-auto sm:px-0">
                  {row.external_url ? (
                    <a
                      href={row.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2.5 text-stone-400 transition-colors hover:bg-white/75 hover:text-stone-700"
                      aria-label="Open story link"
                    >
                      <ExternalLink size={17} />
                    </a>
                  ) : null}
                  <Link
                    href={`/dashboard/news/${row.id}`}
                    className="rounded-lg p-2.5 text-stone-500 transition-colors hover:bg-white/75 hover:text-[#7A1515]"
                    aria-label={`Edit ${row.title}`}
                  >
                    <Pencil size={17} />
                  </Link>
                  <Link
                    href={`/dashboard/news/new?duplicate=${row.id}`}
                    className="rounded-lg p-2.5 text-stone-400 transition-colors hover:bg-white/75 hover:text-[#7A1515]"
                    aria-label={`Duplicate ${row.title}`}
                  >
                    <Copy size={17} />
                  </Link>
                  <button
                    type="button"
                    className="rounded-lg p-2.5 text-stone-400 transition-colors hover:bg-red-50/90 hover:text-red-600"
                    onClick={() => setDelId(row.id)}
                    aria-label="Delete story"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            );
            })}
          </div>
          <DashboardPaginationBar
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={DASHBOARD_LIST_PAGE_SIZE}
            itemLabel={filtered.length === 1 ? "item" : "items"}
            onPageChange={setCurrentPage}
          />
          </>
        )}
        </div>
      )}

      <ConfirmDialog
        isOpen={delId !== null}
        onClose={() => setDelId(null)}
        title="Delete this story?"
        description="This removes it from the CMS. External links remain valid if you pasted a full URL."
        onConfirm={() => {
          if (delId) void handleDelete(delId);
        }}
      />
    </div>
  );
}

export default NewsDashboardClient;
