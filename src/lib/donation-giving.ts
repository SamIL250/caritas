export type DonationGivingSettings = {
  id: string | null;
  online_payments_enabled: boolean;
  title: string;
  message: string;
  contact_email: string;
  contact_phone: string;
  mtn_code: string;
};

export const DONATION_GIVING_DEFAULTS: DonationGivingSettings = {
  id: null,
  online_payments_enabled: false,
  title: "How to give",
  message:
    "Online payments are not open yet. Please contact us, or send your donation with MTN Mobile Money using the details below. Mention which cause your gift is for.",
  contact_email: "info@caritasrwanda.org",
  contact_phone: "(+250) 252 574 344",
  mtn_code: "",
};

function textOr(raw: unknown, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/** Keep the dial string as entered. Donors see this exact value. */
export function normalizeMtnCode(raw: string): string {
  return raw.trim();
}

export function parseDonationGivingSettings(row: unknown): DonationGivingSettings {
  if (!row || typeof row !== "object") return { ...DONATION_GIVING_DEFAULTS };
  const src = row as Record<string, unknown>;
  return {
    id: typeof src.id === "string" ? src.id : null,
    online_payments_enabled: src.online_payments_enabled === true,
    title: textOr(src.title, DONATION_GIVING_DEFAULTS.title),
    message: textOr(src.message, DONATION_GIVING_DEFAULTS.message),
    contact_email: typeof src.contact_email === "string" ? src.contact_email.trim() : "",
    contact_phone: typeof src.contact_phone === "string" ? src.contact_phone.trim() : "",
    mtn_code: typeof src.mtn_code === "string" ? normalizeMtnCode(src.mtn_code) : "",
  };
}
