export type DonationFrequencySelection =
  | { kind: "one_time" }
  | { kind: "week" }
  | { kind: "month" }
  | { kind: "every_n_months"; n: number }
  | { kind: "every_n_years"; n: number };

export type CheckoutRecurrence =
  | { mode: "payment" }
  | {
      mode: "subscription";
      interval: "week" | "month" | "year";
      intervalCount: number;
      commitmentMonths: number | null;
      labelForStripe: string;
    };

export type DonationCampaignFrequencyRow = {
  frequency_one_time?: boolean | null;
  frequency_weekly?: boolean | null;
  frequency_monthly?: boolean | null;
  frequency_every_n_months?: number | null;
  frequency_every_n_years?: number | null;
  recurring_commitment_months?: number | null;
};

export type FrequencyChoiceMeta = {
  id: string;
  label: string;
  selection: DonationFrequencySelection;
};

/** Build selectable frequencies from campaign row (general donation uses one_time only). */
export function frequencyChoicesForCampaign(
  row: DonationCampaignFrequencyRow | null
): FrequencyChoiceMeta[] {
  const out: FrequencyChoiceMeta[] = [];
  if (!row) {
    return [{ id: "one_time", label: "One-time", selection: { kind: "one_time" } }];
  }
  if (row.frequency_one_time !== false) {
    out.push({ id: "one_time", label: "One-time", selection: { kind: "one_time" } });
  }
  if (row.frequency_weekly) {
    out.push({ id: "week", label: "Weekly", selection: { kind: "week" } });
  }
  if (row.frequency_monthly) {
    out.push({ id: "month", label: "Monthly", selection: { kind: "month" } });
  }
  const nm = row.frequency_every_n_months;
  if (nm != null && nm >= 1) {
    out.push({
      id: `n_mo_${nm}`,
      label: nm === 1 ? "Every month" : `Every ${nm} months`,
      selection: { kind: "every_n_months", n: nm },
    });
  }
  const ny = row.frequency_every_n_years;
  if (ny != null && ny >= 1) {
    out.push({
      id: `n_yr_${ny}`,
      label: ny === 1 ? "Every year" : `Every ${ny} years`,
      selection: { kind: "every_n_years", n: ny },
    });
  }
  if (out.length === 0) {
    return [{ id: "one_time", label: "One-time", selection: { kind: "one_time" } }];
  }
  return out;
}

export function selectionToCheckoutRecurrence(
  sel: DonationFrequencySelection,
  commitmentMonths: number | null | undefined
): CheckoutRecurrence {
  if (sel.kind === "one_time") {
    return { mode: "payment" };
  }
  if (sel.kind === "week") {
    return {
      mode: "subscription",
      interval: "week",
      intervalCount: 1,
      commitmentMonths: commitmentMonths ?? null,
      labelForStripe: "Weekly",
    };
  }
  if (sel.kind === "month") {
    return {
      mode: "subscription",
      interval: "month",
      intervalCount: 1,
      commitmentMonths: commitmentMonths ?? null,
      labelForStripe: "Monthly",
    };
  }
  if (sel.kind === "every_n_months") {
    const n = Math.max(1, sel.n);
    return {
      mode: "subscription",
      interval: "month",
      intervalCount: n,
      commitmentMonths: commitmentMonths ?? null,
      labelForStripe: n === 1 ? "Monthly" : `Every ${n} months`,
    };
  }
  const n = Math.max(1, sel.n);
  return {
    mode: "subscription",
    interval: "year",
    intervalCount: n,
    commitmentMonths: commitmentMonths ?? null,
    labelForStripe: n === 1 ? "Yearly" : `Every ${n} years`,
  };
}

export function isFundraisingEnded(fundraisingEndAt: string | null | undefined): boolean {
  if (!fundraisingEndAt) return false;
  const t = new Date(fundraisingEndAt).getTime();
  if (Number.isNaN(t)) return false;
  return t < Date.now();
}
