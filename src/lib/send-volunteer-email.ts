/**
 * Volunteer-specific HTML templates; delivery uses shared {@link sendMail} from `@/lib/mail`.
 */

import { sendMail, type MailSendResult } from "@/lib/mail";
import { resolveSiteOrigin } from "@/lib/site-origin";

export type VolunteerEmailResult = MailSendResult;

export async function sendVolunteerAcceptanceEmail(opts: {
  to: string;
  applicantName: string;
  roleLabel: string;
  campaignTitle: string | null;
  extraNote?: string;
}): Promise<VolunteerEmailResult> {
  const site = resolveSiteOrigin();
  const campaignBit = opts.campaignTitle
    ? `<p><strong>Campaign / programme:</strong> ${escapeHtml(opts.campaignTitle)}</p>`
    : "";
  const roleBit = opts.roleLabel.trim()
    ? `<p><strong>Your role:</strong> ${escapeHtml(opts.roleLabel.trim())}</p>`
    : "";
  const noteBit = opts.extraNote?.trim()
    ? `<p>${escapeHtml(opts.extraNote.trim()).replace(/\n/g, "<br/>")}</p>`
    : "";

  const html = `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.6;color:#1f2937;">
<p>Dear ${escapeHtml(opts.applicantName)},</p>
<p>Thank you for offering your time with Caritas Rwanda. We are pleased to confirm that your volunteer application has been <strong>accepted</strong>.</p>
${campaignBit}
${roleBit}
${noteBit}
<p>Our team will follow up with next steps (orientation, timing and logistics) using this email address.</p>
<p style="margin-top:2rem;font-size:0.9rem;color:#6b7280;">— Caritas Rwanda<br/><a href="${escapeHtml(site)}">${escapeHtml(site)}</a></p>
</body></html>`;

  return sendMail({
    to: opts.to,
    subject: "Your volunteer application — Caritas Rwanda",
    html,
  });
}

export async function sendVolunteerRejectionEmail(opts: {
  to: string;
  applicantName: string;
  reason?: string;
}): Promise<VolunteerEmailResult> {
  const reasonHtml = opts.reason?.trim()
    ? `<p>${escapeHtml(opts.reason.trim()).replace(/\n/g, "<br/>")}</p>`
    : `<p>Unfortunately we are unable to move forward with your application at this time.</p>`;

  const html = `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.6;color:#1f2937;">
<p>Dear ${escapeHtml(opts.applicantName)},</p>
<p>Thank you for your interest in volunteering with Caritas Rwanda.</p>
${reasonHtml}
<p>We encourage you to stay connected with our programmes — future opportunities may be a better fit.</p>
<p style="margin-top:2rem;font-size:0.9rem;color:#6b7280;">— Caritas Rwanda</p>
</body></html>`;

  return sendMail({
    to: opts.to,
    subject: "Update on your volunteer application — Caritas Rwanda",
    html,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
