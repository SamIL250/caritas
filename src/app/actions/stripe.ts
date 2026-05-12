"use server";

import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import type { CheckoutRecurrence } from "@/lib/donation-frequency";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildDonationInsertFromCheckoutSession } from "@/lib/checkout-session-donation";

function checkoutSuccessUrlWithSessionPlaceholder(baseUrl: string): string {
  if (baseUrl.includes("session_id=")) return baseUrl;
  const sep = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${sep}session_id={CHECKOUT_SESSION_ID}`;
}

export async function createDonationSession(data: {
  amount: number;
  /** FK to community_campaigns for new fundraising flow */
  communityCampaignId?: string;
  /** Legacy FK to donation_campaigns (older Stripe sessions only) */
  campaignId?: string;
  campaignName: string;
  successUrl: string;
  cancelUrl: string;
  donorEmail?: string;
  donorName?: string;
  donorMessage?: string;
  donorType?: "individual" | "organization";
  organizationName?: string;
  organizationContactName?: string;
  donorPhone?: string;
  donorAddress?: string;
  recurrence?: CheckoutRecurrence;
}) {
  try {
    const meta: Record<string, string> = {
      campaignName: data.campaignName,
      donorMessage: (data.donorMessage ?? "").slice(0, 2000),
      donorName: (data.donorName ?? "").slice(0, 500),
      donorType: data.donorType ?? "individual",
      organizationName: (data.organizationName ?? "").slice(0, 500),
      organizationContactName: (data.organizationContactName ?? "").slice(0, 500),
      donorPhone: (data.donorPhone ?? "").slice(0, 120),
      donorAddress: (data.donorAddress ?? "").slice(0, 1000),
      paymentMethod: "stripe",
    };
    if (data.communityCampaignId) meta.communityCampaignId = data.communityCampaignId;
    else if (data.campaignId) meta.campaignId = data.campaignId;

    const recurrence = data.recurrence ?? { mode: "payment" };

    if (recurrence.mode === "payment") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "rwf",
              product_data: {
                name: `Donation: ${data.campaignName}`,
                description: `Contribution to ${data.campaignName}`,
              },
              unit_amount: data.amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        customer_email: data.donorEmail?.trim() || undefined,
        success_url: checkoutSuccessUrlWithSessionPlaceholder(data.successUrl),
        cancel_url: data.cancelUrl,
        metadata: meta,
      });

      return { url: session.url };
    }

    let cancelAt: number | undefined;
    if (recurrence.commitmentMonths && recurrence.commitmentMonths >= 1) {
      const end = new Date();
      end.setMonth(end.getMonth() + recurrence.commitmentMonths);
      cancelAt = Math.floor(end.getTime() / 1000);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: data.donorEmail?.trim() || undefined,
      line_items: [
        {
          price_data: {
            currency: "rwf",
            product_data: {
              name: `Recurring donation: ${data.campaignName}`,
              description: recurrence.labelForStripe,
            },
            unit_amount: data.amount,
            recurring: {
              interval: recurrence.interval,
              interval_count: recurrence.intervalCount,
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: meta,
        ...(cancelAt ? { cancel_at: cancelAt } : {}),
      },
      metadata: meta,
      success_url: checkoutSuccessUrlWithSessionPlaceholder(data.successUrl),
      cancel_url: data.cancelUrl,
    });

    return { url: session.url };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Stripe error:", err);
    return { error: message };
  }
}

/**
 * Called from /donations/success when session_id is present.
 * Ensures the gift is recorded even if the Stripe webhook did not reach this environment (common in local dev).
 */
export async function finalizeStripeCheckoutSession(
  sessionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = String(sessionId || "").trim();
  if (!id) return { ok: false, error: "Missing checkout session." };

  try {
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ["payment_intent"],
    });

    const ps = session.payment_status as string;
    const paid = ps === "paid" || ps === "complete";
    if (!paid) {
      return { ok: false, error: "This checkout is not marked as paid yet." };
    }

    const row = buildDonationInsertFromCheckoutSession(session);
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("donations")
      .select("id")
      .eq("stripe_payment_intent_id", row.stripe_payment_intent_id)
      .maybeSingle();

    if (existing) {
      return { ok: true };
    }

    const { error } = await supabase.from("donations").insert(row);
    if (error) {
      const dup =
        error.code === "23505" ||
        (typeof error.message === "string" && /duplicate key|unique constraint/i.test(error.message));
      if (dup) {
        return { ok: true };
      }
      console.error("finalizeStripeCheckoutSession insert:", error);
      return { ok: false, error: error.message };
    }

    revalidatePath("/dashboard/donations");
    revalidatePath("/donations");
    revalidatePath("/");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("finalizeStripeCheckoutSession:", err);
    return { ok: false, error: message };
  }
}
