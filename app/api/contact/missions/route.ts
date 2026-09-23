import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

// Missions inquiries — short-term team interest, questions about ongoing
// partner support, or general contact with the missions office.
const TO = "missions@brainerdbaptist.org";

const INTEREST_LABELS: Record<string, string> = {
  "short-term": "Joining a short-term team",
  support: "Supporting the ongoing work",
  other: "Other / general question",
};

export async function POST(req: NextRequest) {
  const { name, email, interest, message } = await req.json();

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  const label = INTEREST_LABELS[interest] || "Other / general question";

  const result = await sendMail({
    to: TO,
    subject: `Missions Inquiry (${label}): ${name.trim()}`,
    replyTo: email.trim(),
    text: `Interest: ${label}\nFrom: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`,
  });

  return NextResponse.json({ ok: true, ...result });
}
