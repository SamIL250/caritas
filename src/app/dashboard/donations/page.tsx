"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Heart,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  Loader2,
  DollarSign,
  ImagePlus,
  BarChart2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createDonationSession } from "@/app/actions/stripe";
import { recordManualDonation } from "@/app/actions/donations";
import {
  PAYMENT_METHOD_LABELS,
  type DonationPaymentMethod,
} from "@/lib/donation-payment-methods";

type GalleryItem = { url: string; alt?: string; sort_order?: number };

function normalizeGallery(raw: unknown): GalleryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x: unknown) => Boolean(x) && typeof (x as GalleryItem).url === "string")
    .map((x: unknown, i: number) => {
      const g = x as GalleryItem;
      return {
        url: g.url,
        alt: g.alt,
        sort_order: typeof g.sort_order === "number" ? g.sort_order : i,
      };
    });
}

function presetsList(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [1000, 5000, 10000, 50000];
  const nums = raw.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n >= 100);
  return nums.length ? nums : [1000, 5000, 10000, 50000];
}

function donationPaymentLabel(raw: string | null | undefined): string {
  if (raw === "manual") return "Manual (staff)";
  if (!raw || raw === "stripe") return PAYMENT_METHOD_LABELS.stripe;
  if (raw in PAYMENT_METHOD_LABELS) return PAYMENT_METHOD_LABELS[raw as DonationPaymentMethod];
  return raw;
}

function donorTypeLabel(raw: string | null | undefined): string {
  if (raw === "organization") return "Organisation";
  return "Individual";
}

function succeededDonationsForCommunityCampaign(donations: any[], campaignId: string) {
  return donations.filter((d) => d.status === "succeeded" && d.community_campaign_id === campaignId);
}

