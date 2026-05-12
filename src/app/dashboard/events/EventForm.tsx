"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MediaPicker } from "@/components/dashboard/MediaPicker";
import {
  NewsRichTextEditor,
  type NewsRichTextEditorHandle,
} from "@/components/dashboard/news/NewsRichTextEditor";
import { slugify } from "@/lib/slugify";
import { createEvent, updateEvent } from "@/app/actions/events";
import type { EventRow } from "@/lib/events";

type Props = {
  mode: "create" | "edit";
  event?: EventRow;
};

const STATUSES = ["draft", "published", "cancelled"] as const;

function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventForm({ mode, event }: Props) {
  const router = useRouter();
  const bodyRef = useRef<NewsRichTextEditorHandle>(null);

  const [featuredPickerOpen, setFeaturedPickerOpen] = useState(false);
  const [featuredUrl, setFeaturedUrl] = useState(event?.featured_image_url ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [title, setTitle] = useState(event?.title ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(event?.slug));

  function handleTitleBlur() {
    if (!slugTouched && mode === "create") {
      const s = slugify(title);
      if (s) setSlug(s);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    const description_html = (bodyRef.current?.getHTML() ?? "").trim();
    fd.set("description_html", description_html);
    if (slug.trim()) fd.set("slug", slug.trim());
    if (featuredUrl.trim()) fd.set("featured_image_url", featuredUrl.trim());

    const startsRaw = String(fd.get("starts_at") || "").trim();
    const endsRaw = String(fd.get("ends_at") || "").trim();
    if (startsRaw && endsRaw && new Date(endsRaw).getTime() < new Date(startsRaw).getTime()) {
      setSaving(false);
      setMsg({ ok: false, text: "End date/time cannot be before the start." });
      return;
    }

    const result =
      mode === "create" ? await createEvent(fd) : await updateEvent(event!.id, fd);

    setSaving(false);
    if (result.error) {
      setMsg({ ok: false, text: result.error });
      return;
    }
    setMsg({ ok: true, text: "Saved." });

    if (mode === "create" && "id" in result && result.id) {
      router.push(`/dashboard/events/${result.id}`);
    } else {
      router.refresh();
    }
  }

  const startsLocal = isoToDatetimeLocal(event?.starts_at);
  const endsLocal = isoToDatetimeLocal(event?.ends_at);
  const publishedLocal = isoToDatetimeLocal(event?.published_at);

  return (
    <form onSubmit={(ev) => void handleSubmit(ev)} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/events"
          className="inline-flex rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        >
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-lg font-bold text-stone-900">
          {mode === "create" ? "New event" : "Edit event"}
        </h2>
      </div>

      {msg && (
        <p role="status" className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>
          {msg.text}
        </p>
      )}

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-title">
            Title
          </label>
          <Input
            id="ev-title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="E.g. Volunteer training day"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-slug">
            URL slug
          </label>
          <Input
            id="ev-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="volunteer-training-day"
          />
          <p className="text-[10px] text-stone-400">
            Internal reference and deep links — lowercase letters, numbers, hyphens.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-category">
              Category label
            </label>
            <Input
              id="ev-category"
              name="category_label"
              defaultValue={event?.category_label ?? ""}
              placeholder="Training · Outreach · Fundraiser…"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-status">
              Status
            </label>
            <select
              id="ev-status"
              name="status"
              defaultValue={event?.status ?? "draft"}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-summary">
            Short summary
          </label>
          <textarea
            id="ev-summary"
            name="summary"
            rows={2}
            maxLength={1000}
            defaultValue={event?.summary ?? ""}
            placeholder="One-sentence description shown in the events list."
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-body">
            Full description (rich text)
          </label>
          <NewsRichTextEditor
            key={`ev-body-${event?.id ?? "new"}`}
            ref={bodyRef}
            initialHtml={event?.description_html ?? ""}
          />
        </div>
      </Card>

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          When &amp; where
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-starts">
              Starts <span className="text-red-600">*</span>
            </label>
            <Input
              id="ev-starts"
              name="starts_at"
              type="datetime-local"
              required
              defaultValue={startsLocal}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-ends">
              Ends (optional)
            </label>
            <Input id="ev-ends" name="ends_at" type="datetime-local" defaultValue={endsLocal} />
            <p className="text-[10px] text-stone-400">
              Must be the same as or after the start. Leave empty for open-ended.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2.5">
            <input
              type="checkbox"
              name="is_all_day"
              defaultChecked={Boolean(event?.is_all_day)}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            <span className="text-sm text-stone-800">All-day event</span>
          </label>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-tz">
              Timezone (IANA)
            </label>
            <Input
              id="ev-tz"
              name="timezone"
              defaultValue={event?.timezone ?? "Africa/Kigali"}
              placeholder="Africa/Kigali"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-loc">
              Location label
            </label>
            <Input
              id="ev-loc"
              name="location_label"
              defaultValue={event?.location_label ?? ""}
              placeholder="Caritas HQ · Kacyiru"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-loc-url">
              Map link / URL (optional)
            </label>
            <Input
              id="ev-loc-url"
              name="location_url"
              type="url"
              defaultValue={event?.location_url ?? ""}
              placeholder="https://maps.google.com/…"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-loc-addr">
            Address / venue notes (optional)
          </label>
          <textarea
            id="ev-loc-addr"
            name="location_address"
            rows={2}
            defaultValue={event?.location_address ?? ""}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          />
        </div>
      </Card>

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Imagery
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
            {featuredUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- picked from media library
              <img src={featuredUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-stone-400">
                <ImagePlus size={28} aria-hidden />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-9 w-fit text-xs"
              onClick={() => setFeaturedPickerOpen(true)}
            >
              Choose from library…
            </Button>
            {featuredUrl ? (
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-fit text-xs text-red-600 hover:bg-red-50"
                onClick={() => setFeaturedUrl("")}
              >
                Remove image
              </Button>
            ) : null}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-alt">
            Image alt text
          </label>
          <Input id="ev-alt" name="image_alt" defaultValue={event?.image_alt ?? ""} />
        </div>
      </Card>

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Registration &amp; contact
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-reg">
              Registration URL (optional)
            </label>
            <Input
              id="ev-reg"
              name="registration_url"
              type="url"
              defaultValue={event?.registration_url ?? ""}
              placeholder="https://forms.gle/…"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-cap">
              Capacity / spots label
            </label>
            <Input
              id="ev-cap"
              name="capacity_label"
              defaultValue={event?.capacity_label ?? ""}
              placeholder="Limited to 30 volunteers"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-email">
              Contact email
            </label>
            <Input
              id="ev-email"
              name="contact_email"
              type="email"
              defaultValue={event?.contact_email ?? ""}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-phone">
              Contact phone
            </label>
            <Input id="ev-phone" name="contact_phone" defaultValue={event?.contact_phone ?? ""} />
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2.5">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={Boolean(event?.featured)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          <span className="text-sm text-stone-800">Mark as featured event</span>
        </label>
      </Card>

      <Card className="space-y-3 border-stone-200/90 p-4 sm:p-6">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="ev-pub">
            Published at (auto when status is published)
          </label>
          <Input
            id="ev-pub"
            name="published_at_local"
            type="datetime-local"
            defaultValue={publishedLocal}
          />
        </div>
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Save event
        </Button>
      </Card>

      <MediaPicker
        isOpen={featuredPickerOpen}
        onClose={() => setFeaturedPickerOpen(false)}
        onSelect={(m) => {
          setFeaturedPickerOpen(false);
          if (Array.isArray(m)) setFeaturedUrl(m[0]?.url ?? "");
          else setFeaturedUrl(m.url);
        }}
      />
    </form>
  );
}
