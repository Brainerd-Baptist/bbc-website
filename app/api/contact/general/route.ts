import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

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
  });

  return NextResponse.json({ ok: true, ...result });
}
