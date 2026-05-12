/**
 * Newsletter HTML shells — safe to import from client components (no nodemailer).
 */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailShell(innerHtml: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#18181b;line-height:1.65;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f5;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.08);border:1px solid rgba(122,21,21,0.08);">
      <tr><td style="height:4px;background:linear-gradient(90deg,#7A1515,#b42323);"></td></tr>
      <tr><td style="padding:28px 28px 8px;font-size:17px;font-weight:700;color:#0f172a;">Caritas Rwanda</td></tr>
      <tr><td style="padding:8px 28px 28px;font-size:15px;color:#334155;">
${innerHtml}
      </td></tr>
    </table>
    <p style="margin:16px 0 0;font-size:11px;color:#94a3b8;">You received this email from Caritas Rwanda.</p>
  </td></tr>
</table></body></html>`;
}

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<\/(p|div|br|li|h\d)\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function wrapBroadcastMessageHtml(opts: {
  innerHtml: string;
  unsubscribeUrl: string;
}): string {
  const inner = `
<div style="font-size:15px;color:#334155;line-height:1.65;">
${opts.innerHtml}
</div>
<hr style="margin:26px 0;border:none;border-top:1px solid #e4e4e7;" />
<p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.55;text-align:center;">
  Prefer fewer emails?
  <a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:#7A1515;font-weight:600;">Unsubscribe instantly</a>
</p>`;

  return emailShell(inner);
}
