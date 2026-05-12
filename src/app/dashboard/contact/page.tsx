import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import type { ContactMessageRow } from "@/app/actions/contact-messages";

function statusVariant(s: ContactMessageRow["status"]): "success" | "warning" | "danger" | "default" {
  if (s === "new") return "warning";
  if (s === "read") return "default";
  if (s === "replied") return "success";
  return "default";
}

export default async function ContactInboxPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  const rows = (data ?? []) as ContactMessageRow[];

  return (
    <div className="w-full max-w-6xl">
      <Topbar
        title="Contact inbox"
        subtitle={
          <>
            Messages from the public{" "}
            <Link
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-[3px] hover:text-[#7A1515]"
            >
              Contact
            </Link>{" "}
            section. Visitors receive an acknowledgement email; staff alerts use your footer email from{" "}
            <Link
              href="/dashboard/settings"
              className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-[3px] hover:text-[#7A1515]"
            >
              Settings
            </Link>
            .
          </>
        }
      />

      <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Visitor</th>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Status</th>
              <th className="min-w-[7rem] px-4 py-3 text-right">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center text-stone-500">
                  No messages yet. Submissions appear here when visitors use the{" "}
                  <Link href="/contact" className="font-semibold text-[#7A1515] underline underline-offset-2">
                    contact form
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              rows.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50/80">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-600">
                    {new Date(m.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-stone-900">{m.full_name}</div>
                    <div className="mt-0.5 truncate max-w-[14rem] text-xs text-stone-500">{m.email}</div>
                  </td>
                  <td className="max-w-[11rem] truncate px-4 py-3 text-xs text-stone-700">{m.topic}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/contact/${m.id}`}
                      className="text-xs font-semibold text-[#7A1515] underline underline-offset-2 hover:decoration-[#7A1515]/80"
                    >
                      View & reply
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
