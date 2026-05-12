"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, FileText, ImagePlus, Loader2, Star } from "lucide-react";
import {
  encodePublicationAssetUrl,
  publicationKindLabel,
  readCategoryBehavior,
  readCustomFields,
  readFieldSchema,
  type PublicationCategoryKind,
  type PublicationCategoryRow,
  type PublicationRow,
} from "@/lib/publications";
import { createPublication, updatePublication } from "@/app/actions/publications";
import { MediaPicker } from "@/components/dashboard/MediaPicker";
import { PublicationCategoryIcon } from "@/components/dashboard/publications/PublicationCategoryIcon";
import { PublicationCustomFields } from "@/components/dashboard/publications/PublicationCustomFields";
import type { ProgramDepartmentOption } from "@/lib/program-departments";

type Props = {
  mode: "create" | "edit";
  publication?: PublicationRow;
  categories: PublicationCategoryRow[];
  initialCategorySlug?: string | null;
  departments: ProgramDepartmentOption[];
};

function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function pickInitialCategory(
  categories: PublicationCategoryRow[],
  publication: PublicationRow | undefined,
  initialSlug: string | null | undefined,
): PublicationCategoryRow | null {
  if (publication) {
    const byId = categories.find((c) => c.id === publication.category_id);
    if (byId) return byId;
  }
  if (initialSlug) {
    const bySlug = categories.find((c) => c.slug === initialSlug);
    if (bySlug) return bySlug;
  }
  return categories[0] ?? null;
}

