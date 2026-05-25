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
  periodDays: number,
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
  periodDays: number,
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

/** Content status breakdown for all content types. */
export type ContentStatusBreakdown = {
  type: string;
  label: string;
  published: number;
  draft: number;
  archived?: number;
  total: number;
};

/** Fetch status breakdowns for all tracked content tables. */
export async function getContentStatusBreakdowns(
  supabase: SupabaseClient,
): Promise<ContentStatusBreakdown[]> {
  const results = await Promise.allSettled([
    supabase
      .from("pages")
      .select("status")
      .in("status", ["draft", "published", "archived"]),
    supabase
      .from("news_articles")
      .select("status")
      .in("status", ["draft", "published"]),
    supabase
      .from("programs")
      .select("status")
      .in("status", ["draft", "published"]),
    supabase
      .from("publications")
      .select("status")
      .in("status", ["draft", "published"]),
    supabase
      .from("events")
      .select("status")
      .in("status", ["draft", "published", "cancelled"]),
    supabase
      .from("community_campaigns")
      .select("status")
      .in("status", ["draft", "pending_review", "published", "archived"]),
  ]);

  const configs: {
    type: string;
    label: string;
    statuses: { published: string[]; draft: string[]; archived?: string[] };
  }[] = [
    {
      type: "pages",
      label: "Pages",
      statuses: {
        published: ["published"],
        draft: ["draft"],
        archived: ["archived"],
      },
    },
    {
      type: "news_articles",
      label: "News",
      statuses: { published: ["published"], draft: ["draft"] },
    },
    {
      type: "programs",
      label: "Programs",
      statuses: { published: ["published"], draft: ["draft"] },
    },
    {
      type: "publications",
      label: "Publications",
      statuses: { published: ["published"], draft: ["draft"] },
    },
    {
      type: "events",
      label: "Events",
      statuses: {
        published: ["published"],
        draft: ["draft"],
        archived: ["cancelled"],
      },
    },
    {
      type: "community_campaigns",
      label: "Campaigns",
      statuses: {
        published: ["published"],
        draft: ["draft", "pending_review"],
        archived: ["archived"],
      },
    },
  ];

  return configs.map((cfg, i) => {
    const rows = (results[i] as PromiseFulfilledResult<any>).value?.data ?? [];
    const published = rows.filter((r: any) =>
      cfg.statuses.published.includes(r.status),
    ).length;
    const draft = rows.filter((r: any) =>
      cfg.statuses.draft.includes(r.status),
    ).length;
    const archived = cfg.statuses.archived
      ? rows.filter((r: any) => cfg.statuses.archived!.includes(r.status)).length
      : undefined;
    return {
      type: cfg.type,
      label: cfg.label,
      published,
      draft,
      archived,
      total: rows.length,
    };
  });
}

/** Aggregate donation summary. */
export type DonationSummary = {
  totalSucceeded: number;
  totalPending: number;
  totalFailed: number;
  totalRefunded: number;
  totalAmountRwf: number;
  averageAmount: number;
  donorCount: number;
};

export async function getDonationSummary(
  supabase: SupabaseClient,
): Promise<DonationSummary> {
  const { data } = await supabase.from("donations").select("amount, status, donor_email");
  const rows = (data ?? []) as { amount: number; status: string; donor_email: string | null }[];

  const succeeded = rows.filter((r) => r.status === "succeeded");
  const totalSucceeded = succeeded.length;
  const totalAmountRwf = succeeded.reduce((acc, r) => acc + Number(r.amount || 0), 0);
  const totalPending = rows.filter((r) => r.status === "pending").length;
  const totalFailed = rows.filter((r) => r.status === "failed").length;
  const totalRefunded = rows.filter((r) => r.status === "refunded").length;

  // Unique donor emails among succeeded donations
  const uniqueDonors = new Set(
    succeeded.map((r) => r.donor_email).filter((e): e is string => Boolean(e)),
  );

  return {
    totalSucceeded,
    totalPending,
    totalFailed,
    totalRefunded,
    totalAmountRwf,
    averageAmount: totalSucceeded > 0 ? Math.round(totalAmountRwf / totalSucceeded) : 0,
    donorCount: uniqueDonors.size,
  };
}

/** Engagement summary (newsletter, contacts, volunteers). */
export type EngagementSummary = {
  newsletterActive: number;
  newsletterUnsubscribed: number;
  newsletterBroadcasts: number;
  contactNew: number;
  contactTotal: number;
  volunteerPending: number;
  volunteerTotal: number;
};

export async function getEngagementSummary(
  supabase: SupabaseClient,
): Promise<EngagementSummary> {
  const results = await Promise.allSettled([
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "unsubscribed"),
    supabase.from("newsletter_broadcasts").select("id", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }),
    supabase
      .from("volunteer_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("volunteer_applications").select("id", { count: "exact", head: true }),
  ]);

  const val = (i: number) =>
    (results[i] as PromiseFulfilledResult<{ count: number | null }>).value?.count ?? 0;

  return {
    newsletterActive: val(0),
    newsletterUnsubscribed: val(1),
    newsletterBroadcasts: val(2),
    contactNew: val(3),
    contactTotal: val(4),
    volunteerPending: val(5),
    volunteerTotal: val(6),
  };
}

/** Recent items across all content types for the activity feed. */
export type RecentContentItem = {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  status: string;
  updatedAt: string;
  href: string;
};

export async function getRecentContentItems(
  supabase: SupabaseClient,
  limit = 12,
): Promise<RecentContentItem[]> {
  const results = await Promise.allSettled([
    supabase
      .from("pages")
      .select("id, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("news_articles")
      .select("id, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("programs")
      .select("id, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("publications")
      .select("id, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("events")
      .select("id, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("community_campaigns")
      .select("id, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
  ]);

  const configs = [
    { type: "pages", label: "Page", href: (id: string) => `/dashboard/pages/${id}` },
    { type: "news_articles", label: "News", href: (id: string) => `/dashboard/news/${id}` },
    { type: "programs", label: "Program", href: (id: string) => `/dashboard/programs/${id}` },
    { type: "publications", label: "Publication", href: (id: string) => `/dashboard/publications/${id}` },
    { type: "events", label: "Event", href: (id: string) => `/dashboard/events/${id}` },
    { type: "community_campaigns", label: "Campaign", href: (id: string) => `/dashboard/community-campaigns/${id}` },
  ];

  const all: RecentContentItem[] = [];
  for (let i = 0; i < configs.length; i++) {
    const rows = (results[i] as PromiseFulfilledResult<any>).value?.data ?? [];
    for (const row of rows) {
      all.push({
        id: row.id,
        type: configs[i].type,
        typeLabel: configs[i].label,
        title: row.title,
        status: row.status,
        updatedAt: row.updated_at,
        href: configs[i].href(row.id),
      });
    }
  }

  return all
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

function formatLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
