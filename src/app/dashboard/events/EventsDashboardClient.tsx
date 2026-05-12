"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Calendar, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteEvent } from "@/app/actions/events";
import type { EventRow } from "@/lib/events";
import { formatEventDateRange } from "@/lib/events";

export default function EventsDashboardClient({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirmId) return;
    setBusy(true);
    setError(null);
    const res = await deleteEvent(confirmId);
    setBusy(false);
    if (res.error) setError(res.error);
    else {
      setConfirmId(null);
      router.refresh();
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-stone-600">
          Plan and publish events. Published events appear in the floating events panel on the public website with a
          calendar view.
        </p>
        <Link
          href="/dashboard/events/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
        >
          New event
        </Link>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Where</th>
              <th className="px-4 py-3">Status</th>
              <th className="min-w-[10rem] px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-stone-500">
                  No events yet. Create one to populate the public calendar.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="hover:bg-stone-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <div>
                        <div className="font-semibold text-stone-900">{e.title}</div>
                        <div className="mt-0.5 font-mono text-[11px] text-stone-500">/{e.slug}</div>
                        {e.category_label ? (
                          <div className="mt-1 inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                            {e.category_label}
                          </div>
                        ) : null}
                      </div>
                      {e.featured ? (
                        <Star size={14} className="mt-1 fill-amber-400 text-amber-500" aria-label="Featured" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-700">
                    <div className="inline-flex items-center gap-1.5">
                      <Calendar size={13} className="text-stone-400" aria-hidden />
                      {formatEventDateRange(e)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-700">
                    {e.location_label ? (
                      <div className="inline-flex items-center gap-1.5">
                        <MapPin size={13} className="text-stone-400" aria-hidden />
                        {e.location_label}
                      </div>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(e.status)}>{e.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-gradient-to-b from-white to-stone-50 p-1 shadow-sm">
                      <Link
                        href={`/dashboard/events/${e.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-white hover:text-[#7A1515]"
                      >
                        <Pencil size={12} aria-hidden />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmId(e.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:bg-white hover:text-red-700"
                      >
                        <Trash2 size={12} aria-hidden />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmId)}
        onClose={() => setConfirmId(null)}
        onConfirm={() => void handleDelete()}
        title="Delete event"
        description="This permanently removes the event for staff and visitors."
        confirmLabel={busy ? "Deleting…" : "Delete"}
      />
    </div>
  );
}

function statusVariant(status: EventRow["status"]): "success" | "warning" | "danger" | "default" {
  if (status === "published") return "success";
  if (status === "cancelled") return "danger";
  return "warning";
}
