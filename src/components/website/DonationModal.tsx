"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { createDonationSession } from "@/app/actions/stripe";
import { recordPendingOfflineDonation } from "@/app/actions/donations";
import {
  Loader2,
  Heart,
  CreditCard,
  ChevronRight,
  Check,
  ChevronLeft,
  Calendar,
  ImageIcon,
  Landmark,
  Smartphone,
  Wifi,
} from "lucide-react";
import {
  frequencyChoicesForCampaign,
  selectionToCheckoutRecurrence,
  isFundraisingEnded,
  type DonationFrequencySelection,
} from "@/lib/donation-frequency";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_HINTS,
  recurringRequiresStripe,
  getBankTransferInstructions,
  getMtnInstructions,
  getAirtelInstructions,
  type DonationPaymentMethod,
} from "@/lib/donation-payment-methods";
import { mapCommunityCampaignToModalRow } from "@/lib/community-campaign-donation-map";

type FlowStep = "pick" | "detail" | "pay";
type DonorType = "individual" | "organization";

const PAY_METHOD_ORDER: DonationPaymentMethod[] = [
  "stripe",
  "bank_transfer",
  "mtn_momo",
  "airtel_money",
];

const PAY_METHOD_ICONS: Record<DonationPaymentMethod, typeof CreditCard> = {
  stripe: CreditCard,
  bank_transfer: Landmark,
  mtn_momo: Smartphone,
  airtel_money: Wifi,
};

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCampaignId?: string | null;
  initialError?: string | null;
}

type GalleryItem = { url: string; alt?: string; sort_order?: number };

