type DatedContentRow = {
  published_at?: string | null;
  created_at?: string | null;
  title?: string | null;
};

function contentTimestamp(row: DatedContentRow): number {
  const raw = row.published_at ?? row.created_at;
  if (!raw) return 0;
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? time : 0;
}

/** Public listings: newest published (or created) content first. */
export function compareByPublishedNewest(a: DatedContentRow, b: DatedContentRow): number {
  const timeDiff = contentTimestamp(b) - contentTimestamp(a);
  if (timeDiff !== 0) return timeDiff;
  return (a.title ?? "").localeCompare(b.title ?? "");
}

export function sortByPublishedNewest<T extends DatedContentRow>(rows: T[]): T[] {
  return [...rows].sort(compareByPublishedNewest);
}
