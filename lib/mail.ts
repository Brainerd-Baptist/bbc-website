// lib/mail.ts
//
// Shared outbound email helper for the Connect page routing (general,
// membership, care, staff, utility). Deliberately feature-detected on
// RESEND_API_KEY rather than required: Josiah asked to build the whole
// Connect flow now and wire up actual sending later, once brainerdbaptist.org
// is verified with Resend (SPF/DKIM). Until that env var exists, every
// submission is accepted and logged instead of sent — nothing 500s, nothing
// is silently lost, and no code changes are needed to go live later.
//
// To activate sending:
//   1. Verify brainerdbaptist.org as a sending domain in Resend
//   2. Set RESEND_API_KEY in Vercel env vars
//   3. Set MAIL_FROM (e.g. "Brainerd Baptist Church <connect@brainerdbaptist.org>")

import { Resend } from "resend";

export interface SendMailAttachment {
  filename: string;
  /** Raw file bytes. */
  content: Buffer;
}

export interface SendMailArgs {
  to: string;
  subject: string;
  text: string;
  /** Optional HTML body. Resend (like any mail client) renders whichever
   * part the recipient's client prefers, falling back to `text` for
   * clients that don't do HTML — pass both, never html-only. Without
   * this, every email sendMail() sent rendered as bare unstyled plain
   * text, which is why "My Notes" emails looked like a raw text dump
   * (reported 2026-10-04) rather than anything resembling the site. */
  html?: string;
  replyTo?: string;
  attachments?: SendMailAttachment[];
}

export interface SendMailResult {
  sent: boolean;
  /** Only present when sending was skipped (no RESEND_API_KEY configured). */
  queued?: boolean;
}

export async function sendMail({ to, subject, text, html, replyTo, attachments }: SendMailArgs): Promise<SendMailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "Brainerd Baptist Church <onboarding@resend.dev>";

  if (!apiKey) {
    // Not configured yet — accept the submission, log it so it's at least
    // visible in Vercel logs, and tell the caller it was queued rather
    // than sent, so the UI can be honest about that if it wants to be.
    console.log(`[mail:not-configured] would send to=${to} subject="${subject}" reply-to=${replyTo ?? "-"}\n${text}`);
    return { sent: false, queued: true };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
      ...(replyTo ? { replyTo } : {}),
      ...(attachments?.length
        ? { attachments: attachments.map((a) => ({ filename: a.filename, content: a.content })) }
        : {}),
    });
    if (error) {
      console.error("[mail:resend-error]", error);
      return { sent: false };
    }
    return { sent: true };
  } catch (err) {
    console.error("[mail:exception]", err);
    return { sent: false };
  }
}
