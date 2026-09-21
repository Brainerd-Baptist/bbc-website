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

export interface SendMailArgs {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export interface SendMailResult {
  sent: boolean;
  /** Only present when sending was skipped (no RESEND_API_KEY configured). */
  queued?: boolean;
}

export async function sendMail({ to, subject, text, replyTo }: SendMailArgs): Promise<SendMailResult> {
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
      ...(replyTo ? { replyTo } : {}),
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
