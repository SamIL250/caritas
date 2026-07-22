"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  NewsRichTextEditor,
  type NewsRichTextEditorHandle,
} from "@/components/dashboard/news/NewsRichTextEditor";
import { MediaPicker } from "@/components/dashboard/MediaPicker";
import { DashboardFormActions } from "@/components/dashboard/DashboardFormActions";
import { createTestimony, updateTestimony } from "@/app/actions/testimonies";
import { encodeTestimonyAssetUrl, type TestimonyRow } from "@/lib/testimonies";

type Props = {
  mode: "create" | "edit";
  testimony?: TestimonyRow;
};

function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TestimonyForm({ mode, testimony }: Props) {
  const router = useRouter();
  const bodyRef = useRef<NewsRichTextEditorHandle>(null);
  const [coverUrl, setCoverUrl] = useState(testimony?.cover_image_url ?? "");
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const publishedLocal = testimony?.published_at
    ? isoToDatetimeLocalValue(testimony.published_at)
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!coverUrl.trim()) {
      setMsg({ ok: false, text: "Choose a cover image from the media library." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.set("body", bodyRef.current?.getHTML() ?? "");
    fd.set("cover_image_url", coverUrl.trim());

    const res =
      mode === "create"
        ? await createTestimony(fd)
        : await updateTestimony(testimony!.id, fd);

    setSaving(false);
    if (res.error) {
      setMsg({ ok: false, text: res.error });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setMsg({ ok: true, text: mode === "create" ? "Testimony created." : "Changes saved." });
    router.refresh();
    if (mode === "create") {
      router.push("/dashboard/publications?tab=testimonies");
    }
  }

  return (
    <form id="testimony-form" className="max-w-full space-y-6" onSubmit={handleSubmit} noValidate>
      <Link
        href="/dashboard/publications?tab=testimonies"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-[#7A1515]"
      >
        <ArrowLeft size={16} aria-hidden />
        Back to testimonies
      </Link>

      {msg ? (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
        >
          {msg.text}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="space-y-6 lg:col-span-8">
          <div className="space-y-6 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Basics</h3>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="title">
                Title
              </label>
              <Input id="title" name="title" required defaultValue={testimony?.title ?? ""} />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="slug">
                URL slug
              </label>
              <Input
                id="slug"
                name="slug"
                defaultValue={testimony?.slug ?? ""}
                placeholder="auto-generated from title if empty"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="excerpt">
                Card excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                required
                rows={4}
                defaultValue={testimony?.excerpt ?? ""}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
                placeholder="Short summary shown on the publications grid."
              />
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  Full testimony
                </label>
                <p className="mt-0.5 text-[11px] text-stone-400">
                  Rich text for the detail page — headings, links, and inline images from your media library.
                </p>
              </div>
              <NewsRichTextEditor
                key={testimony?.id ?? "new"}
                ref={bodyRef}
                initialHtml={testimony?.body ?? ""}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Publish</h3>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={testimony?.status ?? "draft"}
                className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="published_at">
                Publish date
              </label>
              <Input id="published_at" name="published_at" type="datetime-local" defaultValue={publishedLocal} />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="sort_order">
                Sort order
              </label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={String(testimony?.sort_order ?? 0)}
              />
              <p className="text-[11px] text-stone-400">Lower numbers appear first.</p>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Cover image</h3>
            {coverUrl.trim() ? (
              <div className="overflow-hidden rounded-xl border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodeTestimonyAssetUrl(coverUrl)}
                  alt=""
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-dashed border-stone-200 bg-stone-50 text-stone-400">
                <ImagePlus size={28} aria-hidden />
              </div>
            )}
            <Button type="button" variant="secondary" className="w-full" onClick={() => setCoverPickerOpen(true)}>
              {coverUrl.trim() ? "Change image" : "Choose image"}
            </Button>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="cover_image_alt">
                Image alt text
              </label>
              <Input
                id="cover_image_alt"
                name="cover_image_alt"
                defaultValue={testimony?.cover_image_alt ?? ""}
              />
            </div>
          </div>
        </div>
      </div>

      {coverPickerOpen ? (
        <MediaPicker
          isOpen
          onClose={() => setCoverPickerOpen(false)}
          onSelect={(m: any) => {
            const url = Array.isArray(m) ? m[0]?.url : m?.url;
            if (url) setCoverUrl(url);
            setCoverPickerOpen(false);
          }}
        />
      ) : null}

      <DashboardFormActions formId="testimony-form">
        <Link
          href="/dashboard/publications?tab=testimonies"
          className="flex-1 inline-flex h-10 items-center justify-center rounded-md border border-[var(--color-border-default)] bg-white px-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-stone-50"
        >
          Cancel
        </Link>
        <Button type="submit" form="testimony-form" variant="primary" disabled={saving} className="flex-1 h-10">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Saving…
            </>
          ) : mode === "create" ? (
            "Create testimony"
          ) : (
            "Save changes"
          )}
        </Button>
      </DashboardFormActions>
    </form>
  );
}
