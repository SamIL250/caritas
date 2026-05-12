"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { MediaPicker } from "@/components/dashboard/MediaPicker";
import {
  NewsRichTextEditor,
  type NewsRichTextEditorHandle,
} from "@/components/dashboard/news/NewsRichTextEditor";
import type { Database, Json } from "@/types/database.types";
import { createCommunityCampaign, updateCommunityCampaign } from "@/app/actions/community-campaigns";
import { CampaignFundraisingStatsPanel } from "@/components/dashboard/community-campaigns/CampaignFundraisingStatsPanel";

type CampaignRow = Database["public"]["Tables"]["community_campaigns"]["Row"];
type CategoryRow = Database["public"]["Tables"]["community_campaign_categories"]["Row"];

function isoToDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function presetsToString(raw: Json | undefined): string {
  if (Array.isArray(raw)) {
    const nums = raw.map((x) => Number(x)).filter((n) => Number.isFinite(n));
    return nums.length ? nums.join(", ") : "1000, 5000, 10000, 50000";
  }
  return "1000, 5000, 10000, 50000";
}

type Props = {
  mode: "create" | "edit";
  campaign?: CampaignRow;
  categories: CategoryRow[];
  /** Opens Home in the page editor with the Featured campaign section selected (if configured). */
  homeFeaturedEditorHref?: string | null;
};

