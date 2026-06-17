"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, ImagePlus, Loader2, Star } from "lucide-react";
import {
  encodeProgramAssetUrl,
  type ProgramCategoryRow,
  type ProgramRow,
} from "@/lib/programs";
import { createProgram, updateProgram } from "@/app/actions/programs";
import { MediaPicker } from "@/components/dashboard/MediaPicker";
import { ProgramCategoryIcon } from "@/components/dashboard/programs/ProgramCategoryIcon";
import {
  ProgramRichTextEditor,
  type ProgramRichTextEditorHandle,
} from "@/components/dashboard/programs/ProgramRichTextEditor";

type Props = {
  mode: "create" | "edit";
  program?: ProgramRow;
  categories: ProgramCategoryRow[];
  initialCategorySlug?: string | null;
};

function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function pickInitialCategory(
  categories: ProgramCategoryRow[],
  program: ProgramRow | undefined,
  initialSlug: string | null | undefined,
): ProgramCategoryRow | null {
  if (program) {
    const byId = categories.find((c) => c.id === program.category_id);
    if (byId) return byId;
  }
  if (initialSlug) {
    const bySlug = categories.find((c) => c.slug === initialSlug);
    if (bySlug) return bySlug;
  }
  return categories[0] ?? null;
}

function ProgramForm({ mode, program, categories, initialCategorySlug }: Props) {
  const router = useRouter();
  const bodyRef = useRef<ProgramRichTextEditorHandle>(null);

  const [categoryId, setCategoryId] = useState<string>(
    pickInitialCategory(categories, program, initialCategorySlug)?.id ?? "",
  );
  const category = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const [coverUrl, setCoverUrl] = useState(program?.cover_image_url ?? "");
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!category) {
      setMsg({ ok: false, text: "Pick a program category first." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setMsg(null);
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    fd.set("category_id", category.id);
    fd.set("cover_image_url", coverUrl.trim());
    fd.set("body", bodyRef.current?.getHTML() ?? "");

    const res =
      mode === "create"
        ? await createProgram(fd)
        : await updateProgram(program!.id, fd);
    setSaving(false);
    if (res.error) {
      setMsg({ ok: false, text: res.error });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setMsg({ ok: true, text: mode === "create" ? "Program created." : "Changes saved." });
    router.refresh();
    if (mode === "create") {
      router.push(`/dashboard/programs?tab=${encodeURIComponent(category.slug)}`);
    }
  }

  const publishedLocal = program?.published_at
    ? isoToDatetimeLocalValue(program.published_at)
    : "";

  return (
    <form className="max-w-full space-y-6" onSubmit={handleSubmit} noValidate>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Basics</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
                  htmlFor="category"
                >
                  Program area
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
                  htmlFor="status"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={program?.status ?? "draft"}
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
                htmlFor="title"
              >
                Title
              </label>
              <Input id="title" name="title" required defaultValue={program?.title ?? ""} placeholder="A clear, descriptive title" />
            </div>

            <div className="space-y-1">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
                htmlFor="slug"
              >
                URL slug
              </label>
              <Input
                id="slug"
                name="slug"
                defaultValue={program?.slug ?? ""}
                placeholder="auto-generated from title if empty"
              />
              <p className="text-[11px] text-stone-400">
                Lowercase, hyphens. Leave blank to derive from the title.
              </p>
            </div>

            <div className="space-y-1">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
                htmlFor="excerpt"
              >
                Short summary
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                defaultValue={program?.excerpt ?? ""}
                placeholder="One or two sentences shown on the program card and the article hero."
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
              />
            </div>

            <div className="space-y-1">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
                htmlFor="subtitle"
              >
                Subtitle (Optional)
              </label>
              <Input id="subtitle" name="subtitle" defaultValue={(program as any)?.subtitle ?? ""} placeholder="e.g. Be Resilient, Be Self Reliant" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
                  htmlFor="location"
                >
                  Location
                </label>
                <Input id="location" name="location" defaultValue={(program as any)?.location ?? ""} placeholder="e.g. Karongi, Nyamasheke" />
              </div>
              <div className="space-y-1">
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
                  htmlFor="contact_phone"
                >
                  Contact Phone
                </label>
                <Input id="contact_phone" name="contact_phone" defaultValue={(program as any)?.contact_phone ?? ""} placeholder="e.g. +250 078X XXX XXX" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
                  htmlFor="published_at"
                >
                  Publish date / time
                </label>
                <Input
                  id="published_at"
                  name="published_at"
                  type="datetime-local"
                  defaultValue={publishedLocal}
                />
                <p className="text-[11px] text-stone-400">Defaults to now when published.</p>
              </div>
              <div className="space-y-1">
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
                  htmlFor="tag_label"
                >
                  Tag label (optional)
                </label>
                <Input
                  id="tag_label"
                  name="tag_label"
                  placeholder="e.g. Livelihoods"
                  defaultValue={program?.tag_label ?? ""}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
                  htmlFor="tag_icon"
                >
                  Tag icon class (FontAwesome, optional)
                </label>
                <Input
                  id="tag_icon"
                  name="tag_icon"
                  placeholder="fa-solid fa-tag"
                  defaultValue={program?.tag_icon ?? ""}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm font-medium text-amber-900">
              <input
                type="checkbox"
                name="featured"
                value="on"
                defaultChecked={program?.featured ?? false}
                className="size-4 rounded border-amber-400 accent-[#b45309]"
              />
              <Star className="size-4" aria-hidden />
              <span className="flex-1">
                Feature this program on the /programs hero (multiple featured programs cycle in the
                featured slot).
              </span>
            </label>
          </Card>

          <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
            <header>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Article body
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                Rich text — use the toolbar to add headings, lists, images and embed PDFs/files from
                your media library. Stored as HTML.
              </p>
            </header>
            <ProgramRichTextEditor
              key={program?.id ?? "new"}
              ref={bodyRef}
              initialHtml={program?.body ?? ""}
            />
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
            <header>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Cover image
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                Used on the program card and as the article hero background.
              </p>
            </header>
            <div className="flex flex-col gap-4">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-stone-100">
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={encodeProgramAssetUrl(coverUrl)}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full min-h-[140px] flex-col items-center justify-center gap-1 text-center text-[11px] text-stone-400">
                    <ImagePlus className="size-9 stroke-1 text-stone-300" aria-hidden />
                    No cover selected
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 w-full"
                    onClick={() => setCoverPickerOpen(true)}
                  >
                    Choose from library
                  </Button>
                  {coverUrl ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-9 text-stone-500 w-full"
                      onClick={() => setCoverUrl("")}
                    >
                      Clear
                    </Button>
                  ) : null}
                </div>
                <Input
                  id="cover_image_alt"
                  name="cover_image_alt"
                  placeholder="Alt text — describes the image for screen readers."
                  defaultValue={program?.cover_image_alt ?? ""}
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
            <header>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                External link (optional)
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                If the full story lives on another site, drop the URL here.
              </p>
            </header>
            <Input
              id="external_url"
              name="external_url"
              type="url"
              placeholder="https://…"
              defaultValue={program?.external_url ?? ""}
            />
          </Card>
        </div>
      </div>

      <MediaPicker
        isOpen={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        onSelect={(m) => {
          const url = Array.isArray(m) ? m[0]?.url : m.url;
          if (url) setCoverUrl(url);
          setCoverPickerOpen(false);
        }}
      />

      <div className="sticky bottom-4 flex gap-3 rounded-xl border border-stone-200/80 bg-white/95 p-3 backdrop-blur mt-8 z-50 shadow-lg">
        <Link
          href={
            category
              ? `/dashboard/programs?tab=${encodeURIComponent(category.slug)}`
              : "/dashboard/programs"
          }
          className="flex-1 inline-flex h-10 items-center justify-center rounded-md border border-[var(--color-border-default)] bg-white px-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-stone-50"
        >
          Cancel
        </Link>
        <Button type="submit" variant="primary" disabled={saving} className="flex-1 h-10">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Saving…
            </>
          ) : mode === "create" ? (
            "Create program"
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}

export default ProgramForm;
