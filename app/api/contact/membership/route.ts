import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import { sendContactConfirmation } from "@/lib/contact-mail";
import { buildContactNotificationHtml } from "@/lib/email-templates";

const TO = "membership@brainerdbaptist.org";

export async function POST(req: NextRequest) {
  const { name, email, phone, message } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const finalMessage =
    message?.trim() || "(No additional message — just interested in learning about membership.)";

  const result = await sendMail({
    to: TO,
    subject: `Membership interest: ${name.trim()}`,
    replyTo: email.trim(),
    text: [
      `From: ${name.trim()} <${email.trim()}>`,
      phone?.trim() ? `Phone: ${phone.trim()}` : null,
      "",
      finalMessage,
    ]
      .filter(Boolean)
      .join("\n"),
    html: buildContactNotificationHtml({
      heading: "Membership interest",
      fromName: name.trim(),
      fromEmail: email.trim(),
      message: finalMessage,
      meta: phone?.trim() ? [{ label: "Phone", value: phone.trim() }] : undefined,
    }),
  });

  await sendContactConfirmation({
    to: email,
    name: name,
    teamLabel: "our membership team",
    replyTo: TO,
  });

  return NextResponse.json({ ok: true, ...result });
}
