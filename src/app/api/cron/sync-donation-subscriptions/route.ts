import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { upsertDonationSubscriptionFromStripe } from "@/lib/donation-subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Nightly sync of non-canceled Stripe subscriptions into donation_subscriptions.
 * Secure with CRON_SECRET (Authorization: Bearer …) when called from Vercel Cron.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("donation_subscriptions")
    .select("stripe_subscription_id")
    .not("status", "eq", "canceled")
    .order("updated_at", { ascending: true })
    .limit(80);

  let synced = 0;
  const errors: string[] = [];

  for (const row of rows || []) {
    try {
      const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
      await upsertDonationSubscriptionFromStripe(sub);
      synced += 1;
    } catch (err) {
      errors.push(
        `${row.stripe_subscription_id}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return NextResponse.json({ ok: true, synced, errors: errors.slice(0, 10) });
}
