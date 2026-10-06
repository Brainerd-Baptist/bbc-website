import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import { buildContactNotificationHtml } from "@/lib/email-templates";

// Benevolence + pastoral care (hospital, funeral, wedding, crisis). Routes
// to a dedicated, private address rather than the general connect@ inbox —
// see claude/connect-page-redesign-idea-2026-09-21.md for why "care@" was
// chosen over "benevolence@"/"request-help@".
const TO = "care@brainerdbaptist.org";

export async function POST(req: NextRequest) {
  const { name, email, phone, category, message } = await req.json();

  if (!name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name and a short message are required." }, { status: 400 });
  }

  const meta = [
    phone?.trim() ? { label: "Phone", value: phone.trim() } : null,
    category ? { label: "Category", value: category } : null,
  ].filter((m): m is { label: string; value: string } => Boolean(m));

  const result = await sendMail({
    to: TO,
    subject: `Care request${category ? ` — ${category}` : ""}: ${name.trim()}`,
    replyTo: email?.trim() || undefined,
    text: [
      `From: ${name.trim()}${email?.trim() ? ` <${email.trim()}>` : ""}`,
      phone?.trim() ? `Phone: ${phone.trim()}` : null,
      category ? `Category: ${category}` : null,
      "",
      message.trim(),
    ]
      .filter(Boolean)
      .join("\n"),
    html: buildContactNotificationHtml({
      heading: `Care request${category ? ` — ${category}` : ""}`,
      fromName: name.trim(),
      fromEmail: email?.trim() || undefined,
      message: message.trim(),
      meta: meta.length > 0 ? meta : undefined,
    }),
  });

  return NextResponse.json({ ok: true, ...result });
}
