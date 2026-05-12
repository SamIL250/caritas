import type { DonationFrequencySelection } from "@/lib/donation-frequency";

export type DonationPaymentMethod =
  | "stripe"
  | "bank_transfer"
  | "mtn_momo"
  | "airtel_money";

export const PAYMENT_METHOD_LABELS: Record<DonationPaymentMethod, string> = {
  stripe: "Card (Stripe)",
  bank_transfer: "Bank transfer",
  mtn_momo: "MTN MoMo",
  airtel_money: "Airtel Money",
};

/** Short sublines under each payment option in the donation modal. */
export const PAYMENT_METHOD_HINTS: Record<DonationPaymentMethod, string> = {
  stripe: "Visa, Mastercard & more",
  bank_transfer: "Deposit or wire to our account",
  mtn_momo: "Mobile Money wallet",
  airtel_money: "Airtel Money wallet",
};

/** Offline methods cannot handle Stripe subscriptions in this app. */
export function recurringRequiresStripe(sel: DonationFrequencySelection): boolean {
  return sel.kind !== "one_time";
}

export type BankTransferInstructions = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
  swift?: string;
  referenceHint: string;
};

export function getBankTransferInstructions(): BankTransferInstructions {
  return {
    bankName: process.env.NEXT_PUBLIC_DONATION_BANK_NAME?.trim() || "— (configure NEXT_PUBLIC_DONATION_BANK_NAME)",
    accountName: process.env.NEXT_PUBLIC_DONATION_BANK_ACCOUNT_NAME?.trim() || "—",
    accountNumber: process.env.NEXT_PUBLIC_DONATION_BANK_ACCOUNT_NUMBER?.trim() || "—",
    branch: process.env.NEXT_PUBLIC_DONATION_BANK_BRANCH?.trim() || undefined,
    swift: process.env.NEXT_PUBLIC_DONATION_BANK_SWIFT?.trim() || undefined,
    referenceHint:
      process.env.NEXT_PUBLIC_DONATION_BANK_REFERENCE_HINT?.trim() ||
      "Use your name + “DONATION” so we can match your transfer.",
  };
}

export function getMtnInstructions(): string {
  return (
    process.env.NEXT_PUBLIC_DONATION_MTN_INSTRUCTIONS?.trim() ||
    "Dial *182*7*1# (MTN Rwanda MoMo merchant payment) or use the MTN app. Enter our merchant code when prompted — contact Caritas Rwanda if you need the code. Include your email in the reference when possible."
  );
}

export function getAirtelInstructions(): string {
  return (
    process.env.NEXT_PUBLIC_DONATION_AIRTEL_INSTRUCTIONS?.trim() ||
    "Use Airtel Money in the app or USSD menu to send to our registered merchant. Contact Caritas Rwanda for the merchant number if you do not see it here."
  );
}
