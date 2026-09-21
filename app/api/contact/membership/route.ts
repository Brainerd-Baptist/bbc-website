import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

const TO = "membership@brainerdbaptist.org";

export async function POST(req: NextRequest) {
  const { name, email, phone, message } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const result = await sendMail({
    to: TO,
    subject: `Membership interest: ${name.trim()}`,
    replyTo: email.trim(),
    text: [
      `From: ${name.trim()} <${email.trim()}>`,
      phone?.trim() ? `Phone: ${phone.trim()}` : null,
      "",
      message?.trim() || "(No additional message — just interested in learning about membership.)",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return NextResponse.json({ ok: true, ...result });
}