function raisedForCommunityCampaign(donations: any[], campaignId: string): number {
  return succeededDonationsForCommunityCampaign(donations, campaignId).reduce((acc, d) => {
    const n = typeof d.amount === "number" ? d.amount : Number(d.amount);
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
}

/** Rows tied to old donation_campaigns only (no community_campaign_id). */
function isLegacyDonationRow(d: { community_campaign_id?: string | null; campaign_id?: string | null }) {
  return Boolean(d.campaign_id) && !d.community_campaign_id;
}

export default function DonationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [legacyNames, setLegacyNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<"campaigns" | "history">("campaigns");

  const [showManualModal, setShowManualModal] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [payingCampaign, setPayingCampaign] = useState<any>(null);

  const [manualAmount, setManualAmount] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualMessage, setManualMessage] = useState("");
  const [manualCampaign, setManualCampaign] = useState("");

  const [payAmount, setPayAmount] = useState("5000");
  const [errorMessage, setErrorMessage] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [showLegacyDonationRows, setShowLegacyDonationRows] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [campRes, donationsRes, legacyRes] = await Promise.all([
        supabase
          .from("community_campaigns")
          .select("*")
          .eq("donations_enabled", true)
          .order("updated_at", { ascending: false }),
        supabase.from("donations").select("*").order("created_at", { ascending: false }),
        supabase.from("donation_campaigns").select("id,name"),
      ]);

      setCampaigns(campRes.data || []);
      setDonations(donationsRes.data || []);
      const lm: Record<string, string> = {};
      for (const r of legacyRes.data || []) {
        lm[(r as { id: string }).id] = String((r as { name: string }).name || "");
      }
      setLegacyNames(lm);
    } catch (err) {
      console.error("Error loading donations data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleManualDonation() {
    if (!manualAmount || !manualName) {
      setConfirmConfig({
        title: "Missing fields",
        description: "Amount and donor name are required.",
        onConfirm: () => setConfirmOpen(false),
      });
      setConfirmOpen(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await recordManualDonation({
        amount: parseInt(manualAmount, 10),
        donorName: manualName,
        donorEmail: manualEmail,
        donorMessage: manualMessage,
        communityCampaignId: manualCampaign || undefined,
      });

      if (result.error) throw new Error(result.error);

      setShowManualModal(false);
      setManualAmount("");
      setManualName("");
      setManualEmail("");
      setManualMessage("");
      setManualCampaign("");
      void loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setConfirmConfig({
        title: "Error",
        description: msg,
        onConfirm: () => setConfirmOpen(false),
      });
      setConfirmOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleStripePayment(campaign: any) {
    setPayingCampaign(campaign);
    setShowAmountModal(true);
    setErrorMessage("");
  }

  async function processStripePayment() {
    if (!payingCampaign || !payAmount || Number.isNaN(parseInt(payAmount, 10))) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    if (parseInt(payAmount, 10) < 1000) {
      setErrorMessage("Minimum donation amount is 1,000 RWF to comply with Stripe requirements.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const result = await createDonationSession({
        amount: parseInt(payAmount, 10),
        communityCampaignId: payingCampaign.id,
        campaignName: payingCampaign.title,
        successUrl: `${window.location.origin}/donations/success`,
        cancelUrl: `${window.location.origin}/donations?status=cancel`,
        donorName: "Dashboard checkout",
        donorMessage: "Recorded from Donations dashboard (Pay Online).",
        recurrence: { mode: "payment" },
      });

      if (result.error) throw new Error(result.error);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setIsSubmitting(false);
    }
  }

  function donationCampaignLabel(row: any): string {
    if (row.community_campaign_id) {
      const c = campaigns.find((x) => x.id === row.community_campaign_id);
      return c?.title || "Campaign";
    }
    if (row.campaign_id && legacyNames[row.campaign_id]) {
      return `${legacyNames[row.campaign_id]} (legacy)`;
    }
    return "General donation";
  }

  const succeededDonations = donations.filter((d) => d.status === "succeeded");
  const communitySucceeded = succeededDonations.filter((d) => d.community_campaign_id);
  const nonCommunitySucceeded = succeededDonations.filter((d) => !d.community_campaign_id);

  const totalRaisedCommunity = communitySucceeded.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRaisedOther = nonCommunitySucceeded.reduce((acc, curr) => acc + curr.amount, 0);
  const communitySucceededCount = communitySucceeded.length;
  const activeCampaignsCount = campaigns.filter((c) => c.status === "published").length;

  const legacyRowCount = donations.filter(isLegacyDonationRow).length;
  const visibleHistoryRows = showLegacyDonationRows
    ? donations
    : donations.filter((d) => !isLegacyDonationRow(d));

  return (
    <>
      <div className="w-full">
        <Topbar
          title="Donations & Campaigns"
          actions={
            <div className="flex gap-2">
              <Button variant="secondary" className="h-9" onClick={() => setShowManualModal(true)}>
                Record Donation
              </Button>
            <Link
              href="/dashboard/community-campaigns/new"
              className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:ring-offset-1"
            >
              New campaign
            </Link>
            </div>
          }
        />

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Total Raised</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-stone-800">{totalRaisedCommunity.toLocaleString()} RWF</h3>
                <p className="mt-1 text-xs font-medium text-stone-400">
                  From {communitySucceededCount} succeeded gifts linked to community campaigns
                </p>
                {totalRaisedOther > 0 ? (
                  <p className="mt-2 text-[11px] leading-snug text-amber-800">
                    Other succeeded gifts (general or not linked to a community campaign):{" "}
                    {totalRaisedOther.toLocaleString()} RWF ({nonCommunitySucceeded.length} records). These do not roll
                    into fundraiser cards.
                  </p>
                ) : null}
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Published fundraisers
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Heart size={16} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-stone-800">{activeCampaignsCount}</h3>
                <p className="mt-1 text-xs font-medium text-stone-400">
                  Campaigns with donations enabled (published)
                </p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Average Donation
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <DollarSign size={16} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-stone-800">
                  {communitySucceededCount > 0
                    ? Math.round(totalRaisedCommunity / communitySucceededCount).toLocaleString()
                    : 0}{" "}
                  RWF
                </h3>
                <p className="mt-1 text-xs font-medium text-stone-400">Mean gift to community campaigns (succeeded)</p>
              </div>
            </Card>
          </div>

          <div className="flex border-b border-stone-200">
            <button
              type="button"
              className={`border-b-2 px-6 py-3 text-sm font-bold transition-all ${activeTab === "campaigns" ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-stone-400 hover:text-stone-600"}`}
              onClick={() => setActiveTab("campaigns")}
            >
              Fundraising campaigns
            </button>
            <button
              type="button"
              className={`border-b-2 px-6 py-3 text-sm font-bold transition-all ${activeTab === "history" ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-stone-400 hover:text-stone-600"}`}
              onClick={() => setActiveTab("history")}
            >
              Donation history
            </button>
            <Link
              href="/dashboard/donations/general"
              className="inline-flex items-center border-b-2 border-transparent px-6 py-3 text-sm font-bold text-stone-400 transition-all hover:text-stone-600"
            >
              General donations
            </Link>
          </div>

          <p className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
            Campaigns are managed under{" "}
            <Link href="/dashboard/community-campaigns" className="font-semibold text-[var(--color-primary)] underline">
              Campaigns
            </Link>
            . Enable &quot;Accept donations&quot; on a published campaign to show it here and in the public donation modal.
            Open{" "}
            <Link href="/dashboard/donations/general" className="font-semibold text-[var(--color-primary)] underline">
              General donations
            </Link>{" "}
            for gifts not tied to a fundraiser.
          </p>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin text-stone-300" size={32} />
            </div>
          ) : activeTab === "campaigns" ? (
            <div className="grid gap-6 md:grid-cols-2">
              {campaigns.map((campaign) => {
                const g = normalizeGallery(campaign.gallery_images);
                const thumb =
                  g[0]?.url ||
                  (typeof campaign.featured_image_url === "string" ? campaign.featured_image_url : "");
                const presets = presetsList(campaign.preset_amounts);
                const raised = raisedForCommunityCampaign(donations, campaign.id);
                const donors = succeededDonationsForCommunityCampaign(donations, campaign.id).length;
                const goal = typeof campaign.goal_amount === "number" ? campaign.goal_amount : null;
                const pct = goal && goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

                return (
                  <Card
                    key={campaign.id}
                    className="group relative overflow-hidden transition-all hover:border-[var(--color-primary)]/20"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImagePlus className="text-stone-300" size={28} aria-hidden />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-stone-800">{campaign.title}</h3>
                            <Badge variant={campaign.status === "published" ? "success" : "default"}>
                              {campaign.status === "published" ? "Published" : campaign.status}
                            </Badge>
                          </div>
                          <p className="line-clamp-2 max-w-xl text-xs text-stone-500">
                            {(campaign.excerpt || "").trim() || "No short excerpt yet."}
                          </p>
                        </div>
                        <Link
                          href={`/dashboard/community-campaigns/${campaign.id}`}
                          className="shrink-0 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] hover:bg-stone-50"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-stone-400">PRESET AMOUNTS</span>
                        <span className="text-stone-800">{presets.join(", ")} RWF</span>
                      </div>

                      {goal ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold uppercase text-stone-400">Progress to goal</span>
                            <span className="font-bold text-stone-800">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                            <div
                              className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-1000"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between border-t border-stone-50 pt-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center text-xs text-stone-400">
                            <Users size={12} className="mr-1.5" />
                            {donors} succeeded gifts
                          </div>
                          <div className="flex items-center text-xs text-stone-400">
                            <Calendar size={12} className="mr-1.5" />
                            {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : "—"}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/dashboard/donations/campaign/${campaign.id}`}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-stone-900 px-3 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-stone-800"
                          >
                            <BarChart2 size={12} className="mr-1.5" aria-hidden />
                            Stats
                          </Link>
                          <Button
                            variant="secondary"
                            className="h-8 text-[10px] font-bold uppercase tracking-widest"
                            type="button"
                            onClick={() => handleStripePayment(campaign)}
                            disabled={isSubmitting || campaign.status !== "published"}
                          >
                            Pay online <DollarSign size={12} className="ml-1.5" />
                          </Button>
                          <a
                            href={`/campaigns/${campaign.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 items-center justify-center rounded-md px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-primary)] transition-colors hover:bg-stone-100"
                          >
                            Public link <ExternalLink size={12} className="ml-1.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {campaigns.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white py-20 md:col-span-2">
                  <Heart className="mb-4 text-stone-200" size={48} />
                  <p className="font-medium text-stone-400">No campaigns have fundraising enabled yet.</p>
                  <Link
                    href="/dashboard/community-campaigns"
                    className="mt-4 inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border-default)] bg-white px-4 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-stone-50"
                  >
                    Open Campaigns
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Card className="overflow-hidden border-stone-200/60 p-0 shadow-sm">
              {legacyRowCount > 0 ? (
                <label className="flex cursor-pointer items-center gap-2 border-b border-stone-100 bg-stone-50 px-6 py-3 text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={showLegacyDonationRows}
                    onChange={(e) => setShowLegacyDonationRows(e.target.checked)}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  Show legacy rows linked only to old donation campaigns ({legacyRowCount} in database)
                </label>
              ) : null}
              <p className="border-b border-stone-100 bg-white px-6 py-2 text-[11px] text-stone-500">
                Click a row to open statistics for that fundraiser, or general donations if no campaign is linked.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stone-200 bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                    <tr>
                      <th className="px-6 py-4">Donor</th>
                      <th className="px-6 py-4">Campaign</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Message</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {visibleHistoryRows.map((donation) => (
                      <tr
                        key={donation.id}
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer transition-colors hover:bg-stone-50/80"
                        onClick={() => {
                          if (donation.community_campaign_id) {
                            router.push(`/dashboard/donations/campaign/${donation.community_campaign_id}`);
                          } else {
                            router.push("/dashboard/donations/general");
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (donation.community_campaign_id) {
                              router.push(`/dashboard/donations/campaign/${donation.community_campaign_id}`);
                            } else {
                              router.push("/dashboard/donations/general");
                            }
                          }
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-stone-800">{donation.donor_name || "Anonymous"}</span>
                            <span className="text-[10px] font-semibold text-stone-500">
                              {donorTypeLabel(donation.donor_type)}
                              {donation.organization_name ? ` · ${donation.organization_name}` : ""}
                            </span>
                            {donation.organization_contact_name ? (
                              <span className="text-[10px] text-stone-400">
                                Contact: {donation.organization_contact_name}
                              </span>
                            ) : null}
                            <span className="text-[10px] text-stone-400">{donation.donor_email || "No email"}</span>
                            {donation.donor_phone ? (
                              <span className="text-[10px] text-stone-400">{donation.donor_phone}</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-stone-600">{donationCampaignLabel(donation)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-stone-600">
                            {donationPaymentLabel(donation.payment_method)}
                          </span>
                        </td>
                        <td className="max-w-[200px] px-6 py-4">
                          <span className="line-clamp-2 text-xs text-stone-500">
                            {donation.donor_message?.trim() || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-stone-800">
                            {donation.amount.toLocaleString()} {donation.currency}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold">{donation.status}</td>
                        <td className="px-6 py-4 text-xs text-stone-400">
                          {new Date(donation.created_at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <code className="rounded bg-stone-50 px-2 py-1 text-[10px] text-stone-400">
                            {donation.stripe_payment_intent_id?.substring(0, 12)}...
                          </code>
                        </td>
                      </tr>
                    ))}
                    {visibleHistoryRows.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-20 text-center font-medium text-stone-400">
                          {donations.length === 0
                            ? "No donation records found."
                            : "No rows match this view. Enable “Show legacy rows…” above if those records should appear."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={showManualModal} onClose={() => !isSubmitting && setShowManualModal(false)} title="Record manual donation">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Donor name</label>
              <Input
                placeholder="John Doe"
                value={manualName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Donor email (optional)</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={manualEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Message (optional)</label>
              <textarea
                className="w-full min-h-[72px] rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                placeholder="Note visible in donation history"
                value={manualMessage}
                onChange={(e) => setManualMessage(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Amount (RWF)</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={manualAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualAmount(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Campaign</label>
                <select
                  className="h-10 w-full rounded-md border border-stone-200 bg-white px-3 py-1 text-sm focus:ring-1 focus:ring-[var(--color-primary)]"
                  value={manualCampaign}
                  onChange={(e) => setManualCampaign(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">General donation</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-stone-100 pt-6">
            <Button
              variant="ghost"
              type="button"
              className="text-xs font-bold text-[var(--color-primary)]"
              onClick={() => {
                setShowManualModal(false);
                const sel = campaigns.find((c) => c.id === manualCampaign);
                if (sel) handleStripePayment(sel);
              }}
            >
              Pay via Stripe instead
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" type="button" onClick={() => setShowManualModal(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="primary" type="button" onClick={() => void handleManualDonation()} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Save record"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAmountModal}
        onClose={() => !isSubmitting && setShowAmountModal(false)}
        title={payingCampaign ? `Donate to ${payingCampaign.title}` : "Donate"}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-stone-500">Enter the amount for this test checkout (Stripe).</p>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Amount (RWF)</label>
              <Input
                type="number"
                placeholder="5000"
                value={payAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayAmount(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {payingCampaign?.preset_amounts ? (
              <div className="flex flex-wrap gap-2">
                {presetsList(payingCampaign.preset_amounts).map((p: number) => (
                  <button
                    key={p}
                    type="button"
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${payAmount === p.toString() ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300"}`}
                    onClick={() => setPayAmount(p.toString())}
                  >
                    {p.toLocaleString()}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {errorMessage ? (
            <div className="animate-in fade-in zoom-in-95 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-600">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 border-t border-stone-100 pt-6">
            <Button variant="secondary" type="button" onClick={() => setShowAmountModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="button" onClick={() => void processStripePayment()} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Proceed to checkout"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmLabel="OK"
        onConfirm={() => {
          confirmConfig.onConfirm();
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
