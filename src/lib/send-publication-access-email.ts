import { sendMail } from "@/lib/mail";
import { emailShell, escapeHtml, stripHtmlToText } from "@/lib/newsletter-email-layout";
import { resolveSiteOrigin } from "@/lib/site-origin";

/** Notify admin when someone requests access to a locked publication. */
export async function sendAccessRequestedAlert(opts: {
  to: string;
  requesterEmail: string;
  publicationTitle: string;
  dashboardUrl: string;
}) {
  const inner = `
<p style="margin:0 0 14px;font-weight:700;color:#0f172a;">New Publication Access Request</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;color:#334155;line-height:1.55;margin-bottom:18px;">
<tr><td style="padding:4px 12px 4px 0;vertical-align:top;font-weight:600;color:#64748b;width:108px;">Requester</td><td><a href="mailto:${escapeHtml(opts.requesterEmail)}">${escapeHtml(opts.requesterEmail)}</a></td></tr>
<tr><td style="padding:4px 12px 4px 0;vertical-align:top;font-weight:600;color:#64748b;">Publication</td><td>${escapeHtml(opts.publicationTitle)}</td></tr>
</table>
<p style="margin:0;text-align:center;">
  <a href="${escapeHtml(opts.dashboardUrl)}" style="display:inline-block;padding:12px 24px;background:#7A1515;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;font-size:14px;">Review in dashboard</a>
</p>`;

  return sendMail({
    to: opts.to,
    subject: `[Access Request] ${opts.publicationTitle} — ${opts.requesterEmail}`,
    html: emailShell(inner),
    text: stripHtmlToText(inner) + `\n\nDashboard: ${opts.dashboardUrl}\n`,
  });
}

/** Send the password to a requester after admin approves. */
export async function sendAccessGrantedEmail(opts: {
  to: string;
  publicationTitle: string;
  password: string;
  publicationUrl: string;
}) {
  const inner = `
<p style="margin:0 0 14px;">Your request to access <strong>${escapeHtml(opts.publicationTitle)}</strong> has been approved.</p>
<p style="margin:0 0 18px;">Use the password below to unlock the publication:</p>
<div style="display:inline-block;padding:14px 28px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;font-family:monospace;font-size:16px;font-weight:700;letter-spacing:0.12em;color:#0f172a;margin-bottom:18px;">${escapeHtml(opts.password)}</div>
<p style="margin:0;text-align:center;">
  <a href="${escapeHtml(opts.publicationUrl)}" style="display:inline-block;padding:12px 24px;background:#7A1515;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;font-size:14px;">View Publication</a>
</p>
<p style="margin:18px 0 0;font-size:13px;color:#64748b;line-height:1.55;">— Caritas Rwanda<br/><a href="${escapeHtml(resolveSiteOrigin())}" style="color:#7A1515;font-weight:600;">${escapeHtml(resolveSiteOrigin())}</a></p>`;

  return sendMail({
    to: opts.to,
    subject: `Access Granted — ${opts.publicationTitle}`,
    html: emailShell(inner),
    text: stripHtmlToText(inner) +
      `\n\nPassword: ${opts.password}\n\nLink: ${opts.publicationUrl}\n`,
  });
}
