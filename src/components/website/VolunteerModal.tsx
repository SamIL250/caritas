"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { createVolunteerApplication } from "@/app/actions/volunteer-applications";
import {
  Loader2,
  Heart,
  ChevronRight,
  Check,
  ChevronLeft,
  Calendar,
  ImageIcon,
  Users,
} from "lucide-react";
import { mapCommunityCampaignToModalRow } from "@/lib/community-campaign-donation-map";

type FlowStep = "pick" | "detail" | "apply" | "done";

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCampaignId?: string | null;
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

const GENERAL_VOLUNTEER = {
  id: null as string | null,
  name: "Any open opportunity",
  description: "We'll match you with programmes that need volunteers.",
  description_html: null as string | null,
  gallery_images: [] as GalleryItem[],
  fundraising_end_at: null as string | null,
};

export default function VolunteerModal({
  isOpen,
  onClose,
  initialCampaignId,
}: VolunteerModalProps) {
  const [phase, setPhase] = useState<FlowStep>("pick");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [campaigns, setCampaigns] = useState<Record<string, unknown>[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Record<string, unknown> | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [motivation, setMotivation] = useState("");
  const [skillsExperience, setSkillsExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [languages, setLanguages] = useState("");

  const [error, setError] = useState<string | null>(null);

  const flowSteps = useMemo((): FlowStep[] => {
    const showDetail = Boolean(selectedCampaign && selectedCampaign.id);
    return showDetail ? ["pick", "detail", "apply", "done"] : ["pick", "apply", "done"];
  }, [selectedCampaign]);

  const stepDisplayIndex = useMemo(() => {
    const idx = flowSteps.indexOf(phase === "done" ? "apply" : phase);
    const base = idx >= 0 ? idx + 1 : 1;
    return phase === "done" ? flowSteps.length : base;
  }, [flowSteps, phase]);

  const stepDisplayTotal = flowSteps.filter((s) => s !== "done").length;

  const gallery = useMemo(
    () => parseGallery(selectedCampaign?.gallery_images),
    [selectedCampaign],
  );

  const htmlDescription =
    typeof selectedCampaign?.description_html === "string" &&
    selectedCampaign.description_html.trim()
      ? selectedCampaign.description_html
      : null;
  const plainFallback =
    typeof selectedCampaign?.description === "string" ? selectedCampaign.description : "";

  /* eslint-disable react-hooks/set-state-in-effect -- sync reset when sheet opens */
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "unset";
      const t = setTimeout(() => {
        setPhase("pick");
        setGalleryIndex(0);
        setError(null);
        setSelectedCampaign(null);
        setFullName("");
        setEmail("");
        setPhone("");
        setCity("");
        setMotivation("");
        setSkillsExperience("");
        setAvailability("");
        setLanguages("");
      }, 280);
      return () => clearTimeout(t);
    }

    document.body.style.overflow = "hidden";
    setPhase("pick");
    setGalleryIndex(0);
    setError(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setCity("");
    setMotivation("");
    setSkillsExperience("");
    setAvailability("");
    setLanguages("");

    void (async () => {
      const supabase = createClient();
      setLoading(true);
      try {
        const { data, error: qErr } = await supabase
          .from("community_campaigns")
          .select("*")
          .eq("volunteering_enabled", true)
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
            setSelectedCampaign({ ...GENERAL_VOLUNTEER });
            setPhase("pick");
          }
        } else {
          setSelectedCampaign({ ...GENERAL_VOLUNTEER });
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
      setGalleryIndex(0);
      setPhase("detail");
    } else {
      setPhase("apply");
    }
  }

  function goNextFromDetail() {
    setError(null);
    setPhase("apply");
  }

  function goBack() {
    setError(null);
    if (phase === "apply") {
      if (selectedCampaign?.id) setPhase("detail");
      else setPhase("pick");
      return;
    }
    if (phase === "detail") {
      setPhase("pick");
    }
  }

  async function handleSubmitApplication() {
    setError(null);
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!motivation.trim()) {
      setError("Please tell us why you want to volunteer.");
      return;
    }
    if (!skillsExperience.trim()) {
      setError("Please describe your skills or experience.");
      return;
    }
    if (!availability.trim()) {
      setError("Please describe when you are available.");
      return;
    }

    const preferredCampaignId = selectedCampaign?.id ? String(selectedCampaign.id) : null;

    setSubmitting(true);
    try {
      const result = await createVolunteerApplication({
        preferredCampaignId,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        motivation: motivation.trim(),
        skillsExperience: skillsExperience.trim(),
        availability: availability.trim(),
        languages: languages.trim(),
      });
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      setPhase("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

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
                aria-label="Close volunteer form"
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
                      Choose a <span>programme</span>
                    </h2>
                    <p className="step-description">
                      Volunteer for a specific campaign or tell us you&apos;re open to any role.
                    </p>

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
                            setSelectedCampaign({ ...GENERAL_VOLUNTEER });
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
                            <h4>{GENERAL_VOLUNTEER.name}</h4>
                            <p>{GENERAL_VOLUNTEER.description}</p>
                          </div>
                        </button>

                        {campaigns.map((campaign) => {
                          const id = campaign.id as string;
                          return (
                            <button
                              key={id}
                              type="button"
                              className={`campaign-card ${selectedCampaign?.id === id ? "selected" : ""}`}
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                setError(null);
                              }}
                            >
                              <div className="card-check">
                                <Check size={14} />
                              </div>
                              <div className="card-icon">
                                <Users size={20} />
                              </div>
                              <div className="card-text">
                                <h4>{String(campaign.name)}</h4>
                                <p className="line-clamp-2">{campaignExcerpt(campaign)}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="step-actions">
                      <button type="button" className="btn-donation-next" onClick={goNextFromPick}>
                        {selectedCampaign?.id ? "View programme" : "Continue"}{" "}
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
                    <p className="step-description">Read about this programme before you apply.</p>

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
                        <span>No photos for this programme yet.</span>
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
                          Programme activity through{" "}
                          <strong>
                            {new Date(
                              selectedCampaign.fundraising_end_at as string,
                            ).toLocaleDateString(undefined, {
                              dateStyle: "medium",
                            })}
                          </strong>
                        </li>
                      ) : null}
                    </ul>

                    <div className="step-actions">
                      <button type="button" className="btn-donation-next" onClick={goNextFromDetail}>
                        Continue to application <ChevronRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {phase === "apply" && (
                  <motion.div
                    className="form-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key="apply"
                  >
                    <button type="button" className="back-link" onClick={goBack}>
                      <ChevronLeft size={16} className="inline mr-1" />
                      Back
                    </button>
                    <h2 className="step-title">
                      Your <span>application</span>
                    </h2>
                    <p className="step-description">
                      Applying for:{" "}
                      <strong>{String(selectedCampaign?.name || GENERAL_VOLUNTEER.name)}</strong>
                    </p>

                    <div className="donation-donor-fields">
                      <label className="donation-field-label">
                        Full name <span className="text-red-600">*</span>
                        <input
                          className="donation-field-input"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          autoComplete="name"
                          disabled={submitting}
                        />
                      </label>
                      <label className="donation-field-label">
                        Email <span className="text-red-600">*</span>
                        <input
                          className="donation-field-input"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          autoComplete="email"
                          disabled={submitting}
                        />
                      </label>
                      <label className="donation-field-label">
                        Phone
                        <input
                          className="donation-field-input"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Mobile or landline"
                          autoComplete="tel"
                          disabled={submitting}
                        />
                      </label>
                      <label className="donation-field-label">
                        City / district
                        <input
                          className="donation-field-input"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Where you are based"
                          autoComplete="address-level2"
                          disabled={submitting}
                        />
                      </label>
                      <label className="donation-field-label">
                        Why do you want to volunteer? <span className="text-red-600">*</span>
                        <textarea
                          className="donation-field-textarea"
                          rows={3}
                          value={motivation}
                          onChange={(e) => setMotivation(e.target.value)}
                          placeholder="Motivation and interests"
                          disabled={submitting}
                        />
                      </label>
                      <label className="donation-field-label">
                        Skills &amp; experience <span className="text-red-600">*</span>
                        <textarea
                          className="donation-field-textarea"
                          rows={3}
                          value={skillsExperience}
                          onChange={(e) => setSkillsExperience(e.target.value)}
                          placeholder="Relevant background, training, or strengths"
                          disabled={submitting}
                        />
                      </label>
                      <label className="donation-field-label">
                        Availability <span className="text-red-600">*</span>
                        <textarea
                          className="donation-field-textarea"
                          rows={2}
                          value={availability}
                          onChange={(e) => setAvailability(e.target.value)}
                          placeholder="Days, times, duration"
                          disabled={submitting}
                        />
                      </label>
                      <label className="donation-field-label">
                        Languages
                        <textarea
                          className="donation-field-textarea"
                          rows={2}
                          value={languages}
                          onChange={(e) => setLanguages(e.target.value)}
                          placeholder="Languages you speak (optional)"
                          disabled={submitting}
                        />
                      </label>
                    </div>

                    {error ? <div className="donation-error-msg">{error}</div> : null}

                    <div className="step-actions">
                      <button
                        type="button"
                        className="btn-donation-pay"
                        onClick={() => void handleSubmitApplication()}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Sending…
                          </>
                        ) : (
                          <>
                            Submit application <ChevronRight size={18} />
                          </>
                        )}
                      </button>
                    </div>

                    <p className="secure-note donation-offline-footnote">
                      Caritas Rwanda will review your application and contact you by email.
                    </p>
                  </motion.div>
                )}

                {phase === "done" && (
                  <motion.div
                    className="form-step text-center"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key="done"
                  >
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check size={36} strokeWidth={2.5} aria-hidden />
                    </div>
                    <h2 className="step-title">
                      Thank <span>you</span>
                    </h2>
                    <p className="step-description mx-auto max-w-md">
                      Your volunteer application has been received. Our team will review it and email you with next
                      steps.
                    </p>
                    <div className="step-actions justify-center">
                      <button type="button" className="btn-donation-next" onClick={onClose}>
                        Close
                      </button>
                    </div>
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
