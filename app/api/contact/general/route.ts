import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import { sendContactConfirmation } from "@/lib/contact-mail";
import { buildContactNotificationHtml } from "@/lib/email-templates";

const TO = "connect@brainerdbaptist.org";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  const result = await sendMail({
    to: TO,
    subject: `Connect: ${name.trim()}`,
    replyTo: email.trim(),
    text: `From: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`,
    html: buildContactNotificationHtml({
      heading: "New message via Connect",
      fromName: name.trim(),
      fromEmail: email.trim(),
      message: message.trim(),
    }),
  });

  await sendContactConfirmation({
    to: email,
    name: name,
    teamLabel: "our Connect team",
    replyTo: TO,
  });

  return NextResponse.json({ ok: true, ...result });
}
