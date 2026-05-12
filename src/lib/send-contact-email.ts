/**
 * Contact inbox notifications & reply templates — HTML uses {@link newsletter-email-layout}.
 */

import { sendMail, type MailSendResult } from "@/lib/mail";
import { emailShell, escapeHtml, stripHtmlToText } from "@/lib/newsletter-email-layout";
import { resolveSiteOrigin } from "@/lib/site-origin";

export type ContactMailResult = MailSendResult;

function paragraphsFromPlain(text: string): string {
  const escaped = escapeHtml(text.trim()).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const parts = escaped.split(/\n\n+/).filter(Boolean);
  if (!parts.length) return `<p style="margin:0 0 14px;color:#64748b;font-size:14px;">(No message body)</p>`;
  return parts
    .map((chunk) => {
      const lines = chunk.split("\n").join("<br/>");
      return `<p style="margin:0 0 14px;line-height:1.65;">${lines}</p>`;
    })
    .join("");
}

/** Visitor receives this immediately after submitting the contact form. */
export async function sendContactVisitorAckEmail(opts: {
  to: string;
  visitorName: string;
  topic: string;
}): Promise<ContactMailResult> {
  const inner = `
<p style="margin:0 0 14px;">Dear ${escapeHtml(opts.visitorName)},</p>
<p style="margin:0 0 14px;">Thank you for contacting <strong>Caritas Rwanda</strong>. We’ve received your message regarding <strong>${escapeHtml(opts.topic)}</strong>.</p>
<p style="margin:0 0 14px;color:#64748b;font-size:14px;">A member of our team will respond by email as soon as possible — typically within one business day.</p>
<p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.55;">— Caritas Rwanda<br/><a href="${escapeHtml(resolveSiteOrigin())}" style="color:#7A1515;font-weight:600;">${escapeHtml(resolveSiteOrigin())}</a></p>`;

  const html = emailShell(inner);
  const text =
    stripHtmlToText(inner) +
    `\n\nReference topic: ${opts.topic}\n`;

  return sendMail({
    to: opts.to,
    subject: `We received your message — ${opts.topic}`,
    html,
    text,
  });
}

/** Alerts office inbox when a new contact message arrives (dashboard link). */
export async function sendContactStaffAlertEmail(opts: {
  staffInbox: string;
  visitorName: string;
  visitorEmail: string;
  phone: string;
  organization: string;
  topic: string;
  messagePreview: string;
  dashboardUrl: string;
}): Promise<ContactMailResult> {
  const preview =
    opts.messagePreview.length > 600 ? `${opts.messagePreview.slice(0, 600)}…` : opts.messagePreview;

  const inner = `
<p style="margin:0 0 14px;font-weight:700;color:#0f172a;">New website contact message</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;color:#334155;line-height:1.55;margin-bottom:18px;">
<tr><td style="padding:4px 12px 4px 0;vertical-align:top;font-weight:600;color:#64748b;width:108px;">From</td><td>${escapeHtml(opts.visitorName)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;vertical-align:top;font-weight:600;color:#64748b;">Email</td><td><a href="mailto:${escapeHtml(opts.visitorEmail)}">${escapeHtml(opts.visitorEmail)}</a></td></tr>
<tr><td style="padding:4px 12px 4px 0;vertical-align:top;font-weight:600;color:#64748b;">Phone</td><td>${escapeHtml(opts.phone || "—")}</td></tr>
<tr><td style="padding:4px 12px 4px 0;vertical-align:top;font-weight:600;color:#64748b;">Organization</td><td>${escapeHtml(opts.organization || "—")}</td></tr>
<tr><td style="padding:4px 12px 4px 0;vertical-align:top;font-weight:600;color:#64748b;">Topic</td><td>${escapeHtml(opts.topic)}</td></tr>
</table>
<p style="margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#94a3b8;">Message</p>
<div style="padding:14px 16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;font-size:14px;color:#334155;line-height:1.65;margin-bottom:22px;">
${paragraphsFromPlain(preview)}
</div>
<p style="margin:0;text-align:center;">
  <a href="${escapeHtml(opts.dashboardUrl)}" style="display:inline-block;padding:12px 24px;background:#7A1515;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;font-size:14px;">Open in dashboard</a>
</p>`;

  const html = emailShell(inner);
  const text = `${stripHtmlToText(inner)}\n\nDashboard: ${opts.dashboardUrl}\n`;

  return sendMail({
    to: opts.staffInbox,
    subject: `[Contact] ${opts.topic} — ${opts.visitorName}`,
    replyTo: opts.visitorEmail,
    html,
    text,
  });
}

/** Staff reply delivered to the visitor (Reply-To routes follow-ups to office inbox when possible). */
export async function sendContactStaffReplyEmail(opts: {
  to: string;
  visitorName: string;
  topic: string;
  replyPlainText: string;
  replyToInbox?: string;
}): Promise<ContactMailResult> {
  const inner = `
<p style="margin:0 0 14px;">Dear ${escapeHtml(opts.visitorName)},</p>
${paragraphsFromPlain(opts.replyPlainText)}
<p style="margin:22px 0 0;font-size:13px;color:#64748b;line-height:1.55;">With gratitude,<br/><strong>Caritas Rwanda</strong></p>
<p style="margin:14px 0 0;font-size:12px;color:#94a3b8;line-height:1.55;">You originally wrote about <strong>${escapeHtml(opts.topic)}</strong>. Reply to this email if you need anything further.</p>`;

  const html = emailShell(inner);
  const text = `${stripHtmlToText(inner)}\n`;

  return sendMail({
    to: opts.to,
    subject: `Re: ${opts.topic} — Caritas Rwanda`,
    replyTo: opts.replyToInbox,
    html,
    text,
  });
}
