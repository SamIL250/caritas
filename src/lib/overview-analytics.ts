import type { SupabaseClient } from "@supabase/supabase-js";

const DAY = 24 * 60 * 60 * 1000;

function dayKeys(periodDays: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/**
 * Succeeded donation amount per calendar day (UTC date string).
 */
export async function getDonationsByDay(
  supabase: SupabaseClient,
  periodDays: number
): Promise<{ day: string; amount: number; label: string }[]> {
  const keys = dayKeys(periodDays);
  const from = new Date(`${keys[0]}T00:00:00.000Z`);
  const { data, error } = await supabase
    .from("donations")
    .select("amount, created_at")
    .eq("status", "succeeded")
    .gte("created_at", from.toISOString());
  if (error || !data) {
    return keys.map((k) => ({ day: k, amount: 0, label: formatLabel(k) }));
  }
  const acc: Record<string, number> = {};
  for (const k of keys) acc[k] = 0;
  for (const row of data as { amount: number; created_at: string }[]) {
    const d = row.created_at.slice(0, 10);
    if (d in acc) acc[d] += row.amount;
  }
  return keys.map((k) => ({ day: k, amount: acc[k] || 0, label: formatLabel(k) }));
}

/**
 * Count of audit log events per day.
 */
export async function getAuditEventsByDay(
  supabase: SupabaseClient,
  periodDays: number
): Promise<{ day: string; count: number; label: string }[]> {
  const keys = dayKeys(periodDays);
  const from = new Date(`${keys[0]}T00:00:00.000Z`);
  const { data, error } = await supabase
    .from("audit_logs")
    .select("created_at")
    .gte("created_at", from.toISOString());
  if (error || !data) {
    return keys.map((k) => ({ day: k, count: 0, label: formatLabel(k) }));
  }
  const acc: Record<string, number> = {};
  for (const k of keys) acc[k] = 0;
  for (const row of data as { created_at: string }[]) {
    const d = row.created_at.slice(0, 10);
    if (d in acc) acc[d] += 1;
  }
  return keys.map((k) => ({ day: k, count: acc[k] || 0, label: formatLabel(k) }));
}

function formatLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
