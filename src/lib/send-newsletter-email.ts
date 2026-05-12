/**
 * Newsletter transactional sends via {@link sendMail}; HTML shells live in {@link newsletter-email-layout}.
 */

import { sendMail, type MailSendResult } from "@/lib/mail";
import {
  emailShell,
  escapeHtml,
  stripHtmlToText,
} from "@/lib/newsletter-email-layout";

export type NewsletterMailResult = MailSendResult;

export async function sendNewsletterWelcomeEmail(opts: {
  to: string;
  unsubscribeUrl: string;
}): Promise<NewsletterMailResult> {
  const inner = `
<p style="margin:0 0 14px;">Thank you for subscribing.</p>
<p style="margin:0 0 14px;">You’ll receive occasional updates about our programmes, stories from the field, and ways to support communities across Rwanda.</p>
<p style="margin:0 0 14px;color:#64748b;font-size:14px;">If you didn’t ask for this, you can safely ignore this message—or unsubscribe anytime using the link below.</p>
<p style="margin:22px 0 14px;text-align:center;">
  <a href="${escapeHtml(opts.unsubscribeUrl)}" style="display:inline-block;padding:11px 22px;background:#7A1515;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">Manage subscription</a>
</p>
<p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;text-align:center;">
  <a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:#64748b;">Unsubscribe</a>
</p>`;

  const html = emailShell(inner);
  const text =
    stripHtmlToText(inner) +
    `\n\nUnsubscribe: ${opts.unsubscribeUrl}\n`;

  return sendMail({
    to: opts.to,
    subject: "You’re subscribed — Caritas Rwanda",
    html,
    text,
  });
}

export function wrapBroadcastPlainText(opts: { innerText: string; unsubscribeUrl: string }): string {
  return `${opts.innerText.trim()}\n\n---\nUnsubscribe: ${opts.unsubscribeUrl}\n`;
}
