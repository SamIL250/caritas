import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildDonationInsertFromCheckoutSession } from "@/lib/checkout-session-donation";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  let event;

  try {
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook Error: missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
    }
    if (!signature) {
      return NextResponse.json({ error: "Webhook Error: missing stripe-signature header" }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as import("stripe").Stripe.Checkout.Session;
    console.log("🔔 Stripe Webhook: checkout.session.completed", session.id);

    const row = buildDonationInsertFromCheckoutSession(session);

    const { data: existing } = await supabase
      .from("donations")
      .select("id")
      .eq("stripe_payment_intent_id", row.stripe_payment_intent_id)
      .maybeSingle();

    if (existing) {
      console.log("ℹ️ Donation already recorded (idempotent skip)");
    } else {
      const { error } = await supabase.from("donations").insert(row);

      if (error) {
        const dup =
          error.code === "23505" ||
          (typeof error.message === "string" && /duplicate key|unique constraint/i.test(error.message));
        if (dup) {
          console.log("ℹ️ Donation already recorded (unique constraint)");
        } else {
          console.error("❌ Error recording donation:", error);
        }
      } else {
        console.log("✅ Donation recorded successfully");
      }
    }

    revalidatePath("/dashboard/donations");
    revalidatePath("/donations");
    revalidatePath("/");
  }

  return NextResponse.json({ received: true });
}
