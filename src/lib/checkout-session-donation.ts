import type Stripe from "stripe";

export type CheckoutDonationInsert = {
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  donor_email: string | null;
  donor_name: string | null;
  donor_message: string | null;
  donor_type: string;
  organization_name: string | null;
  organization_contact_name: string | null;
  donor_phone: string | null;
  donor_address: string | null;
  status: "succeeded";
  community_campaign_id: string | null;
  campaign_id: string | null;
  payment_method: string;
  stripe_metadata: Record<string, unknown>;
};

function parseMetaString(meta: Record<string, unknown>, key: string): string | null {
  const v = meta[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** Maps a paid Checkout Session to a donations row (shared by webhook + finalize). */
export function buildDonationInsertFromCheckoutSession(session: Stripe.Checkout.Session): CheckoutDonationInsert {
  const meta = (session.metadata ?? {}) as Record<string, unknown>;
  const donorMsg = parseMetaString(meta, "donorMessage");

  const communityCampaignId = parseMetaString(meta, "communityCampaignId");
  const legacyCampaignId = parseMetaString(meta, "campaignId");

  const donorTypeRaw = parseMetaString(meta, "donorType");
  const donorType =
    donorTypeRaw === "organization" || donorTypeRaw === "individual" ? donorTypeRaw : "individual";

  let paymentRef: string;
  if (typeof session.payment_intent === "string") {
    paymentRef = session.payment_intent;
  } else if (
    session.payment_intent &&
    typeof session.payment_intent === "object" &&
    "id" in session.payment_intent &&
    typeof (session.payment_intent as Stripe.PaymentIntent).id === "string"
  ) {
    paymentRef = (session.payment_intent as Stripe.PaymentIntent).id;
  } else {
    paymentRef = session.id;
  }

  return {
    stripe_payment_intent_id: paymentRef,
    amount: session.amount_total ?? 0,
    currency: (session.currency ?? "rwf").toString().toUpperCase(),
    donor_email: session.customer_details?.email ?? session.customer_email ?? null,
    donor_name:
      session.customer_details?.name ??
      (typeof meta.donorName === "string" ? meta.donorName : null),
    donor_message: donorMsg,
    donor_type: donorType,
    organization_name: parseMetaString(meta, "organizationName"),
    organization_contact_name: parseMetaString(meta, "organizationContactName"),
    donor_phone: parseMetaString(meta, "donorPhone"),
    donor_address: parseMetaString(meta, "donorAddress"),
    status: "succeeded",
    community_campaign_id: communityCampaignId,
    campaign_id: communityCampaignId ? null : legacyCampaignId,
    payment_method: "stripe",
    stripe_metadata: session as unknown as Record<string, unknown>,
  };
}
