import { NextRequest, NextResponse } from "next/server";
import { registerNextStepInPco } from "@/lib/pco-next-step";
import { sendMail } from "@/lib/mail";
import { sendContactConfirmation } from "@/lib/contact-mail";
import { buildContactNotificationHtml } from "@/lib/email-templates";
import { NEXT_STEP_NOTIFY_EMAIL } from "@/lib/visit-form";

interface ConnectBody {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  howHeard: string[]; // array of option IDs (required, at least one)
  interests: string[]; // array of option IDs (optional)
  wantsMembership?: boolean;
  notes?: string;
}

export async function POST(req: NextRequest) {
  const appId = process.env.PCO_APP_ID;
  const secret = process.env.PCO_SECRET;

  let body: ConnectBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { firstName, lastName, email, phone, howHeard, interests, wantsMembership, notes } = body;

  if (!firstName?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "First name and email are required" }, { status: 400 });
  }
  if (!howHeard || howHeard.length === 0) {
    return NextResponse.json(
      { error: "Please select at least one option for how you heard about Brainerd" },
      { status: 400 },
    );
  }

  const name = `${firstName.trim()} ${(lastName ?? "").trim()}`.trim();

  let result;
  if (appId && secret) {
    result = await registerNextStepInPco(appId, secret, {
      firstName: firstName.trim(),
      lastName: (lastName ?? "").trim(),
      email: email.trim(),
      phone: phone?.trim() ?? "",
      interestIds: interests ?? [],
      wantsMembership: !!wantsMembership,
      howHeardIds: howHeard,
      notes: notes?.trim() ?? "",
    });
  }

  const interestText = result?.interestLabels.length
    ? result.interestLabels.join(", ")
    : "No specific interest checked";
  const pcoStatus = !result
    ? "Not connected"
    : result.errors.length
      ? `PARTIAL — check Planning Center: ${result.errors[0].slice(0, 120)}`
      : `Added (${result.cards.join("; ") || "person only"})`;

  // Staff heads-up. Goes to one address for now; split by interest later.
  const meta = [
    { label: "Interested in", value: interestText },
    { label: "Heard about us", value: result?.howHeard.join(", ") || "—" },
    { label: "Planning Center", value: pcoStatus },
    ...(phone?.trim() ? [{ label: "Phone", value: phone.trim() }] : []),
  ];
  const text = [
    `Next Step: ${name} <${email.trim()}>`,
    phone?.trim() ? `Phone: ${phone.trim()}` : null,
    `Interested in: ${interestText}`,
    `Heard about us: ${result?.howHeard.join(", ") || "—"}`,
    notes?.trim() ? `Note: ${notes.trim()}` : null,
    `Planning Center: ${pcoStatus}`,
    result?.errors.length ? `\nDetails:\n${result.errors.join("\n")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await sendMail({
      to: NEXT_STEP_NOTIFY_EMAIL,
      subject: `Next step: ${name} — ${interestText}`,
      replyTo: email.trim(),
      text,
      html: buildContactNotificationHtml({
        heading: "Next step request",
        fromName: name,
        fromEmail: email.trim(),
        message: notes?.trim() || `Interested in: ${interestText}`,
        meta,
      }),
    });
    await sendContactConfirmation({
      to: email.trim(),
      name,
      teamLabel: "our connect team",
      replyTo: NEXT_STEP_NOTIFY_EMAIL,
    });
  } catch (err) {
    console.error("next-step email failed:", err);
  }

  if (!result) {
    // No Planning Center credentials: staff still got the email, so don't fail the visitor.
    return NextResponse.json({ success: true });
  }
  if (!result.person) {
    console.error("next-step PCO failed:", result.errors);
    // Person never reached PCO, but the staff email has everything. Still a success for them.
  }
  return NextResponse.json({ success: true });
}
