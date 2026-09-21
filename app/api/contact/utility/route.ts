import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

// Catch-all for the small "utility" links on /connect that don't warrant
// their own top-level tile: website issues, building/event space use.
const TO = "connect@brainerdbaptist.org";

const CATEGORY_LABELS: Record<string, string> = {
  "website-issue": "Website issue",
  "building-use": "Building / event space use",
  other: "Other",
};

export async function POST(req: NextRequest) {
  const { category, name, email, message } = await req.json();

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  const label = CATEGORY_LABELS[category] || "Other";

  const result = await sendMail({
    to: TO,
    subject: `${label}: ${name.trim()}`,
    replyTo: email.trim(),
    text: `Category: ${label}\nFrom: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`,
  });

  return NextResponse.json({ ok: true, ...result });
}
