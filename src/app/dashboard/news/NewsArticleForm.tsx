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
};

export function NewsArticleForm({ mode, article, departments }: Props) {
  const router = useRouter();
  const bodyRef = useRef<NewsRichTextEditorHandle>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [featuredUrl, setFeaturedUrl] = useState(article?.image_url ?? "");
  const [featuredPickerOpen, setFeaturedPickerOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!featuredUrl.trim()) {
      setMsg({ ok: false, text: "Choose a featured image from the media library." });
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
      return;
    }
    setMsg({ ok: true, text: mode === "create" ? "Story created." : "Changes saved." });
    router.refresh();
    if (mode === "create") {
      router.push("/dashboard/news");
    }
  }

  const publishedLocal = article?.published_at
    ? isoToDatetimeLocalValue(article.published_at)
    : "";

  return (
    <form className="max-w-2xl space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/news"
          className="inline-flex rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        >
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-lg font-bold text-stone-900">
          {mode === "create" ? "New story" : "Edit story"}
        </h2>
      </div>

      {msg && (
        <p role="status" className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>
          {msg.text}
        </p>
      )}

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <div className="space-y-1">
          <label
            className="text-xs font-semibold uppercase tracking-wider text-stone-500"
            htmlFor="title"
          >
            Title
          </label>
          <Input id="title" name="title" required defaultValue={article?.title ?? ""} placeholder="Headline" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="slug">
            URL slug
          </label>
          <Input
            id="slug"
            name="slug"
            defaultValue={article?.slug ?? ""}
            placeholder="auto-generated from title if empty"
          />
          <p className="text-[11px] text-stone-400">Lowercase, hyphens. Leave blank to derive from the title.</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="excerpt">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            required
            rows={4}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
            defaultValue={article?.excerpt ?? ""}
          />
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Full story
            </label>
            <p className="mt-0.5 text-[11px] text-stone-400">
              Headings, lists, links, and inline images from your media library. Saved as HTML.
            </p>
          </div>
          <NewsRichTextEditor
            key={article?.id ?? "new"}
            ref={bodyRef}
            initialHtml={article?.body ?? ""}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
              defaultValue={article?.category ?? "development"}
            >
              {NEWS_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
              defaultValue={article?.status ?? "draft"}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label
            className="text-xs font-semibold uppercase tracking-wider text-stone-500"
            htmlFor="department_id"
          >
            Program area (department)
          </label>
          <select
            id="department_id"
            name="department_id"
            defaultValue={article?.department_id ?? ""}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
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
            defaultChecked={article?.featured ?? false}
            className="h-4 w-4 rounded border-stone-300 text-[#7A1515] accent-[#7A1515]"
          />
          Feature this story on the News page hero
        </label>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="published_at">
            Publish date / time (optional — defaults to now when publishing)
          </label>
          <Input
            id="published_at"
            name="published_at"
            type="datetime-local"
            defaultValue={publishedLocal}
          />
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Featured image (media library)
            </span>
            <p className="mt-0.5 text-[11px] text-stone-400">
              Used on the news grid, featured slot, and thumbnails — pick from uploaded media, or upload new
              assets in the library first.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative aspect-[16/10] w-full max-w-[280px] shrink-0 overflow-hidden rounded-xl bg-stone-100">
              {featuredUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- external / storage URLs
                <img src={featuredUrl} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full min-h-[140px] flex-col items-center justify-center gap-1 text-center text-[11px] text-stone-400">
                  <ImagePlus className="size-9 stroke-1 text-stone-300" aria-hidden />
                  No image selected
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-9"
                onClick={() => setFeaturedPickerOpen(true)}
              >
                Choose from library
              </Button>
              {featuredUrl ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 text-stone-500"
                  onClick={() => setFeaturedUrl("")}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="image_alt">
            Featured image alt text
          </label>
          <Input id="image_alt" name="image_alt" defaultValue={article?.image_alt ?? ""} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="external_url">
            Read-more link (optional)
          </label>
          <Input
            id="external_url"
            name="external_url"
            type="url"
            placeholder="https://…"
            defaultValue={article?.external_url ?? ""}
          />
          <p className="text-[11px] text-stone-400">
            If set, cards link here (e.g. full article elsewhere). Omit to use listing only + body in CMS.
          </p>
        </div>
      </Card>

      <MediaPicker
        isOpen={featuredPickerOpen}
        onClose={() => setFeaturedPickerOpen(false)}
        onSelect={(m) => {
          const url = Array.isArray(m) ? m[0]?.url : m.url;
          if (url) setFeaturedUrl(url);
          setFeaturedPickerOpen(false);
        }}
      />

      <div className="flex justify-end gap-3">
        <Link
          href="/dashboard/news"
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
            "Create story"
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
