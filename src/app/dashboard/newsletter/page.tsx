import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import NewsletterDashboardClient from "./NewsletterDashboardClient";
import type { NewsletterBroadcastRow, NewsletterSubscriberRow } from "@/app/actions/newsletter";
import { resolveSiteOrigin } from "@/lib/site-origin";

export default async function DashboardNewsletterPage() {
  const supabase = await createClient();

  const [
    { count: activeSubscribers },
    { count: unsubscribedCount },
    { count: broadcastCount },
    { data: recentSubscribers },
    { data: broadcasts },
  ] = await Promise.all([
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "unsubscribed"),
    supabase.from("newsletter_broadcasts").select("*", { count: "exact", head: true }),
    supabase
      .from("newsletter_subscribers")
      .select("id,email,status,subscribed_at")
      .order("subscribed_at", { ascending: false })
      .limit(14),
    supabase
      .from("newsletter_broadcasts")
      .select("id,subject,recipient_count,failed_recipients,sent_at")
      .order("sent_at", { ascending: false })
      .limit(20),
  ]);

  const subs = (recentSubscribers ?? []) as Pick<
    NewsletterSubscriberRow,
    "id" | "email" | "status" | "subscribed_at"
  >[];
  const hist = (broadcasts ?? []) as Pick<
    NewsletterBroadcastRow,
    "id" | "subject" | "recipient_count" | "failed_recipients" | "sent_at"
  >[];

  const siteOrigin = resolveSiteOrigin();

  return (
    <div className="w-full max-w-6xl">
      <Topbar
        title="Newsletter"
        subtitle={
          <>
            Reach subscribers who joined via the{" "}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-[3px] hover:text-[#7A1515]"
            >
              website footer
            </Link>
            . SMTP uses your existing{" "}
            <Link
              href="/dashboard/settings"
              className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-[3px] hover:text-[#7A1515]"
            >
              Settings
            </Link>{" "}
            mail configuration.
          </>
        }
      />
      <NewsletterDashboardClient
        siteOrigin={siteOrigin}
        activeSubscribers={activeSubscribers ?? 0}
        unsubscribedCount={unsubscribedCount ?? 0}
        broadcastCount={broadcastCount ?? 0}
        recentSubscribers={subs}
        broadcasts={hist}
      />
    </div>
  );
}
