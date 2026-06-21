"use client";

import { useState, useTransition, useMemo } from "react";
import { updateAccessRequest } from "@/app/actions/publication-access";
import { Mail, CheckCircle, XCircle, Clock, Loader2, Filter } from "lucide-react";
import type { AccessRequestWithPubTitle } from "@/lib/publication-access";

type Props = { requests: AccessRequestWithPubTitle[] };
type Tab = "all" | "pending" | "granted" | "denied";

export function AccessRequestsClient({ requests }: Props) {
  const [, startTransition] = useTransition();
  const [updating, setUpdating] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("pending");

  const filtered = useMemo(
    () => (tab === "all" ? requests : requests.filter((r) => r.status === tab)),
    [requests, tab],
  );

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: requests.length };
    for (const r of requests) m[r.status] = (m[r.status] || 0) + 1;
    return m as Record<string, number>;
  }, [requests]);

  async function handleUpdate(id: string, status: "granted" | "denied") {
    setUpdating(id);
    startTransition(async () => {
      await updateAccessRequest(id, status);
      setUpdating(null);
    });
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "granted", label: "Granted" },
    { key: "denied", label: "Denied" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 border-b border-stone-200 pb-px">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`relative -mb-px inline-flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === t.key
                ? "border border-b-0 border-stone-200 bg-white text-[#7A1515]"
                : "border border-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-800"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                tab === t.key ? "bg-[#7A1515]/10 text-[#7A1515]" : "bg-stone-100 text-stone-500"
              }`}
            >
              {counts[t.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
          <Mail size={32} className="mx-auto mb-3 text-stone-300" />
          <p className="text-sm font-medium text-stone-500">No {tab} requests.</p>
          <p className="text-xs text-stone-400 mt-1">
            {tab === "pending"
              ? "Requests from users trying to view locked publications will appear here."
              : "No requests with this status."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm ${
                r.status === "pending"
                  ? "border-amber-200"
                  : r.status === "granted"
                    ? "border-emerald-200"
                    : "border-stone-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        r.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "granted"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {r.status === "pending" ? (
                        <Clock size={11} />
                      ) : r.status === "granted" ? (
                        <CheckCircle size={11} />
                      ) : (
                        <XCircle size={11} />
                      )}
                      {r.status}
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-stone-900">{r.requester_email}</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    Requested access to: <span className="font-medium text-stone-700">{r.publication_title}</span>
                  </p>
                </div>

                {r.status === "pending" && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleUpdate(r.id, "granted")}
                      disabled={updating === r.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {updating === r.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      Grant
                    </button>
                    <button
                      onClick={() => handleUpdate(r.id, "denied")}
                      disabled={updating === r.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      Deny
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
