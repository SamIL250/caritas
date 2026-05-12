/**
 * Reusable transactional mail via SMTP (Nodemailer). Server-side only (Node runtime).
 *
 * ### Gmail (app passwords)
 * Enable 2FA, create an App Password, then e.g.:
 * - `SMTP_HOST=smtp.gmail.com`
 * - `SMTP_PORT=587`
 * - `SMTP_SECURE=false`
 * - `SMTP_USER=your.address@gmail.com`
 * - `SMTP_PASS` = 16-char app password (spaces optional; stripped automatically)
 * - `SMTP_FROM="Site Name <your.address@gmail.com>"` — shown “From”; falls back to `VOLUNTEER_EMAIL_FROM` or `SMTP_USER`
 *
 * ### Other SMTP
 * Same vars; adjust host/port/secure per provider.
 *
 * - Optional `SMTP_SERVICE=gmail` — same effect when host is Gmail (forces Nodemailer Gmail preset)
 */

import nodemailer from "nodemailer";

export type MailSendResult =
  | { ok: true }
  | { ok: false; error: string; skipped: boolean };

/** Failed branch of {@link MailSendResult} — use with {@link isMailFailure}. */
export type MailFailure = Extract<MailSendResult, { ok: false }>;

/** Narrow union after a failed send (works reliably vs `!result.ok` in TS 6). */
export function isMailFailure(result: MailSendResult): result is MailFailure {
  return result.ok === false;
}

export type SendMailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  /** Plain-text fallback for clients that ignore HTML */
  text?: string;
  /** Overrides default From (`SMTP_FROM` → `VOLUNTEER_EMAIL_FROM` → `SMTP_USER`) */
  from?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
};

/** Strip Gmail app-password spacing and accidental wrapping quotes from .env lines. */
function normalizeSmtpPassword(raw: string | undefined): string {
  if (raw === undefined) return "";
  let s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1);
  }
  return s.replace(/\s+/g, "").trim();
}

function normalizeEnvValue(raw: string | undefined): string {
  if (raw === undefined) return "";
  let s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

/** Default “From” for all sends unless overridden per message. */
export function resolveDefaultMailFrom(): string | undefined {
  const a = normalizeEnvValue(process.env.SMTP_FROM);
  const b = normalizeEnvValue(process.env.VOLUNTEER_EMAIL_FROM);
  const c = normalizeEnvValue(process.env.SMTP_USER);
  return a || b || c || undefined;
}

function buildTransport(): nodemailer.Transporter | null {
  const hostRaw = normalizeEnvValue(process.env.SMTP_HOST);
  if (!hostRaw) return null;

  const user = normalizeEnvValue(process.env.SMTP_USER);
  const pass = normalizeSmtpPassword(process.env.SMTP_PASS);

  const useGmailService =
    hostRaw.toLowerCase() === "smtp.gmail.com" ||
    normalizeEnvValue(process.env.SMTP_SERVICE).toLowerCase() === "gmail";

  /** Nodemailer's Gmail preset avoids some STARTTLS/host quirks vs manual host/port. */
  if (useGmailService && user.length > 0 && pass.length > 0) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  const portRaw = process.env.SMTP_PORT?.trim();
  const port = portRaw ? parseInt(portRaw, 10) : 587;
  if (!Number.isFinite(port) || port < 1 || port > 65535) return null;

  const secureRaw = process.env.SMTP_SECURE?.trim().toLowerCase();
  let secure = port === 465;
  if (secureRaw === "true" || secureRaw === "1") secure = true;
  if (secureRaw === "false" || secureRaw === "0") secure = false; 

  const auth =
    user.length > 0 ? { user, pass } : undefined;

  return nodemailer.createTransport({
    host: hostRaw,
    port,
    secure,
    auth,
    ...(process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "0"
      ? { tls: { rejectUnauthorized: false } }
      : {}),
  });
}

/** Recreate transport when any SMTP env changes (fixes stale auth after editing `.env.local`). */
function transportConfigFingerprint(): string {
  return [
    normalizeEnvValue(process.env.SMTP_HOST),
    process.env.SMTP_PORT ?? "",
    normalizeEnvValue(process.env.SMTP_USER),
    normalizeSmtpPassword(process.env.SMTP_PASS),
    process.env.SMTP_SECURE ?? "",
    normalizeEnvValue(process.env.SMTP_SERVICE),
  ].join("\u241e");
}

let cachedTransport: nodemailer.Transporter | null | undefined;
let cachedFingerprint: string | undefined;

export function getMailTransporter(): nodemailer.Transporter | null {
  const fp = transportConfigFingerprint();
  if (cachedTransport !== undefined && cachedFingerprint === fp) {
    return cachedTransport;
  }
  cachedFingerprint = fp;
  cachedTransport = buildTransport();
  return cachedTransport;
}

/**
 * Invalidate cached transporter (e.g. tests). Not used in production.
 */
export function resetMailTransporterCache(): void {
  cachedTransport = undefined;
  cachedFingerprint = undefined;
}

/**
 * Send one message. Returns `skipped` when SMTP_HOST is missing or no From address can be resolved.
 */
export async function sendMail(opts: SendMailOptions): Promise<MailSendResult> {
  const transport = getMailTransporter();
  const from = opts.from?.trim() || resolveDefaultMailFrom();

  if (!transport || !from) {
    console.warn(
      "[mail] Missing SMTP_HOST or a From address (set SMTP_FROM, or VOLUNTEER_EMAIL_FROM, or SMTP_USER).",
    );
    return { ok: false, skipped: true, error: "Email not configured." };
  }

  try {
    await transport.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo,
      cc: opts.cc,
      bcc: opts.bcc,
    });
    return { ok: true };
  } catch (e: unknown) {
    return {
      ok: false,
      skipped: false,
      error: e instanceof Error ? e.message : "SMTP send failed.",
    };
  }
}