export function PublicationForm({
  mode,
  publication,
  categories,
  initialCategorySlug,
  departments,
}: Props) {
  const router = useRouter();

  const [categoryId, setCategoryId] = useState<string>(
    pickInitialCategory(categories, publication, initialCategorySlug)?.id ?? "",
  );
  const category = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId],
  );
  const behavior = useMemo(() => (category ? readCategoryBehavior(category) : {}), [category]);
  const fieldSchema = useMemo(() => (category ? readFieldSchema(category) : []), [category]);
  const initialCustomFields = useMemo(
    () => (publication ? readCustomFields(publication) : {}),
    [publication],
  );

  const kind: PublicationCategoryKind = category?.kind ?? "pdf";

  const [coverUrl, setCoverUrl] = useState(publication?.cover_image_url ?? "");
  const [pdfUrl, setPdfUrl] = useState(publication?.file_url ?? "");
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [pdfPickerOpen, setPdfPickerOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const showPdf = kind === "pdf" || kind === "hybrid";
  const showStoryBody = kind === "story" || kind === "hybrid";
  const showExternalUrl = kind === "external" || kind === "hybrid";
  const showCover = kind !== "external" || kind === "external" || true; // always show cover; non-PDF kinds also benefit
  const showFeatured = Boolean(behavior.single_featured);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!category) {
      setMsg({ ok: false, text: "Pick a publication type first." });
      return;
    }
    setMsg(null);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.set("category_id", category.id);
    fd.set("cover_image_url", coverUrl.trim());
    fd.set("file_url", showPdf ? pdfUrl.trim() : "");

    const res =
      mode === "create"
        ? await createPublication(fd)
        : await updatePublication(publication!.id, fd);
    setSaving(false);
    if (res.error) {
      setMsg({ ok: false, text: res.error });
      return;
    }
    setMsg({ ok: true, text: mode === "create" ? "Publication created." : "Changes saved." });
    router.refresh();
    if (mode === "create") {
      const slug = category.slug;
      router.push(`/dashboard/publications?tab=${encodeURIComponent(slug)}`);
    }
  }

  const publishedLocal = publication?.published_at
    ? isoToDatetimeLocalValue(publication.published_at)
    : "";

  return (
    <form className="max-w-3xl space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="flex items-center gap-3">
        <Link
          href={category ? `/dashboard/publications?tab=${encodeURIComponent(category.slug)}` : "/dashboard/publications"}
          className="inline-flex rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-lg font-bold text-stone-900">
            {mode === "create" ? "New publication" : "Edit publication"}
          </h2>
          {category ? (
            <p className="mt-0.5 inline-flex items-center gap-2 text-xs font-medium text-stone-500">
              <PublicationCategoryIcon icon={category.icon} accent={category.accent} size={20} />
              {category.label}
              <span className="text-stone-300">·</span>
              {publicationKindLabel(category.kind)}
            </p>
          ) : null}
        </div>
      </div>

      {msg ? (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {msg.text}
        </p>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="category">
              Type
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
              disabled={mode === "edit"}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.kind})
                </option>
              ))}
            </select>
            {mode === "edit" ? (
              <p className="text-[11px] text-stone-400">
                Type is locked after creation. Delete and recreate if you need to move it.
              </p>
            ) : null}
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={publication?.status ?? "draft"}
              className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label
            className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
            htmlFor="department_id"
          >
            Program area (department)
          </label>
          <select
            id="department_id"
            name="department_id"
            defaultValue={publication?.department_id ?? ""}
            className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
          >
            <option value="">Cross-cutting / not assigned</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-stone-400">
            Links this item to a pillar for related content and filtering on the public site.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="title">
            Title
          </label>
          <Input id="title" name="title" required defaultValue={publication?.title ?? ""} />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="slug">
            URL slug
          </label>
          <Input id="slug" name="slug" defaultValue={publication?.slug ?? ""} placeholder="auto from title if empty" />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="excerpt">
            Summary / excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            defaultValue={publication?.excerpt ?? ""}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="published_at">
              Publish date / time
            </label>
            <Input id="published_at" name="published_at" type="datetime-local" defaultValue={publishedLocal} />
            <p className="text-[11px] text-stone-400">Defaults to now when published.</p>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="period_label">
              Period / year badge
            </label>
            <Input
              id="period_label"
              name="period_label"
              placeholder="e.g. 2025 or Q4 2025"
              defaultValue={publication?.period_label ?? ""}
            />
          </div>
        </div>

        {showFeatured ? (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm font-medium text-amber-900">
            <input
              type="checkbox"
              name="featured"
              value="on"
              defaultChecked={publication?.featured ?? false}
              className="size-4 rounded border-amber-400 accent-[#b45309]"
            />
            <Star className="size-4" aria-hidden />
            <span className="flex-1">
              Featured slot — shown as the large hero card on /publications. Marking another row featured will
              clear this one.
            </span>
          </label>
        ) : null}
      </section>

      {showStoryBody ? (
        <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-6">
          <header>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Story body</h3>
            <p className="mt-1 text-xs text-stone-500">
              HTML body shown when this publication is opened from a story card. Leave blank to use the excerpt only.
            </p>
          </header>
          <textarea
            id="body"
            name="body"
            rows={10}
            defaultValue={publication?.body ?? ""}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="tag_label">
                Tag label
              </label>
              <Input id="tag_label" name="tag_label" defaultValue={publication?.tag_label ?? ""} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="tag_icon">
                Tag icon class
              </label>
              <Input
                id="tag_icon"
                name="tag_icon"
                placeholder="fa-solid fa-seedling"
                defaultValue={publication?.tag_icon ?? ""}
              />
            </div>
          </div>
        </section>
      ) : (
        <>
          <input type="hidden" name="body" value={publication?.body ?? ""} />
          <input type="hidden" name="tag_label" value={publication?.tag_label ?? ""} />
          <input type="hidden" name="tag_icon" value={publication?.tag_icon ?? ""} />
        </>
      )}

      <section className="grid gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 sm:grid-cols-2 sm:p-6">
        {showPdf ? (
          <div className="space-y-3 sm:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">PDF document</h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-h-[44px] flex-1 items-center rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-600">
                {pdfUrl ? (
                  <a
                    href={encodePublicationAssetUrl(pdfUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate font-mono hover:underline"
                  >
                    {pdfUrl}
                  </a>
                ) : (
                  <span className="text-stone-400">No PDF selected</span>
                )}
              </div>
              <Button type="button" variant="secondary" className="h-9 shrink-0 gap-2" onClick={() => setPdfPickerOpen(true)}>
                <FileText className="size-4" aria-hidden />
                Pick PDF
              </Button>
              {pdfUrl ? (
                <Button type="button" variant="secondary" className="h-9 shrink-0" onClick={() => setPdfUrl("")}>
                  Clear
                </Button>
              ) : null}
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="meta_line">
                Meta line (file size, language, etc.)
              </label>
              <Input
                id="meta_line"
                name="meta_line"
                placeholder="PDF · EN / FR"
                defaultValue={publication?.meta_line ?? ""}
              />
            </div>
          </div>
        ) : (
          <input type="hidden" name="meta_line" value={publication?.meta_line ?? ""} />
        )}

        {showExternalUrl ? (
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="external_url">
              External link
            </label>
            <Input
              id="external_url"
              name="external_url"
              type="url"
              placeholder="https://…"
              defaultValue={publication?.external_url ?? ""}
            />
            <p className="text-[11px] text-stone-400">
              Card opens this URL in a new tab. Required for the “External link” kind.
            </p>
          </div>
        ) : (
          <input type="hidden" name="external_url" value={publication?.external_url ?? ""} />
        )}

        {showCover ? (
          <div className="space-y-3 sm:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Cover image</h3>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative aspect-[16/10] w-full max-w-[260px] shrink-0 overflow-hidden rounded-xl bg-stone-100">
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={encodePublicationAssetUrl(coverUrl)} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full min-h-[140px] flex-col items-center justify-center gap-1 text-center text-[11px] text-stone-400">
                    <ImagePlus className="size-9 stroke-1 text-stone-300" aria-hidden />
                    No cover
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" className="h-9" onClick={() => setCoverPickerOpen(true)}>
                    Choose cover
                  </Button>
                  {coverUrl ? (
                    <Button type="button" variant="secondary" className="h-9 text-stone-500" onClick={() => setCoverUrl("")}>
                      Clear
                    </Button>
                  ) : null}
                </div>
                <Input
                  id="cover_image_alt"
                  name="cover_image_alt"
                  placeholder="Alt text (describes the cover for screen readers)"
                  defaultValue={publication?.cover_image_alt ?? ""}
                />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <PublicationCustomFields fields={fieldSchema} initialValues={initialCustomFields} />

      <MediaPicker
        isOpen={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        onSelect={(m) => {
          const url = Array.isArray(m) ? m[0]?.url : m.url;
          if (url) setCoverUrl(url);
          setCoverPickerOpen(false);
        }}
      />
      <MediaPicker
        isOpen={pdfPickerOpen}
        onClose={() => setPdfPickerOpen(false)}
        onSelect={(m) => {
          const url = Array.isArray(m) ? m[0]?.url : m.url;
          if (url) setPdfUrl(url);
          setPdfPickerOpen(false);
        }}
      />

      <div className="sticky bottom-2 flex justify-end gap-3 rounded-xl border border-stone-200/80 bg-white/95 p-3 backdrop-blur">
        <Link
          href={category ? `/dashboard/publications?tab=${encodeURIComponent(category.slug)}` : "/dashboard/publications"}
          className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border-default)] bg-white px-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-stone-50"
        >
          Cancel
        </Link>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Saving…
            </>
          ) : mode === "create" ? (
            "Create publication"
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}

export default PublicationForm;
