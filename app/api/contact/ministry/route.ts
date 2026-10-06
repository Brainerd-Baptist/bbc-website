import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import { sendContactConfirmation } from "@/lib/contact-mail";
import { buildContactNotificationHtml } from "@/lib/email-templates";

// The quick "send this ministry a message" box on each ministry page. The
// destination is looked up here by key — never accepted from the client —
// so this can't be used as an open relay (same rule as /api/contact/staff).
// Visitors never see these mailbox addresses; they're only ever in this file.
const MINISTRIES: Record<string, { label: string; team: string; to: string }> = {
  kids: { label: "Kids Ministry", team: "our Kids Ministry team", to: "kids@brainerdbaptist.org" },
  students: { label: "Student Ministry", team: "our Student Ministry team", to: "students@brainerdbaptist.org" },
  college: { label: "College & Young Adults", team: "our College & Young Adults team", to: "college@brainerdbaptist.org" },
  wednesday: { label: "Wednesday Night", team: "our Wednesday Night team", to: "connect@brainerdbaptist.org" },
  bx: { label: "The BX", team: "the BX team", to: "jbobbitt@brainerdbaptist.org" },
};

export async function POST(req: NextRequest) {
  const { ministry, name, email, message } = await req.json();

  const m = typeof ministry === "string" ? MINISTRIES[ministry] : undefined;
  if (!m) {
    return NextResponse.json({ error: "Unknown ministry." }, { status: 400 });
  }
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  const result = await sendMail({
    to: m.to,
    subject: `${m.label}: message from ${name.trim()}`,
    replyTo: email.trim(),
    text: `${m.label} — quick message from the website\nFrom: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`,
    html: buildContactNotificationHtml({
      heading: `${m.label} — new message`,
      fromName: name.trim(),
      fromEmail: email.trim(),
      message: message.trim(),
    }),
  });

  await sendContactConfirmation({ to: email, name, teamLabel: m.team, replyTo: m.to });

  return NextResponse.json({ ok: true, ...result });
}
