"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  deleteCommunityCampaignCategory,
  setCampaignDonationsEnabled,
  setCampaignVolunteeringEnabled,
  setFeaturedCampaignOnHome,
  upsertCommunityCampaignCategory,
} from "@/app/actions/community-campaigns";
import { CampaignModerationQueues } from "@/components/dashboard/community-campaigns/CampaignModerationQueues";
import { ExternalLink, Pencil, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Database } from "@/types/database.types";

import type { EnrichedModerationComment } from "@/lib/community-campaign-moderation-data";

type CampaignRow = Database["public"]["Tables"]["community_campaigns"]["Row"];
type CategoryRow = Database["public"]["Tables"]["community_campaign_categories"]["Row"];

export type PendingCommentRow = EnrichedModerationComment;

type TabKey = "campaigns" | "categories" | "moderation";

function tabFromSearch(raw: string | null): TabKey {
  if (raw === "categories" || raw === "moderation") return raw;
  return "campaigns";
}

export default function CampaignsDashboardClient({
  campaigns,
  categories,
  pendingComments,
  approvedComments,
  rejectedComments,
  homeFeaturedEditorHref,
  featuredSectionConfigured,
}: {
  campaigns: CampaignRow[];
  categories: CategoryRow[];
  pendingComments: PendingCommentRow[];
  approvedComments: PendingCommentRow[];
  rejectedComments: PendingCommentRow[];
  /** `/dashboard/pages/{homeId}?section={featuredSectionId}` or null */
  homeFeaturedEditorHref: string | null;
  featuredSectionConfigured: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = useMemo(() => tabFromSearch(searchParams.get("tab")), [searchParams]);

  const [pending, startTransition] = useTransition();
  const featuredId = campaigns.find((c) => c.featured_on_home)?.id ?? null;

  function setTab(next: TabKey) {
    const q = new URLSearchParams(searchParams.toString());
    if (next === "campaigns") q.delete("tab");
    else q.set("tab", next);
    router.push(`/dashboard/community-campaigns${q.toString() ? `?${q}` : ""}`);
  }

  function submitFeatured(id: string | null) {
    startTransition(async () => {
      const fd = new FormData();
      if (id) fd.set("campaign_id", id);
      await setFeaturedCampaignOnHome(fd);
      router.refresh();
    });
  }

  const tabs: { key: TabKey; label: string; badge?: number }[] = [
    { key: "campaigns", label: "Campaigns" },
    { key: "categories", label: "Categories", badge: categories.length },
    { key: "moderation", label: "Comment moderation", badge: pendingComments.length },
  ];

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-px">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`relative -mb-px rounded-t-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === t.key
                ? "border border-b-0 border-stone-200 bg-white text-[#7A1515]"
                : "border border-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-800"
            }`}
          >
            {t.label}
            {t.badge !== undefined && t.badge > 0 && t.key === "moderation" ? (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "campaigns" ? (
        <CampaignsTab
          campaigns={campaigns}
          featuredId={featuredId}
          pending={pending}
          submitFeatured={submitFeatured}
          homeFeaturedEditorHref={homeFeaturedEditorHref}
          featuredSectionConfigured={featuredSectionConfigured}
        />
      ) : null}

      {tab === "categories" ? (
        <CategoriesTab categories={categories} />
      ) : null}

      {tab === "moderation" ? (
        <CampaignModerationQueues
          pendingComments={pendingComments}
          approvedComments={approvedComments}
          rejectedComments={rejectedComments}
        />
      ) : null}
    </div>
  );
}

function CampaignsTab({
  campaigns,
  featuredId,
  pending,
  submitFeatured,
  homeFeaturedEditorHref,
  featuredSectionConfigured,
}: {
  campaigns: CampaignRow[];
  featuredId: string | null;
  pending: boolean;
  submitFeatured: (id: string | null) => void;
  homeFeaturedEditorHref: string | null;
  featuredSectionConfigured: boolean;
}) {
  const router = useRouter();
  const [donationsBusyId, setDonationsBusyId] = useState<string | null>(null);
  const [volunteerBusyId, setVolunteerBusyId] = useState<string | null>(null);
  const [campaignSettingsErr, setCampaignSettingsErr] = useState<string | null>(null);

  async function toggleDonations(id: string, next: boolean) {
    setCampaignSettingsErr(null);
    setDonationsBusyId(id);
    const res = await setCampaignDonationsEnabled(id, next);
    setDonationsBusyId(null);
    if (res.error) setCampaignSettingsErr(res.error);
    router.refresh();
  }

  async function toggleVolunteering(id: string, next: boolean) {
    setCampaignSettingsErr(null);
    setVolunteerBusyId(id);
    const res = await setCampaignVolunteeringEnabled(id, next);
    setVolunteerBusyId(null);
    if (res.error) setCampaignSettingsErr(res.error);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-2 text-sm leading-relaxed text-stone-600">
          <p>
            Edit campaigns (story, imagery, fundraising) with <strong>New campaign</strong> or <strong>Edit</strong>.
            Use the toggles for <strong>donations</strong> (
            <Link href="/dashboard/donations" className="font-medium text-[#7A1515] underline underline-offset-2">
              Donations
            </Link>
            ) and <strong>volunteers</strong> (
            <Link href="/get-involved" className="font-medium text-[#7A1515] underline underline-offset-2">
              Get Involved
            </Link>
            ) when published.
          </p>
          <p>
            The homepage <strong>Featured campaign</strong> block reads from <strong>Feature on home page</strong>{" "}
            (published only).
          </p>
          {!featuredSectionConfigured ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Add a <strong>Featured campaign</strong> section on{" "}
              <strong>Pages → Home</strong> to preview that block in the page editor.
            </p>
          ) : homeFeaturedEditorHref ? (
            <p>
              <Link
                href={homeFeaturedEditorHref}
                className="font-semibold text-[#7A1515] underline decoration-[#7A1515]/25 underline-offset-2 hover:decoration-[#7A1515]/50"
              >
                Open Featured campaign section in page editor →
              </Link>
            </p>
          ) : null}
        </div>
        <Link
          href="/dashboard/community-campaigns/new"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
        >
          New campaign
        </Link>
      </div>

      {campaignSettingsErr ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {campaignSettingsErr}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Accept donations</th>
              <th className="px-4 py-3">Volunteer signup</th>
              <th className="hidden px-4 py-3 sm:table-cell">Updated</th>
              <th className="min-w-[11rem] px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-stone-500">
                  No campaigns yet. Create one to get started.
                </td>
              </tr>
            ) : (
              campaigns.map((c) => {
                const published = c.status === "published";
                const isFeatured = featuredId === c.id;
                return (
                  <tr key={c.id} className="hover:bg-stone-50/80">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900">{c.title}</div>
                      <div className="mt-0.5 font-mono text-[11px] text-stone-500">/campaigns/{c.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={published ? "success" : "warning"}>{c.status}</Badge>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={c.donations_enabled}
                          aria-busy={donationsBusyId === c.id}
                          aria-label={
                            c.donations_enabled ? `Turn off donations for ${c.title}` : `Turn on donations for ${c.title}`
                          }
                          disabled={donationsBusyId === c.id || volunteerBusyId === c.id}
                          onClick={() => toggleDonations(c.id, !c.donations_enabled)}
                          className={`relative inline-flex h-8 w-[3.35rem] shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1515]/35 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-55 ${
                            c.donations_enabled ? "bg-emerald-600" : "bg-stone-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none absolute top-1 left-1 size-6 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-[transform] duration-200 ease-out ${
                              c.donations_enabled ? "translate-x-[1.35rem]" : "translate-x-0"
                            }`}
                            aria-hidden
                          />
                        </button>
                        {!published ? (
                          <span className="text-[10px] leading-snug text-stone-400">
                            Listed when published
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={c.volunteering_enabled}
                          aria-busy={volunteerBusyId === c.id}
                          aria-label={
                            c.volunteering_enabled
                              ? `Turn off volunteer signup for ${c.title}`
                              : `Turn on volunteer signup for ${c.title}`
                          }
                          disabled={donationsBusyId === c.id || volunteerBusyId === c.id}
                          onClick={() => toggleVolunteering(c.id, !c.volunteering_enabled)}
                          className={`relative inline-flex h-8 w-[3.35rem] shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1515]/35 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-55 ${
                            c.volunteering_enabled ? "bg-sky-600" : "bg-stone-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none absolute top-1 left-1 size-6 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-[transform] duration-200 ease-out ${
                              c.volunteering_enabled ? "translate-x-[1.35rem]" : "translate-x-0"
                            }`}
                            aria-hidden
                          />
                        </button>
                        {!published ? (
                          <span className="text-[10px] leading-snug text-stone-400">
                            Listed when published
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-stone-500 sm:table-cell">
                      {new Date(c.updated_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right align-middle">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <div className="inline-flex items-center rounded-xl border border-stone-200 bg-gradient-to-b from-white to-stone-50 p-1 shadow-sm">
                          <Link
                            href={`/dashboard/community-campaigns/${c.id}`}
                            title="Edit campaign"
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-white hover:text-[#7A1515]"
                          >
                            <Pencil className="size-3.5 shrink-0 opacity-70" aria-hidden />
                            Edit
                          </Link>
                          {published ? (
                            <>
                              <span className="h-6 w-px shrink-0 bg-stone-200" aria-hidden />
                              <Link
                                href={`/campaigns/${c.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open public campaign URL"
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-white hover:text-[#7A1515]"
                              >
                                <ExternalLink className="size-3.5 shrink-0 opacity-70" aria-hidden />
                                Site
                              </Link>
                            </>
                          ) : null}
                        </div>

                        <div className="inline-flex items-center rounded-xl border border-stone-200 bg-gradient-to-b from-white to-stone-50 p-1 shadow-sm">
                          {published ? (
                            <button
                              type="button"
                              title={
                                isFeatured ? "Remove from homepage Featured campaign slot" : "Show on homepage Featured campaign"
                              }
                              disabled={pending}
                              onClick={() => submitFeatured(isFeatured ? null : c.id)}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                                isFeatured
                                  ? "bg-amber-100 text-amber-950 hover:bg-amber-200"
                                  : "text-stone-700 hover:bg-white hover:text-[#7A1515]"
                              }`}
                            >
                              <Star
                                className={`size-3.5 shrink-0 ${isFeatured ? "fill-amber-500 text-amber-600" : "opacity-70"}`}
                                aria-hidden
                              />
                              <span className="hidden sm:inline">{isFeatured ? "On home" : "Homepage"}</span>
                              <span className="sm:hidden">{isFeatured ? "Home" : "Feat."}</span>
                            </button>
                          ) : (
                            <span
                              className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-stone-400"
                              title="Publish this campaign to feature it on the home page"
                            >
                              Feature · publish first
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {featuredId ? (
        <Button type="button" variant="secondary" disabled={pending} onClick={() => submitFeatured(null)}>
          Clear home featured campaign
        </Button>
      ) : null}
    </div>
  );
}

function CategoriesTab({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  const edit = categories.find((c) => c.id === editingId);

  return (
    <div className="space-y-6">
      <p className="text-sm text-stone-600">
        Categories appear on campaign story cards and filters. Slug must be lowercase with hyphens.
      </p>

      {msg ? <p className="text-sm text-red-600">{msg}</p> : null}

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Sort</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-stone-900">{c.name}</td>
                <td className="px-4 py-3 text-xs text-stone-500">{c.slug}</td>
                <td className="px-4 py-3 text-xs">{c.sort_order}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="mr-3 text-xs font-bold uppercase tracking-wider text-[#7A1515] hover:underline"
                    onClick={() => {
                      setEditingId(c.id);
                      setMsg(null);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    className="text-xs font-bold uppercase tracking-wider text-red-600 hover:underline disabled:opacity-50"
                    onClick={() => {
                      startTransition(async () => {
                        setMsg(null);
                        const res = await deleteCommunityCampaignCategory(c.id);
                        if (res.error) setMsg(res.error);
                        else router.refresh();
                      });
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-500">
          {editingId ? "Edit category" : "Add category"}
        </h3>
        <form
          key={`category-form-${editingId ?? "new"}`}
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              setMsg(null);
              const res = await upsertCommunityCampaignCategory(fd);
              if (res.error) setMsg(res.error);
              else {
                setEditingId(null);
                (e.target as HTMLFormElement).reset();
                router.refresh();
              }
            });
          }}
        >
          {edit ? <input type="hidden" name="id" value={edit.id} /> : null}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400">Name</label>
            <Input name="name" required placeholder="Medical support" defaultValue={edit?.name ?? ""} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400">Slug</label>
            <Input name="slug" placeholder="medical-support" defaultValue={edit?.slug ?? ""} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400">Sort order</label>
            <Input name="sort_order" type="number" defaultValue={edit?.sort_order ?? categories.length * 10} />
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" variant="primary" disabled={busy}>
              {editingId ? "Save category" : "Add category"}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>
                Cancel edit
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
