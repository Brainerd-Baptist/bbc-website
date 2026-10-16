import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import {
  buildVisitConfirmationHtml,
  buildContactNotificationHtml,
} from "@/lib/email-templates";
import { registerVisitInPco, type VisitPcoResult } from "@/lib/pco-visit";
import {
  VISIT_NOTIFY_EMAIL,
  VISIT_KIDS_EMAIL,
  KIDS_PREREG_URL,
} from "@/lib/visit-form";

const MAP_URL = `${(process.env.NEXT_PUBLIC_SITE_URL || "https://home.brainerdhq.app").replace(/\/$/, "")}/map`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Body {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateLabel?: string;
  service?: string; // "830" | "1100" | "unsure"
  outOfTown?: boolean;
  bringingKids?: boolean;
  kids?: {
    firstName?: string;
    lastName?: string;
    birthday?: string;
    grade?: string;
  }[];
  notes?: string;
  website?: string; // honeypot
}

const SERVICE_TEXT: Record<string, string> = {
  "830": "8:30 AM (Choir & Orchestra)",
  "1100": "11:00 AM (Band-Led)",
  unsure: "Not sure yet",
};

const clip = (s: unknown, n: number) =>
  String(s ?? "")
    .trim()
    .slice(0, n);

export async function POST(req: NextRequest) {
  let b: Body;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden field. Pretend success, do nothing.
  if (b.website) return NextResponse.json({ ok: true });

  const firstName = clip(b.firstName, 80);
  const lastName = clip(b.lastName, 80);
  const email = clip(b.email, 200);
  const phone = clip(b.phone, 40);
  const dateLabel = clip(b.dateLabel, 60);
  const service =
    clip(b.service, 10) in SERVICE_TEXT ? clip(b.service, 10) : "unsure";
  const bringingKids = Boolean(b.bringingKids);
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const kids = (Array.isArray(b.kids) ? b.kids : []).slice(0, 8).map((k) => ({
    firstName: clip(k.firstName, 60),
    lastName: clip(k.lastName, 60),
    birthday: clip(k.birthday, 10),
    grade: clip(k.grade, 30),
  }));
  const kidLine = (k: (typeof kids)[number]) =>
    `${k.firstName} ${k.lastName} | born ${k.birthday}${k.grade ? ` | ${k.grade}` : ""}`;
  const kidsInfo = kids.map(kidLine).join("\n");
  const notes = clip(b.notes, 1000);
  const outOfTown = Boolean(b.outOfTown);

  if (!firstName || !EMAIL_RE.test(email) || !phone || !dateLabel) {
    return NextResponse.json(
      {
        error:
          "Please add your name, email, mobile number, and the day you plan to visit.",
      },
      { status: 400 },
    );
  }

  if (
    bringingKids &&
    (kids.length === 0 ||
      kids.some(
        (k) => !k.firstName || !k.lastName || !DATE_RE.test(k.birthday),
      ))
  ) {
    return NextResponse.json(
      {
        error:
          "Please add a first name, last name, and birthday for each child.",
      },
      { status: 400 },
    );
  }

  const fullName = `${firstName} ${lastName}`.trim();

  // 1) Planning Center People — never blocks the emails below.
  let pco: VisitPcoResult | null = null;
  const appId = process.env.PCO_APP_ID;
  const secret = process.env.PCO_SECRET;
  if (appId && secret) {
    try {
      pco = await registerVisitInPco(appId, secret, {
        firstName,
        lastName,
        email,
        phone,
        bringingKids,
        kids,
        summary:
          `Plan a Visit (website): ${dateLabel}, ${SERVICE_TEXT[service]}. ` +
          `Out of town: ${outOfTown ? "yes" : "no"}.` +
          (notes ? ` Notes: ${notes}` : ""),
      });
      if (pco.errors.length)
        console.error("[visit/plan] PCO partial failure:", pco.errors);
    } catch (err) {
      console.error("[visit/plan] PCO registration crashed:", err);
    }
  }
  const pcoStatus = !pco
    ? "Not connected — add manually"
    : pco.errors.length === 0
      ? `Added (${pco.steps.join(", ")})`
      : `PARTIAL — ${pco.steps.join(", ") || "nothing"} added; check: ${pco.errors.map((e) => e.split(":")[0]).join(", ")}`;

  // 2) Heads-up to guest services (also the safety net if PCO is off or fails).
  const lines = [
    `New "Plan a Visit" submission`,
    ``,
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Mobile: ${phone}`,
    `Planning to visit: ${dateLabel}`,
    `Service: ${SERVICE_TEXT[service]}`,
    `Visiting from out of town: ${outOfTown ? "Yes" : "No"}`,
    `Bringing kids: ${bringingKids ? "Yes" : "No"}`,
    ...(bringingKids
      ? [`Kids (${kids.length}):`, ...kids.map((k) => `  - ${kidLine(k)}`)]
      : []),
    ...(notes ? [`Notes: ${notes}`] : []),
    ``,
    `Planning Center: ${pcoStatus}`,
    ...(pco?.errors.length
      ? [``, `Details:`, ...pco.errors.map((e) => `  - ${e}`)]
      : []),
  ];
  const recipients = Array.from(
    new Set([VISIT_NOTIFY_EMAIL, ...(bringingKids ? [VISIT_KIDS_EMAIL] : [])]),
  );
  for (const to of recipients) {
    await sendMail({
      to,
      replyTo: email,
      subject: `Visitor coming ${dateLabel}: ${fullName}${bringingKids ? " (with kids)" : ""}`,
      text: lines.join("\n"),
      html: buildContactNotificationHtml({
        heading: `Visitor coming ${dateLabel}`,
        fromName: fullName,
        fromEmail: email,
        meta: [
          { label: "Mobile", value: phone },
          { label: "Service", value: SERVICE_TEXT[service] },
          { label: "Out of town", value: outOfTown ? "Yes" : "No" },
          {
            label: "Kids",
            value: bringingKids ? `Yes (${kids.length})` : "No",
          },
          {
            label: "Planning Center",
            value: pcoStatus,
          },
        ],
        message:
          [
            bringingKids ? kids.map(kidLine).join("\n") : "",
            notes ? `Notes: ${notes}` : "",
          ]
            .filter(Boolean)
            .join("\n\n") || "(No kids or notes.)",
      }),
    }).catch((e) => console.error("[visit/plan] notify failed:", e));
  }

  // 3) Confirmation to the guest (best effort).
  const svc =
    service === "unsure" ? "" : ` at ${SERVICE_TEXT[service].split(" (")[0]}`;
  const kidsRegistered = Boolean(pco?.kidsRegistered);
  const kidsText = bringingKids
    ? `\n\nBringing kids? Plan to arrive 15–20 minutes early and use the Albemarle Ave entrance (Purple Lot). ` +
      (kidsRegistered
        ? "Your kids are already pre-registered, so check-in will be quick."
        : `To skip the line at check-in, pre-register your family: ${KIDS_PREREG_URL}`)
    : "";
  const text =
    `Hi ${firstName} — we're glad you're coming${dateLabel ? ` on ${dateLabel}` : ""}${svc}!\n\n` +
    `A few things that might help:\n` +
    `• Address: 300 Brookfield Ave, Chattanooga, TN 37411. Park in the Red lot on Brookfield Ave (across from the front doors) — volunteers will help.\n` +
    `• Services run about 60 minutes. Arriving 10–15 minutes early is plenty.\n` +
    `• Wear whatever you're comfortable in. Come as you are.\n` +
    `• Our Welcome Team is at the front doors, with a Guest Services desk just inside.` +
    kidsText +
    `\n\nCampus map (lots, doors, walking directions): ${MAP_URL}\n\nIf you have any questions before Sunday, just reply to this email.\n\nBrainerd Baptist Church\nbrainerdbaptist.org`;
  await sendMail({
    to: email,
    replyTo: VISIT_NOTIFY_EMAIL,
    subject: "We can't wait to meet you — Brainerd Baptist Church",
    text,
    html: buildVisitConfirmationHtml({
      firstName,
      dateLabel,
      serviceLabel:
        service === "unsure" ? "" : SERVICE_TEXT[service].split(" (")[0],
      bringingKids,
      kidsPreRegUrl: KIDS_PREREG_URL,
      kidsRegistered,
    }),
  }).catch((e) => console.error("[visit/plan] confirmation failed:", e));

  return NextResponse.json({
    ok: true,
    bringingKids,
    kidsRegistered: Boolean(pco?.kidsRegistered),
  });
}
