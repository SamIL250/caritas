"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { DonationPaymentMethod } from "@/lib/donation-payment-methods";

export async function recordManualDonation(data: {
  amount: number;
  donorName: string;
  donorEmail?: string;
  donorMessage?: string;
  communityCampaignId?: string;
  legacyCampaignId?: string;
  donorType?: "individual" | "organization";
  organizationName?: string;
  organizationContactName?: string;
  donorPhone?: string;
  donorAddress?: string;
}) {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase.from("donations").insert({
      amount: data.amount,
      currency: "RWF",
      donor_name: data.donorName,
      donor_email: data.donorEmail || null,
      donor_message: data.donorMessage?.trim() || null,
      donor_type: data.donorType ?? "individual",
      organization_name: data.organizationName?.trim() || null,
      organization_contact_name: data.organizationContactName?.trim() || null,
      donor_phone: data.donorPhone?.trim() || null,
      donor_address: data.donorAddress?.trim() || null,
      community_campaign_id: data.communityCampaignId || null,
      campaign_id: data.communityCampaignId ? null : data.legacyCampaignId || null,
      status: "succeeded",
      payment_method: "manual",
      stripe_payment_intent_id: `manual_${Date.now()}`,
    });

    if (error) throw error;

    revalidatePath("/donations");
    revalidatePath("/dashboard/donations");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error recording manual donation:", err);
    return { error: message };
  }
}

/** Public flow: donor chose bank / MoMo; staff reconciles later. */
export async function recordPendingOfflineDonation(data: {
  amount: number;
  donorName: string;
  donorEmail: string;
  donorMessage?: string;
  communityCampaignId?: string;
  legacyCampaignId?: string;
  campaignName: string;
  paymentMethod: Exclude<DonationPaymentMethod, "stripe">;
  donorType?: "individual" | "organization";
  organizationName?: string;
  organizationContactName?: string;
  donorPhone?: string;
  donorAddress?: string;
}) {
  const supabase = createAdminClient();
  const ref = `offline_${data.paymentMethod}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  try {
    const { error } = await supabase.from("donations").insert({
      amount: data.amount,
      currency: "RWF",
      donor_name: data.donorName.trim(),
      donor_email: data.donorEmail.trim(),
      donor_message: data.donorMessage?.trim() || null,
      donor_type: data.donorType ?? "individual",
      organization_name: data.organizationName?.trim() || null,
      organization_contact_name: data.organizationContactName?.trim() || null,
      donor_phone: data.donorPhone?.trim() || null,
      donor_address: data.donorAddress?.trim() || null,
      community_campaign_id: data.communityCampaignId || null,
      campaign_id: data.communityCampaignId ? null : data.legacyCampaignId || null,
      status: "pending",
      payment_method: data.paymentMethod,
      stripe_payment_intent_id: ref,
      stripe_metadata: {
        channel: data.paymentMethod,
        campaignName: data.campaignName,
        donorType: data.donorType ?? "individual",
        organizationName: data.organizationName ?? null,
        organizationContactName: data.organizationContactName ?? null,
        donorPhone: data.donorPhone ?? null,
        donorAddress: data.donorAddress ?? null,
        submittedAt: new Date().toISOString(),
      } as Record<string, unknown>,
    });

    if (error) throw error;

    revalidatePath("/donations");
    revalidatePath("/dashboard/donations");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error recording pending offline donation:", err);
    return { error: message };
  }
}
