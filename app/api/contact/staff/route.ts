import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import { SPEAKERS } from "@/lib/speakers";

export async function POST(req: NextRequest) {
  const { staffName, name, email, message } = await req.json();

  if (!staffName || !name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Staff member, name, email, and message are required." }, { status: 400 });
  }

  // Look up the recipient's email server-side from the known staff roster —
  // never trust a client-supplied email address here, or this endpoint
  // becomes an open relay to send mail anywhere.
  const info = SPEAKERS[staffName];
  if (!info?.email) {
    return NextResponse.json({ error: "Unknown staff member." }, { status: 400 });
  }

  const result = await sendMail({
    to: info.email,
    subject: `Message from ${name.trim()} via brainerdbaptist.org`,
    replyTo: email.trim(),
    text: `From: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`,
  });

  return NextResponse.json({ ok: true, ...result });
}
