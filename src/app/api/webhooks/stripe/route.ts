import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildDonationInsertFromCheckoutSession } from "@/lib/checkout-session-donation";
import {
  linkDonationToSubscription,
  upsertDonationSubscriptionFromStripe,
} from "@/lib/donation-subscriptions";

function revalidateDonationPaths() {
  revalidatePath("/dashboard/donations");
  revalidatePath("/dashboard/donations/subscriptions");
  revalidatePath("/donations");
  revalidatePath("/");
}

async function recordCheckoutDonation(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();
  const row = buildDonationInsertFromCheckoutSession(session);

  const { data: existing } = await supabase
    .from("donations")
    .select("id")
    .eq("stripe_payment_intent_id", row.stripe_payment_intent_id)
    .maybeSingle();

  let donationId = existing?.id as string | undefined;

  if (!donationId) {
    const { data: inserted, error } = await supabase
      .from("donations")
      .insert(row)
      .select("id")
      .maybeSingle();

    if (error) {
      const dup =
        error.code === "23505" ||
        (typeof error.message === "string" &&
          /duplicate key|unique constraint/i.test(error.message));
      if (!dup) {
        console.error("❌ Error recording donation:", error);
        return null;
      }
    } else {
      donationId = inserted?.id as string | undefined;
      console.log("✅ Donation recorded successfully");
    }
  } else {
    console.log("ℹ️ Donation already recorded (idempotent skip)");
  }

  if (session.mode === "subscription" && session.subscription) {
    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    try {
      const sub = await stripe.subscriptions.retrieve(subId);
      const subscriptionRowId = await upsertDonationSubscriptionFromStripe(sub, {
        checkoutSessionId: session.id,
        donorEmail:
          session.customer_details?.email ?? session.customer_email ?? null,
        amountOverride: session.amount_total ?? null,
      });
      if (donationId && subscriptionRowId) {
        await linkDonationToSubscription(donationId, subscriptionRowId);
      }
    } catch (err) {
      console.error("Failed to upsert subscription from checkout:", err);
    }
  }

  return donationId ?? null;
}

function paymentIntentIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const payments = invoice.payments?.data ?? [];
  for (const p of payments) {
    const pi = p.payment?.payment_intent;
    if (typeof pi === "string" && pi) return pi;
    if (pi && typeof pi === "object" && "id" in pi && typeof pi.id === "string") {
      return pi.id;
    }
  }

  // Legacy Invoice.payment_intent (pre–2025-03-31 API) may still appear on webhook payloads
  const legacy = (invoice as Stripe.Invoice & {
    payment_intent?: string | Stripe.PaymentIntent | null;
  }).payment_intent;
  if (typeof legacy === "string" && legacy) return legacy;
  if (legacy && typeof legacy === "object" && "id" in legacy) return legacy.id;

  return null;
}

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const fromParent = invoice.parent?.subscription_details?.subscription;
  if (typeof fromParent === "string" && fromParent) return fromParent;
  if (fromParent && typeof fromParent === "object" && "id" in fromParent) {
    return fromParent.id;
  }

  // Legacy Invoice.subscription (pre–2025-03-31 API)
  const legacy = (invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  }).subscription;
  if (typeof legacy === "string" && legacy) return legacy;
  if (legacy && typeof legacy === "object" && "id" in legacy) return legacy.id;

  return null;
}

async function resolveInvoicePaymentIntentId(
  invoice: Stripe.Invoice,
): Promise<string | null> {
  const fromPayload = paymentIntentIdFromInvoice(invoice);
  if (fromPayload) return fromPayload;

  try {
    const listed = await stripe.invoicePayments.list({
      invoice: invoice.id,
      limit: 10,
    });
    for (const p of listed.data) {
      const pi = p.payment?.payment_intent;
      if (typeof pi === "string" && pi) return pi;
      if (pi && typeof pi === "object" && "id" in pi && typeof pi.id === "string") {
        return pi.id;
      }
    }
  } catch (err) {
    console.error("Failed to list invoice payments:", err);
  }

  return null;
}

async function recordInvoiceDonation(invoice: Stripe.Invoice) {
  if (invoice.billing_reason === "subscription_create") {
    // First invoice usually overlaps checkout.session.completed — skip duplicate
    return;
  }

  const paymentIntent = await resolveInvoicePaymentIntentId(invoice);
  const ref = paymentIntent || `invoice_${invoice.id}`;
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("donations")
    .select("id")
    .eq("stripe_payment_intent_id", ref)
    .maybeSingle();
  if (existing) return;

  const subId = subscriptionIdFromInvoice(invoice);

  let subscriptionRowId: string | undefined;
  let meta: Stripe.Metadata = {};
  if (subId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subId);
      meta = sub.metadata ?? {};
      subscriptionRowId = await upsertDonationSubscriptionFromStripe(sub, {
        donorEmail: invoice.customer_email ?? null,
        amountOverride: invoice.amount_paid ?? null,
      });
    } catch (err) {
      console.error("invoice subscription upsert failed:", err);
    }
  }

  const communityCampaignId =
    typeof meta.communityCampaignId === "string" ? meta.communityCampaignId : null;

  const { data: inserted, error } = await supabase
    .from("donations")
    .insert({
      stripe_payment_intent_id: ref,
      amount: invoice.amount_paid ?? 0,
      currency: (invoice.currency ?? "rwf").toUpperCase(),
      donor_email: invoice.customer_email ?? null,
      donor_name: typeof meta.donorName === "string" ? meta.donorName : null,
      donor_message: typeof meta.donorMessage === "string" ? meta.donorMessage : null,
      donor_type: meta.donorType === "organization" ? "organization" : "individual",
      organization_name:
        typeof meta.organizationName === "string" ? meta.organizationName : null,
      organization_contact_name:
        typeof meta.organizationContactName === "string"
          ? meta.organizationContactName
          : null,
      donor_phone: typeof meta.donorPhone === "string" ? meta.donorPhone : null,
      donor_address: typeof meta.donorAddress === "string" ? meta.donorAddress : null,
      status: "succeeded",
      community_campaign_id: communityCampaignId,
      campaign_id: null,
      payment_method: "stripe",
      stripe_metadata: invoice as unknown as Record<string, unknown>,
      donation_subscription_id: subscriptionRowId ?? null,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    const dup =
      error.code === "23505" ||
      (typeof error.message === "string" &&
        /duplicate key|unique constraint/i.test(error.message));
    if (!dup) console.error("invoice donation insert failed:", error);
    return;
  }

  if (inserted?.id && subscriptionRowId) {
    await linkDonationToSubscription(inserted.id, subscriptionRowId);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook Error: missing STRIPE_WEBHOOK_SECRET" },
        { status: 500 },
      );
    }
    if (!signature) {
      return NextResponse.json(
        { error: "Webhook Error: missing stripe-signature header" },
        { status: 400 },
      );
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("🔔 Stripe Webhook: checkout.session.completed", session.id);
        await recordCheckoutDonation(session);
        revalidateDonationPaths();
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("🔔 Stripe Webhook: invoice.paid", invoice.id);
        await recordInvoiceDonation(invoice);
        revalidateDonationPaths();
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        console.log(`🔔 Stripe Webhook: ${event.type}`, sub.id);
        await upsertDonationSubscriptionFromStripe(sub);
        revalidateDonationPaths();
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
