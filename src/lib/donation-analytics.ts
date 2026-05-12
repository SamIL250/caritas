/** Lightweight donation row shape for dashboard analytics (maps from Supabase). */
export type DonationAnalyticsRow = {
  id: string;
  amount: number;
  currency?: string | null;
  status: string;
  payment_method?: string | null;
  created_at: string;
  donor_name?: string | null;
  donor_email?: string | null;
};

export type DailyAmountPoint = { day: string; amount: number; label: string };

export type NamedAmountRow = { name: string; amount: number; count: number };

function utcDayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function sumAmount(rows: DonationAnalyticsRow[], predicate: (r: DonationAnalyticsRow) => boolean): number {
  return rows.reduce((acc, r) => (predicate(r) ? acc + (Number(r.amount) || 0) : acc), 0);
}

export function countRows(rows: DonationAnalyticsRow[], predicate: (r: DonationAnalyticsRow) => boolean): number {
  return rows.filter(predicate).length;
}

/** Succeeded gifts only — chronological daily totals with gaps filled as zero (UTC dates). */
export function buildSucceededDailySeries(rows: DonationAnalyticsRow[], maxDays = 120): DailyAmountPoint[] {
  const succeeded = rows.filter((r) => r.status === "succeeded");
  if (succeeded.length === 0) return [];

  const byDay = new Map<string, number>();
  for (const r of succeeded) {
    const day = utcDayKey(r.created_at);
    byDay.set(day, (byDay.get(day) || 0) + (Number(r.amount) || 0));
  }

  const keys = [...byDay.keys()].sort();
  let start = keys[0];
  let end = keys[keys.length - 1];
  const today = new Date().toISOString().slice(0, 10);
  if (end < today) end = today;

  const msDay = 86400000;
  const startMs = new Date(`${start}T00:00:00.000Z`).getTime();
  const endMs = new Date(`${end}T00:00:00.000Z`).getTime();
  let spanDays = Math.ceil((endMs - startMs) / msDay) + 1;
  if (spanDays > maxDays) {
    start = new Date(endMs - (maxDays - 1) * msDay).toISOString().slice(0, 10);
  }

  const out: DailyAmountPoint[] = [];
  let cursor = new Date(`${start}T00:00:00.000Z`).getTime();
  const endBound = new Date(`${end}T00:00:00.000Z`).getTime();
  while (cursor <= endBound) {
    const day = new Date(cursor).toISOString().slice(0, 10);
    const amount = byDay.get(day) || 0;
    const [y, m, d] = day.split("-").map(Number);
    const label = new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    out.push({ day, amount, label });
    cursor += msDay;
  }
  return out;
}

export function breakdownByPaymentMethod(rows: DonationAnalyticsRow[]): NamedAmountRow[] {
  const succeeded = rows.filter((r) => r.status === "succeeded");
  const map = new Map<string, { amount: number; count: number }>();
  for (const r of succeeded) {
    const key = (r.payment_method || "unknown").trim() || "unknown";
    const prev = map.get(key) || { amount: 0, count: 0 };
    prev.amount += Number(r.amount) || 0;
    prev.count += 1;
    map.set(key, prev);
  }
  return [...map.entries()]
    .map(([name, v]) => ({ name, amount: v.amount, count: v.count }))
    .sort((a, b) => b.amount - a.amount);
}

export type StatusSlice = { status: string; count: number; amount: number };

export function breakdownByStatus(rows: DonationAnalyticsRow[]): StatusSlice[] {
  const map = new Map<string, { count: number; amount: number }>();
  for (const r of rows) {
    const st = r.status || "unknown";
    const prev = map.get(st) || { count: 0, amount: 0 };
    prev.count += 1;
    prev.amount += Number(r.amount) || 0;
    map.set(st, prev);
  }
  return [...map.entries()]
    .map(([status, v]) => ({ status, ...v }))
    .sort((a, b) => b.amount - a.amount);
}
