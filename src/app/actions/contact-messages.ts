"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database.types";
import { getMergedFooterSettings } from "@/lib/site-settings";
import { isContactTopic } from "@/lib/contact-topics";
import { resolveDefaultMailFrom, isMailFailure } from "@/lib/mail";
import { resolveSiteOrigin } from "@/lib/site-origin";
import {
  sendContactStaffAlertEmail,
  sendContactStaffReplyEmail,
  sendContactVisitorAckEmail,
} from "@/lib/send-contact-email";

export type ContactMessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];
export type ContactReplyRow = Database["public"]["Tables"]["contact_message_replies"]["Row"];

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be signed in.");
  return { supabase, user };
}

export async function submitContactMessage(input: {
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  topic: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const full_name = input.fullName.trim();
    const email = input.email.trim().toLowerCase();
    const phone = (input.phone ?? "").trim();
    const organization = (input.organization ?? "").trim();
    const topic = input.topic.trim();
    const message_body = input.message.trim();

    if (full_name.length < 2) return { ok: false, error: "Please enter your full name." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please enter a valid email." };
    if (!isContactTopic(topic)) return { ok: false, error: "Please choose a valid topic." };
    if (message_body.length < 10) return { ok: false, error: "Please write a bit more detail (at least 10 characters)." };

    const supabase = await createClient();

    const { data: inserted, error } = await supabase
      .from("contact_messages")
      .insert({
        status: "new",
        full_name,
        email,
        phone,
        organization,
        topic,
        message_body,
        staff_notes: "",
      })
      .select("id")
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    const id = inserted?.id as string | undefined;
    if (!id) return { ok: false, error: "Could not save your message." };

    const footer = await getMergedFooterSettings();
    const staffInbox = footer.contact.email.trim();
    const origin = resolveSiteOrigin();
    const dashboardUrl = `${origin}/dashboard/contact/${id}`;
    const preview = message_body.replace(/\s+/g, " ");

    void Promise.all([
      sendContactVisitorAckEmail({
        to: email,
        visitorName: full_name.split(/\s+/)[0] || full_name,
        topic,
      }).then((r) => {
        if (isMailFailure(r) && !r.skipped) {
          console.warn("[contact] Visitor ack failed:", r.error);
        }
      }),
      staffInbox
        ? sendContactStaffAlertEmail({
            staffInbox,
            visitorName: full_name,
            visitorEmail: email,
            phone,
            organization,
            topic,
            messagePreview: preview,
            dashboardUrl,
          }).then((r) => {
            if (isMailFailure(r) && !r.skipped) {
              console.warn("[contact] Staff alert failed:", r.error);
            }
          })
        : Promise.resolve(),
    ]).catch((e) => console.warn("[contact] Notification error:", e));

    revalidatePath("/dashboard/contact");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function fetchContactDetailForDashboard(messageId: string): Promise<{
  message: ContactMessageRow;
  replies: ContactReplyRow[];
  notifyInboxEmail: string;
} | null> {
  const { supabase, user } = await requireStaff();

  const { data: msg, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", messageId)
    .maybeSingle();

  if (error || !msg) return null;

  if (msg.status === "new") {
    await supabase
      .from("contact_messages")
      .update({
        status: "read",
        read_at: new Date().toISOString(),
        read_by: user.id,
      })
      .eq("id", messageId)
      .eq("status", "new");
  }

  const { data: fresh, error: freshErr } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", messageId)
    .single();

  if (freshErr || !fresh) return null;

  const { data: replies } = await supabase
    .from("contact_message_replies")
    .select("*")
    .eq("contact_message_id", messageId)
    .order("sent_at", { ascending: true });

  const footer = await getMergedFooterSettings();
  const notifyInboxEmail = footer.contact.email.trim();

  return {
    message: fresh as ContactMessageRow,
    replies: (replies ?? []) as ContactReplyRow[],
    notifyInboxEmail,
  };
}

export async function updateContactMessageMeta(
  messageId: string,
  form: FormData,
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireStaff();

    const status = String(form.get("status") || "").trim() as ContactMessageRow["status"];
    const allowed: ContactMessageRow["status"][] = ["new", "read", "replied", "archived"];
    if (!allowed.includes(status)) return { error: "Invalid status." };

    const staff_notes = String(form.get("staff_notes") || "").trim().slice(0, 8000);

    const { error } = await supabase
      .from("contact_messages")
      .update({
        status,
        staff_notes,
      })
      .eq("id", messageId);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/contact");
    revalidatePath(`/dashboard/contact/${messageId}`);
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Could not save." };
  }
}

export async function replyToContactMessage(messageId: string, form: FormData): Promise<{ error?: string }> {
  try {
    const { supabase, user } = await requireStaff();

    const body_text = String(form.get("reply_body") || "").trim();
    if (body_text.length < 4) return { error: "Please write a reply (at least a few characters)." };

    const { data: msg, error: fetchErr } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("id", messageId)
      .maybeSingle();

    if (fetchErr || !msg) return { error: "Message not found." };

    const footer = await getMergedFooterSettings();
    const inbox = footer.contact.email.trim() || resolveDefaultMailFrom() || undefined;

    const visitorFirst = msg.full_name.trim().split(/\s+/)[0] || msg.full_name.trim();

    const mail = await sendContactStaffReplyEmail({
      to: msg.email,
      visitorName: visitorFirst,
      topic: msg.topic,
      replyPlainText: body_text,
      replyToInbox: inbox,
    });

    if (isMailFailure(mail)) {
      return {
        error: mail.skipped ? "SMTP is not configured." : mail.error,
      };
    }

    const { error: repErr } = await supabase.from("contact_message_replies").insert({
      contact_message_id: messageId,
      body_text,
      sent_by: user.id,
    });

    if (repErr) return { error: repErr.message };

    await supabase
      .from("contact_messages")
      .update({
        status: "replied",
      })
      .eq("id", messageId);

    revalidatePath("/dashboard/contact");
    revalidatePath(`/dashboard/contact/${messageId}`);
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Could not send reply." };
  }
}
