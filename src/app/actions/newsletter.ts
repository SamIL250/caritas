"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database, Json } from "@/types/database.types";
import { resolveDefaultMailFrom, sendMail, isMailFailure } from "@/lib/mail";
import { stripHtmlToText, wrapBroadcastMessageHtml } from "@/lib/newsletter-email-layout";
import { resolveSiteOrigin } from "@/lib/site-origin";
import { sendNewsletterWelcomeEmail, wrapBroadcastPlainText } from "@/lib/send-newsletter-email";

import { sanitizeNewsletterHtml } from "@/lib/newsletter-html";

export type NewsletterSubscriberRow =
  Database["public"]["Tables"]["newsletter_subscribers"]["Row"];
export type NewsletterBroadcastRow =
  Database["public"]["Tables"]["newsletter_broadcasts"]["Row"];

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be signed in.");
  return { supabase, user };
}

type SubscribeRpcPayload = {
  ok?: boolean;
  error?: string;
  unsubscribe_token?: string;
};

function parseSubscribeRpc(raw: Json | null): SubscribeRpcPayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as SubscribeRpcPayload;
}

export async function subscribeToNewsletter(
  emailRaw: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const email = emailRaw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Please enter a valid email address." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("newsletter_subscribe", { p_email: email });

    if (error) return { ok: false, error: error.message };

    const payload = parseSubscribeRpc(data as Json);
    if (!payload?.ok || !payload.unsubscribe_token) {
      const msg =
        payload?.error === "invalid_email"
          ? "Please enter a valid email address."
          : payload?.error === "conflict"
            ? "Something went wrong. Please try again."
            : "Could not subscribe right now.";
      return { ok: false, error: msg };
    }

    const origin = resolveSiteOrigin();
    const unsubscribeUrl = `${origin}/newsletter/unsubscribe?token=${encodeURIComponent(payload.unsubscribe_token)}`;

    void sendNewsletterWelcomeEmail({ to: email, unsubscribeUrl }).then((r) => {
      if (isMailFailure(r) && !r.skipped) {
        console.warn("[newsletter] Welcome email failed:", r.error);
      }
    });

    revalidatePath("/dashboard/newsletter");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not subscribe." };
  }
}

const SEND_PAUSE_MS = 120;

export async function sendNewsletterBroadcast(form: FormData): Promise<{
  ok: boolean;
  error?: string;
  sent?: number;
  failed?: number;
}> {
  try {
    const { supabase, user } = await requireStaff();

    const subject = String(form.get("subject") ?? "").trim().slice(0, 400);
    const htmlRaw = String(form.get("html_body") ?? "").trim();
    const html_body = sanitizeNewsletterHtml(htmlRaw);

    if (!subject.length) return { ok: false, error: "Add a subject line." };
    if (!html_body.length) return { ok: false, error: "Add message content." };

    const confirm = String(form.get("confirm_send") ?? "");
    if (confirm !== "send") {
      return { ok: false, error: "Check the confirmation box before sending." };
    }

    const { data: rows, error: qErr } = await supabase
      .from("newsletter_subscribers")
      .select("email, unsubscribe_token")
      .eq("status", "active");

    if (qErr) return { ok: false, error: qErr.message };

    const recipients = (rows ?? []) as Pick<
      NewsletterSubscriberRow,
      "email" | "unsubscribe_token"
    >[];

    if (!recipients.length) return { ok: false, error: "There are no active subscribers yet." };

    const origin = resolveSiteOrigin();
    if (!resolveDefaultMailFrom()) {
      return {
        ok: false,
        error: "SMTP is not configured (set SMTP_FROM / SMTP_USER).",
      };
    }

    let sent = 0;
    let failed = 0;

    for (const row of recipients) {
      const unsubscribeUrl = `${origin}/newsletter/unsubscribe?token=${encodeURIComponent(row.unsubscribe_token)}`;
      const html = wrapBroadcastMessageHtml({
        innerHtml: html_body,
        unsubscribeUrl,
      });
      const innerText = stripHtmlToText(html_body);
      const text = wrapBroadcastPlainText({ innerText, unsubscribeUrl });

      const r = await sendMail({
        to: row.email,
        subject,
        html,
        text,
      });

      if (r.ok) sent++;
      else failed++;

      await new Promise((res) => setTimeout(res, SEND_PAUSE_MS));
    }

    const { error: insErr } = await supabase.from("newsletter_broadcasts").insert({
      subject,
      html_body,
      text_body: stripHtmlToText(html_body),
      recipient_count: recipients.length,
      batches_sent: recipients.length,
      failed_recipients: failed,
      sent_by: user.id,
    });

    if (insErr) console.warn("[newsletter] Broadcast log insert failed:", insErr.message);

    revalidatePath("/dashboard/newsletter");
    return { ok: true, sent, failed };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Send failed." };
  }
}

export async function exportNewsletterSubscribersCsv(): Promise<{ csv?: string; error?: string }> {
  try {
    const { supabase } = await requireStaff();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("email,status,subscribed_at,unsubscribed_at")
      .order("subscribed_at", { ascending: false });

    if (error) return { error: error.message };

    const rows = (data ?? []) as Pick<
      NewsletterSubscriberRow,
      "email" | "status" | "subscribed_at" | "unsubscribed_at"
    >[];

    const header = ["email", "status", "subscribed_at", "unsubscribed_at"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          csvEscape(r.email),
          csvEscape(r.status),
          csvEscape(r.subscribed_at),
          csvEscape(r.unsubscribed_at ?? ""),
        ].join(","),
      ),
    ];

    return { csv: lines.join("\n") };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Export failed." };
  }
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
