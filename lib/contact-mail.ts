// lib/contact-mail.ts
//
// The "we got your message" receipt every contact route sends back to the
// person who submitted a form. Never throws and never blocks the response —
// the staff notification is the part that matters; a failed receipt (bad
// address, Resend hiccup) must not turn a successful submission into an
// error for the visitor.

import { sendMail } from "@/lib/mail";
import { buildContactConfirmationHtml } from "@/lib/email-templates";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendContactConfirmation({
  to,
  name,
  teamLabel,
  replyTo,
  careful,
}: {
  to?: string;
  name: string;
  /** Who got the message, in plain words — "our Kids Ministry team". */
  teamLabel: string;
  /** Where replies to the receipt should land (the team's own mailbox). */
  replyTo: string;
  careful?: boolean;
}): Promise<void> {
  const address = to?.trim();
  if (!address || !EMAIL_RE.test(address)) return;
  try {
    await sendMail({
      to: address,
      subject: "We got your message — Brainerd Baptist Church",
      text: `Hi ${name.trim().split(" ")[0] || name.trim()} — thanks for reaching out. Your message went to ${teamLabel}, and someone will reply by email soon.\n\nBrainerd Baptist Church\n300 Brookfield Ave, Chattanooga, TN 37411\nbrainerdbaptist.org`,
      html: buildContactConfirmationHtml({ name, teamLabel, careful }),
      replyTo,
    });
  } catch (err) {
    console.error("[contact-mail] confirmation failed:", err);
  }
}
