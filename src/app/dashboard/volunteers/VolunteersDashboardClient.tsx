"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { VolunteerApplicationRow } from "@/app/actions/volunteer-applications";

export default function VolunteersDashboardClient({
  applications,
  campaignTitleById,
}: {
  applications: VolunteerApplicationRow[];
  campaignTitleById: Record<string, string>;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-stone-100 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
          <tr>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3">Applicant</th>
            <th className="px-4 py-3">Preference</th>
            <th className="px-4 py-3">Status</th>
            <th className="min-w-[8rem] px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {applications.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-stone-500">
                No applications yet. Public submissions appear here from{" "}
                <Link href="/get-involved" className="font-semibold text-[#7A1515] underline underline-offset-2">
                  Get Involved
                </Link>
                .
              </td>
            </tr>
          ) : (
            applications.map((a) => {
              const prefTitle = a.preferred_campaign_id
                ? campaignTitleById[a.preferred_campaign_id] ?? "—"
                : "Any open opportunity";
              const variant =
                a.status === "accepted" ? "success" : a.status === "rejected" ? "danger" : "default";
              return (
                <tr key={a.id} className="hover:bg-stone-50/80">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-600">
                    {new Date(a.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-stone-900">{a.full_name}</div>
                    <div className="mt-0.5 text-xs text-stone-500">{a.email}</div>
                  </td>
                  <td className="max-w-[14rem] px-4 py-3 text-xs text-stone-700">{prefTitle}</td>
                  <td className="px-4 py-3">
                    <Badge variant={variant}>{a.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/volunteers/${a.id}`}
                      className="text-xs font-semibold text-[#7A1515] underline underline-offset-2 hover:decoration-[#7A1515]/80"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