function parseGallery(raw: unknown): GalleryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is GalleryItem => Boolean(x) && typeof (x as GalleryItem).url === "string")
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function stripTags(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function campaignExcerpt(c: Record<string, unknown>): string {
  const html = typeof c.description_html === "string" ? c.description_html : "";
  const plain = typeof c.description === "string" ? c.description : "";
  const s = stripTags(html);
  if (s) return s.length > 140 ? `${s.slice(0, 137)}…` : s;
  return plain.length > 140 ? `${plain.slice(0, 137)}…` : plain;
}

const GENERAL_CAUSE = {
  id: null,
  name: "General Donation",
  description: "Support our overall mission across Rwanda.",
  description_html: null as string | null,
  gallery_images: [] as GalleryItem[],
  fundraising_end_at: null as string | null,
  frequency_one_time: true,
  frequency_weekly: false,
  frequency_monthly: false,
  frequency_every_n_months: null as number | null,
  frequency_every_n_years: null as number | null,
  recurring_commitment_months: null as number | null,
};

export default function DonationModal({
  isOpen,
  onClose,
  initialCampaignId,
  initialError,
}: DonationModalProps) {
  const [phase, setPhase] = useState<FlowStep>("pick");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [campaigns, setCampaigns] = useState<Record<string, unknown>[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Record<string, unknown> | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [amount, setAmount] = useState<string>("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorType, setDonorType] = useState<DonorType>("individual");
  const [organizationName, setOrganizationName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [frequencyId, setFrequencyId] = useState<string>("one_time");
  const [paymentMethod, setPaymentMethod] = useState<DonationPaymentMethod>("stripe");
  const [error, setError] = useState<string | null>(null);

  const flowSteps = useMemo((): FlowStep[] => {
    const showDetail = Boolean(selectedCampaign && selectedCampaign.id);
    return showDetail ? ["pick", "detail", "pay"] : ["pick", "pay"];
  }, [selectedCampaign]);

  const stepDisplayIndex = useMemo(() => {
    const idx = flowSteps.indexOf(phase);
    return idx >= 0 ? idx + 1 : 1;
  }, [flowSteps, phase]);

  const stepDisplayTotal = flowSteps.length;

  const gallery = useMemo(
    () => parseGallery(selectedCampaign?.gallery_images),
    [selectedCampaign]
  );

  const freqChoices = useMemo(() => {
    if (!selectedCampaign?.id) {
      return frequencyChoicesForCampaign(null);
    }
    return frequencyChoicesForCampaign(selectedCampaign as never);
  }, [selectedCampaign]);

  const selectedFrequency: DonationFrequencySelection = useMemo(() => {
    const f =
      freqChoices.find((c) => c.id === frequencyId) ??
      freqChoices[0] ?? {
        id: "one_time",
        label: "One-time",
        selection: { kind: "one_time" as const },
      };
    return f.selection;
  }, [freqChoices, frequencyId]);

  const allowOfflinePayment = useMemo(
    () => !recurringRequiresStripe(selectedFrequency),
    [selectedFrequency]
  );

  function isPaymentTileActive(id: DonationPaymentMethod): boolean {
    if (recurringRequiresStripe(selectedFrequency)) return id === "stripe";
    return paymentMethod === id;
  }

  const bankInfo = useMemo(() => getBankTransferInstructions(), []);
  const mtnText = useMemo(() => getMtnInstructions(), []);
  const airtelText = useMemo(() => getAirtelInstructions(), []);

  /* eslint-disable react-hooks/set-state-in-effect -- sync reset when sheet opens; fetches campaigns */
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "unset";
      const t = setTimeout(() => {
        setPhase("pick");
        setAmount("");
        setDonorName("");
        setDonorEmail("");
        setDonorType("individual");
        setOrganizationName("");
        setContactPerson("");
        setPhone("");
        setAddress("");
        setDonorMessage("");
        setFrequencyId("one_time");
        setPaymentMethod("stripe");
        setGalleryIndex(0);
        setError(null);
        setSelectedCampaign(null);
      }, 280);
      return () => clearTimeout(t);
    }

    document.body.style.overflow = "hidden";
    setPhase("pick");
    setAmount("");
    setDonorName("");
    setDonorEmail("");
    setDonorType("individual");
    setOrganizationName("");
    setContactPerson("");
    setPhone("");
    setAddress("");
    setDonorMessage("");
    setFrequencyId("one_time");
    setPaymentMethod("stripe");
    setGalleryIndex(0);

    void (async () => {
      const supabase = createClient();
      setLoading(true);
      try {
        const { data, error: qErr } = await supabase
          .from("community_campaigns")
          .select("*")
          .eq("donations_enabled", true)
          .eq("status", "published")
          .order("published_at", { ascending: false });

        if (qErr) throw qErr;

        const list = ((data || []) as Record<string, unknown>[]).map(mapCommunityCampaignToModalRow);
        setCampaigns(list);

        if (initialCampaignId) {
          const found = list.find((c) => String(c.id) === String(initialCampaignId));
          if (found) {
            setSelectedCampaign(found);
            setPhase("detail");
          } else {
            setSelectedCampaign({ ...GENERAL_CAUSE });
            setPhase("pick");
          }
        } else {
          setSelectedCampaign({ ...GENERAL_CAUSE });
          setPhase("pick");
        }
      } catch (err) {
        console.error("Error loading campaigns:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, initialCampaignId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function goNextFromPick() {
    setError(null);
    if (selectedCampaign?.id) {
      if (isFundraisingEnded(selectedCampaign.fundraising_end_at as string | null)) {
        setError("This campaign is no longer accepting donations.");
        return;
      }
      setGalleryIndex(0);
      setPhase("detail");
    } else {
      setFrequencyId(frequencyChoicesForCampaign(null)[0]?.id ?? "one_time");
      setPhase("pay");
    }
  }

  function goNextFromDetail() {
    setError(null);
    if (isFundraisingEnded(selectedCampaign?.fundraising_end_at as string | null)) {
      setError("This campaign is no longer accepting donations.");
      return;
    }
    setFrequencyId(frequencyChoicesForCampaign(selectedCampaign as never)[0]?.id ?? "one_time");
    setPhase("pay");
  }

  function goBack() {
    setError(null);
    if (phase === "pay") {
      if (selectedCampaign?.id) setPhase("detail");
      else setPhase("pick");
      return;
    }
    if (phase === "detail") {
      setPhase("pick");
    }
  }

  async function handlePayment() {
    if (donorType === "organization") {
      if (!organizationName.trim()) {
        setError("Please enter your organization name.");
        return;
      }
      if (!contactPerson.trim()) {
        setError("Please enter a contact person.");
        return;
      }
    } else if (!donorName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!donorEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!amount || Number.isNaN(parseInt(amount, 10)) || parseInt(amount, 10) < 1000) {
      setError("Minimum donation is 1,000 RWF.");
      return;
    }

    const recurrence = selectionToCheckoutRecurrence(
      selectedFrequency,
      (selectedCampaign?.recurring_commitment_months as number | null | undefined) ?? null
    );

    const pm: DonationPaymentMethod = recurringRequiresStripe(selectedFrequency)
      ? "stripe"
      : paymentMethod;

    const amt = parseInt(amount, 10);
    const campaignName = String(selectedCampaign?.name || "General Donation");
    const campaignId = (selectedCampaign?.id as string | undefined) || undefined;
    const donorTypeValue: "individual" | "organization" = donorType;
    const normalizedOrganizationName =
      donorTypeValue === "organization" ? organizationName.trim() : undefined;
    const normalizedOrganizationContact =
      donorTypeValue === "organization" ? contactPerson.trim() : undefined;
    const normalizedPhone = phone.trim() || undefined;
    const normalizedAddress = address.trim() || undefined;

    setSubmitting(true);
    setError(null);
    try {
      if (pm !== "stripe") {
        const result = await recordPendingOfflineDonation({
          amount: amt,
          donorName:
            donorTypeValue === "organization"
              ? `${organizationName.trim()} (${contactPerson.trim()})`
              : donorName.trim(),
          donorEmail: donorEmail.trim(),
          donorMessage: donorMessage.trim(),
          communityCampaignId: campaignId,
          campaignName,
          paymentMethod: pm,
          donorType: donorTypeValue,
          organizationName: normalizedOrganizationName,
          organizationContactName: normalizedOrganizationContact,
          donorPhone: normalizedPhone,
          donorAddress: normalizedAddress,
        });
        if (result.error) throw new Error(result.error);
        window.location.href = `${window.location.origin}/donations/success?pending=1&method=${encodeURIComponent(pm)}`;
        return;
      }

      const checkoutDonorName =
        donorType === "organization"
          ? `${organizationName.trim()} (${contactPerson.trim() || "Organization contact"})`
          : donorName.trim();

      const result = await createDonationSession({
        amount: amt,
        communityCampaignId: campaignId,
        campaignName,
        successUrl: `${window.location.origin}/donations/success`,
        cancelUrl: `${window.location.href.split("?")[0]}?donation_cancelled=true`,
        donorEmail: donorEmail.trim(),
        donorName: checkoutDonorName,
        donorMessage: donorMessage.trim(),
        donorType: donorTypeValue,
        organizationName: normalizedOrganizationName,
        organizationContactName: normalizedOrganizationContact,
        donorPhone: normalizedPhone,
        donorAddress: normalizedAddress,
        recurrence,
      });

      if (result.error) throw new Error(result.error);
      if (!result.url) throw new Error("Unable to start secure checkout. Please try again.");
      window.location.href = result.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  const ended = selectedCampaign?.id
    ? isFundraisingEnded(selectedCampaign.fundraising_end_at as string | null)
    : false;

  const htmlDescription =
    typeof selectedCampaign?.description_html === "string" &&
    selectedCampaign.description_html.trim()
      ? selectedCampaign.description_html
      : null;
  const plainFallback =
    typeof selectedCampaign?.description === "string" ? selectedCampaign.description : "";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="donation-modal-overlay donation-modal-scope"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="donation-modal-container">
            <div className="donation-modal-topbar">
              <button
                type="button"
                className="donation-modal-top-back"
                onClick={onClose}
                disabled={submitting}
                aria-label="Close donation form"
              >
                <ChevronLeft size={18} />
                Back
              </button>
            </div>

            <div className="donation-modal-content">
              <div className="donation-modal-form-area">
                <div className="form-steps-indicator donation-form-steps-wide">
                  {Array.from({ length: stepDisplayTotal }, (_, i) => (
                    <div key={i} className="donation-step-track">
                      <div className={`step-dot ${stepDisplayIndex >= i + 1 ? "active" : ""}`}>
                        {i + 1}
                      </div>
                      {i < stepDisplayTotal - 1 ? <div className="step-line" /> : null}
                    </div>
                  ))}
                </div>

                {phase === "pick" && (
                  <motion.div
                    className="form-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key="pick"
                  >
                    <h2 className="step-title">
                      Choose a <span>Cause</span>
                    </h2>
                    <p className="step-description">Select where you would like your contribution to go.</p>

                    {loading ? (
                      <div className="loading-state">
                        <Loader2 className="animate-spin" size={32} />
                      </div>
                    ) : (
                      <div className="campaign-selection">
                        <button
                          type="button"
                          className={`campaign-card ${!selectedCampaign?.id ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedCampaign({ ...GENERAL_CAUSE });
                            setError(null);
                          }}
                        >
                          <div className="card-check">
                            <Check size={14} />
                          </div>
                          <div className="card-icon">
                            <Heart size={20} />
                          </div>
                          <div className="card-text">
                            <h4>General Donation</h4>
                            <p>{GENERAL_CAUSE.description}</p>
                          </div>
                        </button>

                        {campaigns.map((campaign) => {
                          const id = campaign.id as string;
                          const cEnded = isFundraisingEnded(campaign.fundraising_end_at as string | null);
                          return (
                            <button
                              key={id}
                              type="button"
                              disabled={cEnded}
                              className={`campaign-card ${selectedCampaign?.id === id ? "selected" : ""} ${
                                cEnded ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              onClick={() => {
                                if (cEnded) return;
                                setSelectedCampaign(campaign);
                                setError(null);
                              }}
                            >
                              <div className="card-check">
                                <Check size={14} />
                              </div>
                              <div className="card-icon">
                                <CreditCard size={20} />
                              </div>
                              <div className="card-text">
                                <h4>{String(campaign.name)}</h4>
                                <p className="line-clamp-2">{campaignExcerpt(campaign)}</p>
                                {cEnded ? (
                                  <span className="text-[10px] font-bold text-amber-700">
                                    Fundraising ended
                                  </span>
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="step-actions">
                      <button type="button" className="btn-donation-next" onClick={goNextFromPick}>
                        {selectedCampaign?.id ? "View campaign" : "Continue"}{" "}
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {phase === "detail" && selectedCampaign?.id && (
                  <motion.div
                    className="form-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key="detail"
                  >
                    <button type="button" className="back-link" onClick={goBack}>
                      <ChevronLeft size={16} className="inline mr-1" />
                      Back
                    </button>
                    <h2 className="step-title">
                      <span>{String(selectedCampaign.name)}</span>
                    </h2>
                    <p className="step-description">Read about this campaign before you give.</p>

                    {ended ? (
                      <div className="donation-error-msg">This campaign is no longer accepting donations.</div>
                    ) : null}

                    {gallery.length > 0 ? (
                      <div className="donation-campaign-gallery">
                        <div className="donation-gallery-frame">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={gallery[galleryIndex]?.url}
                            alt={gallery[galleryIndex]?.alt || String(selectedCampaign.name)}
                            className="donation-gallery-img"
                          />
                          {gallery.length > 1 ? (
                            <>
                              <button
                                type="button"
                                className="donation-gallery-nav donation-gallery-prev"
                                aria-label="Previous image"
                                onClick={() =>
                                  setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)
                                }
                              >
                                ‹
                              </button>
                              <button
                                type="button"
                                className="donation-gallery-nav donation-gallery-next"
                                aria-label="Next image"
                                onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)}
                              >
                                ›
                              </button>
                              <div className="donation-gallery-dots">
                                {gallery.map((_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    className={i === galleryIndex ? "is-active" : ""}
                                    aria-label={`Image ${i + 1}`}
                                    onClick={() => setGalleryIndex(i)}
                                  />
                                ))}
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div className="donation-campaign-gallery donation-gallery-empty">
                        <ImageIcon size={28} className="opacity-40" aria-hidden />
                        <span>No photos for this campaign yet.</span>
                      </div>
                    )}

                    {htmlDescription ? (
                      <div
                        className="donation-campaign-prose"
                        dangerouslySetInnerHTML={{ __html: htmlDescription }}
                      />
                    ) : (
                      <div className="donation-campaign-prose">
                        <p>{plainFallback || "No detailed description yet."}</p>
                      </div>
                    )}

                    <ul className="donation-campaign-meta">
                      {selectedCampaign.fundraising_end_at ? (
                        <li>
                          <Calendar size={14} className="inline mr-1 opacity-70" aria-hidden />
                          Accepting donations through{" "}
                          <strong>
                            {new Date(
                              selectedCampaign.fundraising_end_at as string
                            ).toLocaleDateString(undefined, {
                              dateStyle: "medium",
                            })}
                          </strong>
                        </li>
                      ) : null}
                      {selectedCampaign.recurring_commitment_months ? (
                        <li>
                          Recurring gifts automatically end after{" "}
                          <strong>{String(selectedCampaign.recurring_commitment_months)}</strong> months
                          (per campaign rules).
                        </li>
                      ) : null}
                    </ul>

                    <div className="step-actions">
                      <button
                        type="button"
                        className="btn-donation-next"
                        onClick={goNextFromDetail}
                        disabled={ended}
                      >
                        Continue to your details <ChevronRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {phase === "pay" && (
                  <motion.div
                    className="form-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key="pay"
                  >
                    <button type="button" className="back-link" onClick={goBack}>
                      <ChevronLeft size={16} className="inline mr-1" />
                      Back
                    </button>
                    <h2 className="step-title">
                      Your <span>Gift</span>
                    </h2>
                    <p className="step-description">
                      Supporting: <strong>{String(selectedCampaign?.name || "General Donation")}</strong>
                    </p>

                    <div className="donor-type-tabs" role="tablist" aria-label="Donor type">
                      <button
                        type="button"
                        className={`donor-type-tab ${donorType === "individual" ? "is-active" : ""}`}
                        onClick={() => {
                          setDonorType("individual");
                          setError(null);
                        }}
                        role="tab"
                        aria-selected={donorType === "individual"}
                      >
                        Individual
                      </button>
                      <button
                        type="button"
                        className={`donor-type-tab ${donorType === "organization" ? "is-active" : ""}`}
                        onClick={() => {
                          setDonorType("organization");
                          setError(null);
                        }}
                        role="tab"
                        aria-selected={donorType === "organization"}
                      >
                        Organisation
                      </button>
                    </div>

                    <div className="donation-donor-fields">
                      {donorType === "organization" ? (
                        <>
                          <label className="donation-field-label">
                            Organization name <span className="text-red-600">*</span>
                            <input
                              className="donation-field-input"
                              value={organizationName}
                              onChange={(e) => setOrganizationName(e.target.value)}
                              placeholder="Organization name"
                              autoComplete="organization"
                              disabled={submitting}
                            />
                          </label>
                          <label className="donation-field-label">
                            Contact person <span className="text-red-600">*</span>
                            <input
                              className="donation-field-input"
                              value={contactPerson}
                              onChange={(e) => setContactPerson(e.target.value)}
                              placeholder="Contact person"
                              autoComplete="name"
                              disabled={submitting}
                            />
                          </label>
                        </>
                      ) : (
                        <label className="donation-field-label">
                          Full name <span className="text-red-600">*</span>
                          <input
                            className="donation-field-input"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            placeholder="Your name"
                            autoComplete="name"
                            disabled={submitting}
                          />
                        </label>
                      )}

                      <label className="donation-field-label">
                        Email <span className="text-red-600">*</span>
                        <input
                          type="email"
                          className="donation-field-input"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          placeholder="you@example.com"
                          autoComplete="email"
                          disabled={submitting}
                        />
                      </label>
                      <label className="donation-field-label">
                        Phone number
                        <input
                          className="donation-field-input"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+250..."
                          autoComplete="tel"
                          disabled={submitting}
                        />
                      </label>
                      <label className="donation-field-label">
                        Address
                        <input
                          className="donation-field-input"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Type your address"
                          autoComplete="street-address"
                          disabled={submitting}
                        />
                      </label>
                      <label className="donation-field-label">
                        Message <span className="text-stone-400 font-normal">(optional)</span>
                        <textarea
                          className="donation-field-textarea"
                          value={donorMessage}
                          onChange={(e) => setDonorMessage(e.target.value)}
                          placeholder="A note for our team (optional)"
                          rows={3}
                          maxLength={2000}
                          disabled={submitting}
                        />
                      </label>
                    </div>

                    {freqChoices.length > 1 ? (
                      <div className="donation-frequency-block">
                        <span className="donation-frequency-heading">Frequency</span>
                        <div className="donation-frequency-chips">
                          {freqChoices.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              className={`donation-frequency-chip ${frequencyId === c.id ? "is-active" : ""}`}
                              onClick={() => setFrequencyId(c.id)}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="amount-selection">
                      <div className="presets-grid">
                        {(Array.isArray(selectedCampaign?.preset_amounts)
                          ? (selectedCampaign.preset_amounts as number[])
                          : [5000, 10000, 25000, 50000]
                        ).map((p: number) => (
                          <button
                            key={p}
                            type="button"
                            className={`preset-btn ${amount === p.toString() ? "selected" : ""}`}
                            onClick={() => {
                              setAmount(p.toString());
                              setError(null);
                            }}
                          >
                            {p.toLocaleString()} <span className="currency">RWF</span>
                          </button>
                        ))}
                      </div>

                      <div className="custom-amount-input">
                        <span className="input-prefix">RWF</span>
                        <input
                          type="number"
                          placeholder="Other amount"
                          value={amount}
                          onChange={(e) => {
                            setAmount(e.target.value);
                            setError(null);
                          }}
                          min={1000}
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="donation-payment-method-block">
                      <div className="donation-payment-method-block__header">
                        <span className="donation-frequency-heading donation-payment-method-block__title">
                          Payment method
                        </span>
                        {!allowOfflinePayment ? (
                          <p className="donation-recurring-stripe-note">
                            Recurring gifts are processed securely with a card (Stripe).
                          </p>
                        ) : null}
                      </div>
                      <div
                        className={`donation-pay-methods${!allowOfflinePayment ? " donation-pay-methods--stripe-only" : ""}`}
                      >
                        {(allowOfflinePayment ? PAY_METHOD_ORDER : (["stripe"] as const)).map((id) => {
                          const Icon = PAY_METHOD_ICONS[id];
                          const active = isPaymentTileActive(id);
                          const methodClass = `donation-pay-method-tile--${id.replace(/_/g, "-")}`;
                          return (
                            <button
                              key={id}
                              type="button"
                              className={`donation-pay-method-tile ${methodClass} ${active ? "is-active" : ""}`}
                              onClick={() => {
                                if (recurringRequiresStripe(selectedFrequency)) return;
                                setPaymentMethod(id);
                                setError(null);
                              }}
                              disabled={submitting}
                              aria-pressed={active}
                            >
                              <span className="donation-pay-method-tile__check" aria-hidden>
                                {active ? <Check strokeWidth={3} size={11} /> : null}
                              </span>
                              <span className={`donation-pay-method-tile__icon-ring donation-pay-method-tile__icon-ring--${id.replace(/_/g, "-")}`}>
                                <Icon className="donation-pay-method-tile__icon" size={22} strokeWidth={2} aria-hidden />
                              </span>
                              <span className="donation-pay-method-tile__text">
                                <span className="donation-pay-method-tile__label">{PAYMENT_METHOD_LABELS[id]}</span>
                                <span className="donation-pay-method-tile__hint">{PAYMENT_METHOD_HINTS[id]}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {allowOfflinePayment && paymentMethod === "bank_transfer" ? (
                        <div className="donation-offline-instructions">
                          <p>
                            <strong>{bankInfo.bankName}</strong>
                          </p>
                          <p>
                            Account name: <strong>{bankInfo.accountName}</strong>
                            <br />
                            Account number: <strong>{bankInfo.accountNumber}</strong>
                          </p>
                          {bankInfo.branch ? (
                            <p>
                              Branch: <strong>{bankInfo.branch}</strong>
                            </p>
                          ) : null}
                          {bankInfo.swift ? (
                            <p>
                              SWIFT: <strong>{bankInfo.swift}</strong>
                            </p>
                          ) : null}
                          <p className="donation-offline-refhint">{bankInfo.referenceHint}</p>
                        </div>
                      ) : null}

                      {allowOfflinePayment && paymentMethod === "mtn_momo" ? (
                        <div className="donation-offline-instructions">
                          <p>{mtnText}</p>
                        </div>
                      ) : null}

                      {allowOfflinePayment && paymentMethod === "airtel_money" ? (
                        <div className="donation-offline-instructions">
                          <p>{airtelText}</p>
                        </div>
                      ) : null}
                    </div>

                    {error ? <div className="donation-error-msg">{error}</div> : null}

                    <div className="step-actions">
                      <button
                        type="button"
                        className="btn-donation-pay"
                        onClick={() => void handlePayment()}
                        disabled={submitting || !amount || ended}
                      >
                        {submitting ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : paymentMethod === "stripe" || !allowOfflinePayment ? (
                          <>
                            Continue to secure checkout <CreditCard size={18} className="ml-2" />
                          </>
                        ) : (
                          <>
                            Submit pledge and continue <ChevronRight size={18} className="ml-2" />
                          </>
                        )}
                      </button>
                    </div>

                    {paymentMethod === "stripe" || !allowOfflinePayment ? (
                      <p className="secure-note">
                        <i className="fa-solid fa-lock" aria-hidden /> Secured by Stripe. Card details are entered on
                        the next step.
                      </p>
                    ) : (
                      <p className="secure-note donation-offline-footnote">
                        Your pledge is saved as pending until we confirm your transfer or mobile money payment.
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
