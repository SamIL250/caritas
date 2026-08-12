"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { upsertDonationSubscriptionFromStripe } from "@/lib/donation-subscriptions";

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

async function loadSubscriptionRow(id: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("donation_subscriptions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) throw new Error(error?.message || "Subscription not found");
  return data as {
    id: string;
    stripe_subscription_id: string;
    status: string;
  };
}

function revalidateDonationPaths() {
  revalidatePath("/dashboard/donations");
  revalidatePath("/dashboard/donations/subscriptions");
  revalidatePath("/donations");
}

export async function pauseDonationSubscription(id: string) {
  try {
    await requireStaff();
    const row = await loadSubscriptionRow(id);
    const sub = await stripe.subscriptions.update(row.stripe_subscription_id, {
      pause_collection: { behavior: "mark_uncollectible" },
    });
    await upsertDonationSubscriptionFromStripe(sub);
    const admin = createAdminClient();
    await admin
      .from("donation_subscriptions")
      .update({
        status: "paused",
        paused_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    revalidateDonationPaths();
    return { ok: true as const };
  } catch (err: unknown) {
    return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function resumeDonationSubscription(id: string) {
  try {
    await requireStaff();
    const row = await loadSubscriptionRow(id);
    const sub = await stripe.subscriptions.update(row.stripe_subscription_id, {
      pause_collection: null,
    });
    await upsertDonationSubscriptionFromStripe(sub);
    const admin = createAdminClient();
    await admin
      .from("donation_subscriptions")
      .update({
        status: "active",
        paused_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    revalidateDonationPaths();
    return { ok: true as const };
  } catch (err: unknown) {
    return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function cancelDonationSubscription(
  id: string,
  opts?: { atPeriodEnd?: boolean },
) {
  try {
    await requireStaff();
    const row = await loadSubscriptionRow(id);
    const atPeriodEnd = opts?.atPeriodEnd !== false;

    let sub: Awaited<ReturnType<typeof stripe.subscriptions.cancel>>;
    if (atPeriodEnd) {
      sub = (await stripe.subscriptions.update(row.stripe_subscription_id, {
        cancel_at_period_end: true,
      })) as never;
    } else {
      sub = await stripe.subscriptions.cancel(row.stripe_subscription_id);
    }

    await upsertDonationSubscriptionFromStripe(sub as never);
    revalidateDonationPaths();
    return { ok: true as const };
  } catch (err: unknown) {
    return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Sync local rows from Stripe (cron / manual refresh). */
export async function syncDonationSubscriptionsFromStripe(limit = 40) {
  try {
    await requireStaff();
    const admin = createAdminClient();
    const { data: rows } = await admin
      .from("donation_subscriptions")
      .select("id, stripe_subscription_id")
      .not("status", "eq", "canceled")
      .order("updated_at", { ascending: true })
      .limit(limit);

    let synced = 0;
    for (const row of rows || []) {
      try {
        const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
        await upsertDonationSubscriptionFromStripe(sub);
        synced += 1;
      } catch (err) {
        console.error("sync subscription failed", row.stripe_subscription_id, err);
      }
    }
    revalidateDonationPaths();
    return { ok: true as const, synced };
  } catch (err: unknown) {
    return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
  }
}
