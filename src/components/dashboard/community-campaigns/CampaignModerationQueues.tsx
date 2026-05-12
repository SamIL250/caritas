"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";

import { moderateCommunityCampaignComment } from "@/app/actions/community-campaigns";
import { MODERATION_REVIEWED_PAGE_LIMIT, type EnrichedModerationComment } from "@/lib/community-campaign-moderation-data";
import { Button } from "@/components/ui/Button";

export type ModerationQueueKey = "pending" | "approved" | "rejected";

function queueFromSearch(raw: string | null): ModerationQueueKey {
  if (raw === "approved" || raw === "rejected") return raw;
  return "pending";
}

type Props = {
  pendingComments: EnrichedModerationComment[];
  approvedComments: EnrichedModerationComment[];
  rejectedComments: EnrichedModerationComment[];
};

export function CampaignModerationQueues({
  pendingComments,
  approvedComments,
  rejectedComments,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busy, startTransition] = useTransition();

  const queue = useMemo(() => queueFromSearch(searchParams.get("queue")), [searchParams]);

  const standaloneCommentsPage = pathname.replace(/\/$/, "").endsWith("/community-campaigns/comments");

  function setQueue(next: ModerationQueueKey) {
    const q = new URLSearchParams(searchParams.toString());
    if (next === "pending") {
      q.delete("queue");
    } else {
      q.set("queue", next);
    }
    if (!standaloneCommentsPage) {
      q.set("tab", "moderation");
    }
    const qs = q.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  const rows =
    queue === "approved" ? approvedComments : queue === "rejected" ? rejectedComments : pendingComments;

  const hitReviewedCap =
    approvedComments.length >= MODERATION_REVIEWED_PAGE_LIMIT ||
    rejectedComments.length >= MODERATION_REVIEWED_PAGE_LIMIT;

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600">
        Approve or reject visitor comments on published campaigns. Only approved threads show on the public site.
        {hitReviewedCap ? (
          <>
            {" "}
            Showing up to {MODERATION_REVIEWED_PAGE_LIMIT} most recently moderated comments per status; older rows remain in
            the database.
          </>
        ) : (
          <> Use Approved / Rejected to review past decisions.</>
        )}
      </p>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Comment moderation queue">
        {(
          [
            ["pending", "Pending", pendingComments.length],
            ["approved", "Approved", approvedComments.length],
            ["rejected", "Rejected", rejectedComments.length],
          ] as const
        ).map(([key, label, count]) => {
          const active = queue === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setQueue(key)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                active
                  ? "bg-[#7A1515] text-white shadow-sm"
                  : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              {label}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold tabular-nums ${
                  active ? "bg-white/20 text-white" : "bg-stone-100 text-stone-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
          {queue === "pending"
            ? "No pending comments."
            : queue === "approved"
              ? "No approved comments in history yet."
              : "No rejected comments in history yet."}
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((c) => (
            <li key={c.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                        c.status === "pending"
                          ? "bg-amber-100 text-amber-900"
                          : c.status === "approved"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-red-50 text-red-800"
                      }`}
                    >
                      {c.status}
                    </span>
                    {c.moderated_at ? (
                      <span className="text-[11px] text-stone-500">
                        Moderated {new Date(c.moderated_at).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-wider text-stone-400">
                    {c.campaign_title ?? "Campaign"} ·{" "}
                    <Link
                      href={`/campaigns/${c.campaign_slug ?? ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7A1515]"
                    >
                      /campaigns/{c.campaign_slug}
                    </Link>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-stone-900">{c.author_display_name}</div>
                  {c.author_email ? (
                    <div className="text-[11px] text-stone-500">{c.author_email}</div>
                  ) : null}
                  <div className="text-[11px] text-stone-400">
                    Submitted {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>
                {c.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      disabled={busy}
                      className="text-xs"
                      onClick={() => {
                        startTransition(async () => {
                          await moderateCommunityCampaignComment(c.id, "approved");
                          router.refresh();
                        });
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy}
                      className="text-xs"
                      onClick={() => {
                        startTransition(async () => {
                          await moderateCommunityCampaignComment(c.id, "rejected");
                          router.refresh();
                        });
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
              <p className="mt-3 whitespace-pre-wrap border-t border-stone-100 pt-3 text-sm text-stone-700">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
