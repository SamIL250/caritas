"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Loader2, ArrowLeft, ImagePlus } from "lucide-react";
import { NEWS_CATEGORIES } from "@/lib/news";
import { createNewsArticle, updateNewsArticle } from "@/app/actions/news";
import type { NewsArticleRow } from "@/lib/news";
import type { ProgramDepartmentOption } from "@/lib/program-departments";
import {
  NewsRichTextEditor,
  type NewsRichTextEditorHandle,
} from "@/components/dashboard/news/NewsRichTextEditor";
import { MediaPicker } from "@/components/dashboard/MediaPicker";

type Props = {
  mode: "create" | "edit";
  article?: NewsArticleRow;
  departments: ProgramDepartmentOption[];
  /** Pre-fill defaults from an existing article when duplicating (create mode only). */
  duplicateFrom?: NewsArticleRow | null;
};

export function NewsArticleForm({ mode, article, departments, duplicateFrom }: Props) {
  const router = useRouter();
  const bodyRef = useRef<NewsRichTextEditorHandle>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const source = mode === "edit" ? article : duplicateFrom ?? null;
  const [featuredUrl, setFeaturedUrl] = useState(source?.image_url ?? "");
  const [featuredPickerOpen, setFeaturedPickerOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!featuredUrl.trim()) {
      setMsg({ ok: false, text: "Choose a featured image from the media library." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.set("body", bodyRef.current?.getHTML() ?? "");
    fd.set("image_url", featuredUrl.trim());

    const res =
      mode === "create"
        ? await createNewsArticle(fd)
        : await updateNewsArticle(article!.id, fd);
    setSaving(false);
    if (res.error) {
      setMsg({ ok: false, text: res.error });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setMsg({ ok: true, text: mode === "create" ? "Story created." : "Changes saved." });
    router.refresh();
    if (mode === "create") {
      router.push("/dashboard/news");
    }
  }

  const publishedLocal = source?.published_at
    ? isoToDatetimeLocalValue(source?.published_at)
    : "";

  return (
    <form className="max-w-full space-y-6" onSubmit={handleSubmit} noValidate>
      {msg && (
        <p role="status" className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-6 rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Basics</h3>

            <div className="space-y-1">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
                htmlFor="title"
              >
            Title
          </label>
          <Input id="title" name="title" required defaultValue={source?.title ?? ""} placeholder="Headline" />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="slug">
            URL slug
          </label>
          <Input
            id="slug"
            name="slug"
            defaultValue={source?.slug ?? ""}
            placeholder="auto-generated from title if empty"
          />
          <p className="text-[11px] text-stone-400">Lowercase, hyphens. Leave blank to derive from the title.</p>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="excerpt">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            required
            rows={4}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
            defaultValue={source?.excerpt ?? ""}
          />
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Full story
            </label>
            <p className="mt-0.5 text-[11px] text-stone-400">
              Headings, lists, links, and inline images from your media library. Saved as HTML.
            </p>
          </div>
          <NewsRichTextEditor
            key={source?.id ? `${source.id}-${duplicateFrom ? "copy" : "edit"}` : "new"}
            ref={bodyRef}
            initialHtml={source?.body ?? ""}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm"
              defaultValue={source?.category ?? "development"}
            >
              {NEWS_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm"
              defaultValue={source?.status ?? "draft"}
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
            defaultValue={source?.department_id ?? ""}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Cross-cutting / not assigned</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-stone-400">
            Used for related content and filtering on the public News page (pillar axis).
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-700">
          <input
            type="checkbox"
            name="featured"
            value="on"
            defaultChecked={source?.featured ?? false}
            className="h-4 w-4 rounded border-stone-300 text-[#7A1515] accent-[#7A1515]"
          />
          Feature this story on the News page hero
        </label>
      </div>
    </div>

    <div className="lg:col-span-4 space-y-6">
      <div className="space-y-6 rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 sm:p-6 shadow-sm">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="published_at">
            Publish Date / Time
          </label>
          <Input
            id="published_at"
            name="published_at"
            type="datetime-local"
            defaultValue={publishedLocal}
          />
          <p className="text-[11px] text-stone-400">Defaults to now when publishing.</p>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Featured image
            </span>
            <p className="mt-0.5 text-[11px] text-stone-400">
              Used on the news grid, featured slot, and thumbnails.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-stone-100 border border-stone-200/50">
              {featuredUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featuredUrl} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-1 text-[11px] text-stone-400">
                  <ImagePlus className="size-8 stroke-1 text-stone-300" aria-hidden />
                  No image selected
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-9 flex-1"
                onClick={() => setFeaturedPickerOpen(true)}
              >
                Choose from library
              </Button>
              {featuredUrl ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 text-stone-500 flex-none"
                  onClick={() => setFeaturedUrl("")}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="image_alt">
            Image Alt Text
          </label>
          <Input id="image_alt" name="image_alt" defaultValue={source?.image_alt ?? ""} />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="external_url">
            External Link (Optional)
          </label>
          <Input
            id="external_url"
            name="external_url"
            type="url"
            placeholder="https://…"
            defaultValue={source?.external_url ?? ""}
          />
          <p className="text-[11px] text-stone-400">
            If set, cards link directly here. Omit to use the internal story body.
          </p>
        </div>
      </div>
    </div>
  </div>

      <MediaPicker
        isOpen={featuredPickerOpen}
        onClose={() => setFeaturedPickerOpen(false)}
        onSelect={(m) => {
          const url = Array.isArray(m) ? m[0]?.url : m.url;
          if (url) setFeaturedUrl(url);
          setFeaturedPickerOpen(false);
        }}
      />

      <div className="sticky bottom-4 flex gap-3 rounded-xl border border-stone-200/80 bg-white/95 p-3 backdrop-blur mt-8 z-50 shadow-lg">
        <Link
          href="/dashboard/news"
          className="flex-1 inline-flex h-10 items-center justify-center rounded-md border border-[var(--color-border-default)] bg-white px-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-stone-50"
        >
          Cancel
        </Link>
        <Button type="submit" variant="primary" disabled={saving} className="flex-1 h-10">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Saving…
            </>
          ) : mode === "create" && !duplicateFrom ? (
            "Create story"
          ) : mode === "create" ? (
            "Duplicate story"
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}

function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
