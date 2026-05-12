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
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import type { Database } from "@/types/database.types";

export type CategoryOption = Pick<
  Database["public"]["Tables"]["community_campaign_categories"]["Row"],
  "id" | "name" | "slug"
>;

export type CampaignRow = Database["public"]["Tables"]["community_campaigns"]["Row"];

type Props = {
  mode: "create" | "edit";
  categories: CategoryOption[];
  campaign?: CampaignRow;
};

const STATUSES = ["draft", "pending_review", "published", "archived"] as const;

export function CommunityCampaignForm({ mode, categories, campaign }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const bodyRef = useRef<NewsRichTextEditorHandle>(null);
  const [featuredPickerOpen, setFeaturedPickerOpen] = useState(false);
  const [featuredUrl, setFeaturedUrl] = useState(campaign?.featured_image_url ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [title, setTitle] = useState(campaign?.title ?? "");
  const [slug, setSlug] = useState(campaign?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(campaign?.slug));

  function isoToDatetimeLocal(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const publishedLocal = campaign?.published_at
    ? isoToDatetimeLocal(campaign.published_at)
    : "";

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
    const slugClean = slugify(String(slug || title || ""));
    if (!slugClean) {
      setSaving(false);
      setMsg({ ok: false, text: "Provide a title or URL slug." });
      return;
    }

    const category_id = String(fd.get("category_id") || "");
    if (!category_id) {
      setSaving(false);
      setMsg({ ok: false, text: "Choose a category." });
      return;
    }

    const progress_percent = Math.min(
      100,
      Math.max(0, Math.round(Number(fd.get("progress_percent") || 0))),
    );

    const status = String(fd.get("status") || "draft") as (typeof STATUSES)[number];

    const publishedRaw = String(fd.get("published_at_local") || "").trim();
    let published_at: string | null = campaign?.published_at ?? null;
    if (publishedRaw) {
      const dt = new Date(publishedRaw);
      published_at = Number.isNaN(dt.getTime()) ? null : dt.toISOString();
    }
    if (status !== "published") {
      published_at = null;
    } else if (!published_at && mode === "create") {
      published_at = new Date().toISOString();
    }

    const excerptPlain = String(fd.get("excerpt") || "").trim();
    const bodyHtml = (bodyRef.current?.getHTML() ?? "").trim();

    const donations_enabled = fd.get("donations_enabled") === "on";
    const volunteering_enabled = fd.get("volunteering_enabled") === "on";
    const presetsCsv = String(fd.get("preset_amounts_csv") || "");
    const presetsParsed = presetsCsv
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 100);
    const preset_amounts = presetsParsed.length ? presetsParsed : [1000, 5000, 10000, 50000];

    const donation_goal_raw = String(fd.get("donation_goal_amount") || "").trim();
    const fundraising_end_raw = String(fd.get("fundraising_end_date") || "").trim();
    const fundraising_end_at = fundraising_end_raw
      ? new Date(`${fundraising_end_raw}T23:59:59.999Z`).toISOString()
      : null;

    const donation_modal_description_html =
      String(fd.get("donation_modal_description_html") || "").trim() || null;

    const gallery_images =
      campaign?.gallery_images && typeof campaign.gallery_images === "object"
        ? campaign.gallery_images
        : [];

    const row = {
      slug: slugClean,
      title: String(fd.get("title") || "").trim(),
      excerpt: excerptPlain,
      body: bodyHtml ? bodyHtml : null,
      category_id,
      featured_image_url: featuredUrl.trim(),
      image_alt: String(fd.get("image_alt") || ""),
      location_label: String(fd.get("location_label") || ""),
      raised_display: String(fd.get("raised_display") || ""),
      goal_display: String(fd.get("goal_display") || ""),
      progress_percent,
      donors_count_display: String(fd.get("donors_count_display") || ""),
      days_left_display: String(fd.get("days_left_display") || ""),
      primary_action_label: String(fd.get("primary_action_label") || ""),
      primary_action_url: String(fd.get("primary_action_url") || "#donate"),
      status,
      published_at,
      donations_enabled,
      volunteering_enabled,
      preset_amounts,
      goal_amount: donation_goal_raw ? parseInt(donation_goal_raw, 10) : null,
      currency: "RWF",
      frequency_one_time: fd.get("frequency_one_time") === "on",
      frequency_weekly: fd.get("frequency_weekly") === "on",
      frequency_monthly: fd.get("frequency_monthly") === "on",
      frequency_every_n_months: fd.get("frequency_every_n_months")
        ? parseInt(String(fd.get("frequency_every_n_months")), 10)
        : null,
      frequency_every_n_years: fd.get("frequency_every_n_years")
        ? parseInt(String(fd.get("frequency_every_n_years")), 10)
        : null,
      recurring_commitment_months: fd.get("recurring_commitment_months")
        ? parseInt(String(fd.get("recurring_commitment_months")), 10)
        : null,
      gallery_images,
      fundraising_end_at,
      donation_modal_description_html,
    };

    const { data: authData } = await supabase.auth.getUser();

    let error;
    if (mode === "create") {
      const res = await supabase.from("community_campaigns").insert({
        ...row,
        created_by: authData.user?.id ?? null,
      });
      error = res.error;
    } else if (campaign) {
      const res = await supabase.from("community_campaigns").update(row).eq("id", campaign.id);
      error = res.error;
    }

    setSaving(false);

    if (error) {
      setMsg({ ok: false, text: error.message });
      return;
    }

    setMsg({ ok: true, text: mode === "create" ? "Campaign created." : "Campaign saved." });
    router.refresh();
    router.push("/dashboard/community-campaigns");
  }

  return (
    <form className="max-w-2xl space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/community-campaigns"
          className="inline-flex rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        >
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-lg font-bold text-stone-900">
          {mode === "create" ? "New campaign" : "Edit campaign"}
        </h2>
      </div>

      {msg && (
        <p role="status" className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>
          {msg.text}
        </p>
      )}

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-title">
            Title
          </label>
          <Input
            id="cc-title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Campaign headline"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-slug">
            URL slug
          </label>
          <Input
            id="cc-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="marie-uwimana-care"
          />
          <p className="text-[10px] text-stone-400">
            Public URL <span className="font-mono">/campaigns/&lt;slug&gt;</span>. Lowercase letters, numbers, hyphens.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-category">
            Category
          </label>
          <select
            id="cc-category"
            name="category_id"
            required
            defaultValue={campaign?.category_id ?? ""}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-excerpt">
            Short excerpt
          </label>
          <textarea
            id="cc-excerpt"
            name="excerpt"
            rows={2}
            defaultValue={campaign?.excerpt ?? ""}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-body">
            Full story (rich text)
          </label>
          <NewsRichTextEditor
            key={`cc-body-${campaign?.id ?? "new"}`}
            ref={bodyRef}
            initialHtml={campaign?.body ?? ""}
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Featured image
          </span>
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
              <Button type="button" variant="secondary" className="h-9 w-fit text-xs" onClick={() => setFeaturedPickerOpen(true)}>
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
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-alt">
            Featured image alt text
          </label>
          <Input id="cc-alt" name="image_alt" defaultValue={campaign?.image_alt ?? ""} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-loc">
            Location label
          </label>
          <Input id="cc-loc" name="location_label" defaultValue={campaign?.location_label ?? ""} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-raised">
              Raised (display text)
            </label>
            <Input id="cc-raised" name="raised_display" defaultValue={campaign?.raised_display ?? ""} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-goal">
              Goal (display text)
            </label>
            <Input id="cc-goal" name="goal_display" defaultValue={campaign?.goal_display ?? ""} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-pct">
              Progress %
            </label>
            <Input
              id="cc-pct"
              name="progress_percent"
              type="number"
              min={0}
              max={100}
              defaultValue={campaign?.progress_percent ?? 0}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-donors">
              Donors (display)
            </label>
            <Input
              id="cc-donors"
              name="donors_count_display"
              defaultValue={campaign?.donors_count_display ?? ""}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-days">
              Days left (display)
            </label>
            <Input id="cc-days" name="days_left_display" defaultValue={campaign?.days_left_display ?? ""} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-act-label">
              Primary action label
            </label>
            <Input
              id="cc-act-label"
              name="primary_action_label"
              defaultValue={campaign?.primary_action_label ?? "Support this campaign"}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-act-url">
              Primary action URL
            </label>
            <Input
              id="cc-act-url"
              name="primary_action_url"
              defaultValue={campaign?.primary_action_url ?? "#donate"}
              placeholder="#donate or https://…"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-amber-100 bg-amber-50/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-900/80">
            Fundraising & donation modal
          </p>
          <p className="text-[11px] leading-snug text-stone-600">
            When enabled and this campaign is published, it appears in the public donation modal and on the Donations
            dashboard. Configure presets and recurring options below.
          </p>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="donations_enabled"
              defaultChecked={Boolean(campaign?.donations_enabled)}
              className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span className="text-sm text-stone-800">Accept donations for this campaign</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="volunteering_enabled"
              defaultChecked={campaign?.volunteering_enabled !== false}
              className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span className="text-sm text-stone-800">Accept volunteer sign-ups (Get Involved)</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-stone-500" htmlFor="cc-presets">
                Preset amounts (RWF, comma-separated)
              </label>
              <Input
                id="cc-presets"
                name="preset_amounts_csv"
                defaultValue={
                  Array.isArray(campaign?.preset_amounts)
                    ? (campaign!.preset_amounts as number[]).join(", ")
                    : "1000, 5000, 10000, 50000"
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-stone-500" htmlFor="cc-dgoal">
                Goal amount (RWF, optional)
              </label>
              <Input
                id="cc-dgoal"
                name="donation_goal_amount"
                type="number"
                min={0}
                defaultValue={campaign?.goal_amount != null ? String(campaign.goal_amount) : ""}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-500" htmlFor="cc-fend">
              Fundraising deadline (optional)
            </label>
            <Input
              id="cc-fend"
              name="fundraising_end_date"
              type="date"
              defaultValue={
                campaign?.fundraising_end_at
                  ? String(campaign.fundraising_end_at).slice(0, 10)
                  : ""
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-500" htmlFor="cc-modal-html">
              Donation modal story (optional HTML)
            </label>
            <textarea
              id="cc-modal-html"
              name="donation_modal_description_html"
              rows={5}
              defaultValue={campaign?.donation_modal_description_html ?? ""}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 font-mono text-xs outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
              placeholder="Leave empty to use the full story above in the donation modal."
            />
          </div>
          <div className="rounded-lg border border-stone-200 bg-white/80 p-3 space-y-2 text-sm">
            <p className="text-[10px] font-bold uppercase text-stone-500">Recurring options (Stripe)</p>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="frequency_one_time" defaultChecked={campaign?.frequency_one_time !== false} />
              One-time
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="frequency_weekly" defaultChecked={Boolean(campaign?.frequency_weekly)} />
              Weekly
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="frequency_monthly" defaultChecked={Boolean(campaign?.frequency_monthly)} />
              Monthly
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="frequency_every_n_months"
                type="number"
                min={1}
                placeholder="Every N months"
                defaultValue={campaign?.frequency_every_n_months ?? ""}
              />
              <Input
                name="frequency_every_n_years"
                type="number"
                min={1}
                placeholder="Every N years"
                defaultValue={campaign?.frequency_every_n_years ?? ""}
              />
            </div>
            <Input
              name="recurring_commitment_months"
              type="number"
              min={1}
              placeholder="End subscription after N months (optional)"
              defaultValue={campaign?.recurring_commitment_months ?? ""}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-status">
              Publication status
            </label>
            <select
              id="cc-status"
              name="status"
              defaultValue={campaign?.status ?? "draft"}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="cc-published">
              Published at (when status is published)
            </label>
            <Input
              id="cc-published"
              name="published_at_local"
              type="datetime-local"
              defaultValue={publishedLocal}
            />
          </div>
        </div>

        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Save campaign
        </Button>
      </Card>

      <MediaPicker
        isOpen={featuredPickerOpen}
        onClose={() => setFeaturedPickerOpen(false)}
        onSelect={(m) => {
          const url = Array.isArray(m) ? m[0]?.url : m.url;
          if (url) setFeaturedUrl(url);
        }}
      />
    </form>
  );
}