export function CampaignForm({ mode, campaign, categories, homeFeaturedEditorHref }: Props) {
  const router = useRouter();
  const bodyRef = useRef<NewsRichTextEditorHandle>(null);
  const modalHtmlRef = useRef<NewsRichTextEditorHandle>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [imageUrl, setImageUrl] = useState(campaign?.featured_image_url ?? "");
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.set("body", bodyRef.current?.getHTML() ?? "");
    fd.set("donation_modal_description_html", modalHtmlRef.current?.getHTML() ?? "");
    fd.set("featured_image_url", imageUrl.trim());

    const res =
      mode === "create" ? await createCommunityCampaign(fd) : await updateCommunityCampaign(campaign!.id, fd);
    setSaving(false);
    if ("error" in res && res.error) {
      setMsg({ ok: false, text: res.error });
      return;
    }
    setMsg({ ok: true, text: mode === "create" ? "Campaign created." : "Changes saved." });
    router.refresh();
    if (mode === "create" && "id" in res && res.id) {
      router.push(`/dashboard/community-campaigns/${res.id}`);
    }
  }

  const defaultCat = categories[0]?.id ?? "";

  return (
    <form className="max-w-3xl space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/community-campaigns"
          className="inline-flex rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        >
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-lg font-bold text-stone-900">
          {mode === "create" ? "New campaign" : "Edit campaign"}
        </h2>
        {homeFeaturedEditorHref ? (
          <Link
            href={homeFeaturedEditorHref}
            className="ml-auto text-xs font-semibold uppercase tracking-wider text-[#7A1515] underline decoration-[#7A1515]/30 underline-offset-2 hover:decoration-[#7A1515]/60"
          >
            Preview Featured block in page editor
          </Link>
        ) : null}
      </div>

      {campaign?.featured_on_home ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          This campaign is currently <strong>featured on the home page</strong>. You can change that from the Campaigns
          list.
        </p>
      ) : null}

      {msg ? (
        <p role="status" className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>
          {msg.text}
        </p>
      ) : null}

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Basics</h3>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="title">
            Title
          </label>
          <Input id="title" name="title" required defaultValue={campaign?.title ?? ""} placeholder="Campaign title" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="slug">
            URL slug
          </label>
          <Input id="slug" name="slug" defaultValue={campaign?.slug ?? ""} placeholder="Leave blank to derive from title" />
          <p className="text-[11px] text-stone-400">Public URL: /campaigns/your-slug</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="category_id">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              required
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
              defaultValue={campaign?.category_id ?? defaultCat}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
              defaultValue={campaign?.status ?? "draft"}
            >
              <option value="draft">Draft</option>
              <option value="pending_review">Pending review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="published_at">
            Published at (optional)
          </label>
          <Input
            id="published_at"
            name="published_at"
            type="datetime-local"
            defaultValue={isoToDatetimeLocalValue(campaign?.published_at)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="excerpt">
            Short excerpt / summary
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            required
            rows={4}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
            defaultValue={campaign?.excerpt ?? ""}
          />
        </div>
      </Card>

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Full story</h3>
        <NewsRichTextEditor key={`body-${campaign?.id ?? "new"}`} ref={bodyRef} initialHtml={campaign?.body ?? ""} />
      </Card>

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Featured image</h3>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" className="gap-2 text-xs" onClick={() => setImagePickerOpen(true)}>
            <ImagePlus size={16} aria-hidden />
            Choose from media library
          </Button>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- dashboard CMS picker URL
            <img src={imageUrl} alt="" className="h-20 max-w-[200px] rounded-lg border border-stone-200 object-cover" />
          ) : null}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="image_alt">
            Image alt text
          </label>
          <Input id="image_alt" name="image_alt" defaultValue={campaign?.image_alt ?? ""} />
        </div>
      </Card>

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Story card details</h3>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="location_label">
            Location label
          </label>
          <Input id="location_label" name="location_label" defaultValue={campaign?.location_label ?? ""} />
        </div>
        <CampaignFundraisingStatsPanel
          campaignId={campaign?.id}
          currency={campaign?.currency ?? "RWF"}
          goalAmount={
            typeof campaign?.goal_amount === "number" && campaign.goal_amount > 0 ? campaign.goal_amount : null
          }
        />
        <p className="text-[11px] leading-relaxed text-stone-500">
          Goal amount and optional fundraising end date are set under <strong>Donations</strong> below. Days remaining on
          the public card use that end date.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="primary_action_label">
              Primary button label
            </label>
            <Input id="primary_action_label" name="primary_action_label" defaultValue={campaign?.primary_action_label ?? ""} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="primary_action_url">
              Primary button URL
            </label>
            <Input id="primary_action_url" name="primary_action_url" defaultValue={campaign?.primary_action_url ?? "#donate"} placeholder="#donate" />
            <p className="text-[11px] text-stone-400">Use #donate to open the donation modal.</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Donations</h3>
        <p className="text-[11px] leading-relaxed text-stone-500">
          When enabled and status is <strong>published</strong>, this campaign appears in the donation modal and under{" "}
          <strong>Dashboard → Donations</strong>. Donate buttons that pass #donate use the modal.
        </p>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-3">
          <input
            type="checkbox"
            name="donations_enabled"
            defaultChecked={campaign?.donations_enabled ?? false}
            className="mt-1 h-4 w-4 accent-[#7A1515]"
          />
          <span className="text-sm font-medium text-stone-800">Accept donations for this campaign</span>
        </label>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="preset_amounts">
            Preset amounts (numbers, comma-separated)
          </label>
          <Input id="preset_amounts" name="preset_amounts" defaultValue={presetsToString(campaign?.preset_amounts)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="goal_amount">
              Goal amount (numeric, optional)
            </label>
            <Input
              id="goal_amount"
              name="goal_amount"
              type="number"
              min={1}
              defaultValue={campaign?.goal_amount ?? ""}
              placeholder="e.g. 600000"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="currency">
              Currency code
            </label>
            <Input id="currency" name="currency" defaultValue={campaign?.currency ?? "RWF"} maxLength={8} />
          </div>
        </div>
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Recurring options shown</span>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="frequency_one_time" defaultChecked={campaign?.frequency_one_time ?? true} className="h-4 w-4 accent-[#7A1515]" />
            One-time
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="frequency_weekly" defaultChecked={campaign?.frequency_weekly ?? false} className="h-4 w-4 accent-[#7A1515]" />
            Weekly
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="frequency_monthly" defaultChecked={campaign?.frequency_monthly ?? false} className="h-4 w-4 accent-[#7A1515]" />
            Monthly
          </label>
        </div>
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Donation modal intro (optional HTML)
          </span>
          <p className="text-[11px] text-stone-400">Shown above amounts when donating to this campaign; falls back to the story if empty.</p>
          <NewsRichTextEditor
            key={`modal-${campaign?.id ?? "new"}`}
            ref={modalHtmlRef}
            initialHtml={campaign?.donation_modal_description_html ?? ""}
          />
        </div>
      </Card>

      <MediaPicker
        isOpen={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelect={(m) => {
          const url = Array.isArray(m) ? m[0]?.url : m.url;
          if (url) setImageUrl(url);
          setImagePickerOpen(false);
        }}
      />

      <div className="flex justify-end gap-3">
        <Link
          href="/dashboard/community-campaigns"
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
            "Create campaign"
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}
