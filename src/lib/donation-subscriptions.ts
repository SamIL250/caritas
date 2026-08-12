import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export type DonationSubscriptionStatus =
  | "incomplete"
  | "active"
  | "paused"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete_expired";

function mapStripeStatus(status: Stripe.Subscription.Status): DonationSubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "paused":
      return "paused";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
      return "unpaid";
    case "incomplete":
      return "incomplete";
    case "incomplete_expired":
      return "incomplete_expired";
    case "trialing":
      return "active";
    default:
      return "active";
  }
}

function periodEnd(sub: Stripe.Subscription): string | null {
  const end = (sub as Stripe.Subscription & { current_period_end?: number }).current_period_end;
  if (typeof end === "number" && end > 0) {
    return new Date(end * 1000).toISOString();
  }
  return null;
}

function parseMeta(meta: Stripe.Metadata | null | undefined, key: string): string | null {
  const v = meta?.[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function customerId(sub: Stripe.Subscription): string | null {
  if (typeof sub.customer === "string") return sub.customer;
  if (sub.customer && typeof sub.customer === "object" && "id" in sub.customer) {
    return (sub.customer as Stripe.Customer).id;
  }
  return null;
}

export async function upsertDonationSubscriptionFromStripe(
  sub: Stripe.Subscription,
  extras?: {
    checkoutSessionId?: string | null;
    donorEmail?: string | null;
    amountOverride?: number | null;
  },
) {
  const supabase = createAdminClient();
  const meta = sub.metadata ?? {};
  const item = sub.items.data[0];
  const price = item?.price;
  const amount =
    extras?.amountOverride ??
    (typeof price?.unit_amount === "number" ? price.unit_amount : null) ??
    0;
  const interval = price?.recurring?.interval ?? "month";
  const intervalCount = price?.recurring?.interval_count ?? 1;
  const status = mapStripeStatus(sub.status);
  const communityCampaignId = parseMeta(meta, "communityCampaignId");

  const row = {
    stripe_subscription_id: sub.id,
    stripe_customer_id: customerId(sub),
    stripe_checkout_session_id: extras?.checkoutSessionId ?? null,
    community_campaign_id: communityCampaignId,
    campaign_name: parseMeta(meta, "campaignName"),
    donor_email: extras?.donorEmail ?? parseMeta(meta, "donorEmail") ?? null,
    donor_name: parseMeta(meta, "donorName"),
    donor_type: parseMeta(meta, "donorType") === "organization" ? "organization" : "individual",
    organization_name: parseMeta(meta, "organizationName"),
    organization_contact_name: parseMeta(meta, "organizationContactName"),
    donor_phone: parseMeta(meta, "donorPhone"),
    donor_address: parseMeta(meta, "donorAddress"),
    donor_message: parseMeta(meta, "donorMessage"),
    amount: Math.max(0, amount),
    currency: (price?.currency ?? "rwf").toUpperCase(),
    interval,
    interval_count: intervalCount,
    status,
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    current_period_end: periodEnd(sub),
    canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
    paused_at: status === "paused" ? new Date().toISOString() : null,
    stripe_metadata: sub as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("donation_subscriptions")
    .upsert(row, { onConflict: "stripe_subscription_id" })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("upsertDonationSubscriptionFromStripe:", error);
    throw error;
  }

  return data?.id as string | undefined;
}

export async function linkDonationToSubscription(
  donationId: string,
  subscriptionRowId: string,
) {
  const supabase = createAdminClient();
  await supabase
    .from("donations")
    .update({ donation_subscription_id: subscriptionRowId })
    .eq("id", donationId);

  await supabase
    .from("donation_subscriptions")
    .update({ last_donation_id: donationId, updated_at: new Date().toISOString() })
    .eq("id", subscriptionRowId);
}
