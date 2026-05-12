/** Map a community_campaigns DB row into the shape DonationModal expects (legacy donation_campaign field names). */

export function normalizePresetAmounts(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [1000, 5000, 10000, 50000];
  const nums = raw.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n >= 100);
  return nums.length ? nums : [1000, 5000, 10000, 50000];
}

export function mapCommunityCampaignToModalRow(c: Record<string, unknown>): Record<string, unknown> {
  const galleryRaw = c.gallery_images;
  const hasGallery = Array.isArray(galleryRaw) && galleryRaw.length > 0;
  const featured =
    typeof c.featured_image_url === "string" && String(c.featured_image_url).trim()
      ? String(c.featured_image_url).trim()
      : "";

  const modalHtml =
    typeof c.donation_modal_description_html === "string" && c.donation_modal_description_html.trim()
      ? c.donation_modal_description_html
      : typeof c.body === "string"
        ? c.body
        : null;

  return {
    id: c.id,
    name: c.title,
    description: typeof c.excerpt === "string" ? c.excerpt : "",
    description_html: modalHtml,
    gallery_images: hasGallery ? galleryRaw : featured ? [{ url: featured, alt: c.image_alt || "" }] : [],
    fundraising_end_at: c.fundraising_end_at ?? null,
    preset_amounts: normalizePresetAmounts(c.preset_amounts),
    goal_amount: c.goal_amount ?? null,
    currency: typeof c.currency === "string" ? c.currency : "RWF",
    frequency_one_time: c.frequency_one_time !== false,
    frequency_weekly: Boolean(c.frequency_weekly),
    frequency_monthly: Boolean(c.frequency_monthly),
    frequency_every_n_months: c.frequency_every_n_months ?? null,
    frequency_every_n_years: c.frequency_every_n_years ?? null,
    recurring_commitment_months: c.recurring_commitment_months ?? null,
  };
}
