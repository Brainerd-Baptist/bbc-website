/**
 * Temporary debug endpoint — returns the raw PCO response for diagnosis.
 * DELETE THIS FILE after the issue is resolved.
 */
import { NextRequest, NextResponse } from "next/server";
import { pcoAuth, findOrCreatePerson } from "@/lib/pco-forms";

const PCO_BASE = "https://api.planningcenteronline.com";

// GET: accessible from a plain browser visit
export async function GET() {
  return runDebug();
}

export async function POST(req: NextRequest) {
  void req;
  return runDebug();
}

async function runDebug() {
  const appId = process.env.PCO_APP_ID;
  const secret = process.env.PCO_SECRET;

  if (!appId || !secret) {
    return NextResponse.json({ error: "No PCO credentials" }, { status: 500 });
  }

  const auth = pcoAuth(appId, secret);

  // Ensure a test person exists
  let personId: string;
  try {
    personId = await findOrCreatePerson(auth, "Debug", "Test", "debug-test@brainerdbaptist.org");
  } catch (err) {
    return NextResponse.json({ step: "findOrCreatePerson", error: String(err) }, { status: 500 });
  }

  // Minimal payload matching exactly what the connect route sends
  const payload = {
    data: {
      type: "FormSubmission",
      attributes: {},
      relationships: {
        person: { data: { type: "Person", id: personId } },
      },
    },
    included: [
      {
        type: "FormSubmissionValue",
        attributes: { value: { number: "4235550100", location: "Mobile" } },
        relationships: {
          form_field: { data: { type: "FormField", id: "10599346" } },
          form_field_option: { data: null },
        },
      },
      {
        type: "FormSubmissionValue",
        attributes: { value: "11728683" },
        relationships: {
          form_field: { data: { type: "FormField", id: "10599355" } },
          form_field_option: { data: { type: "FormFieldOption", id: "11728683" } },
        },
      },
    ],
  };

  const res = await fetch(
    `${PCO_BASE}/people/v2/forms/1326026/form_submissions`,
    {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const body = await res.json().catch(() => null);

  return NextResponse.json({
    status: res.status,
    ok: res.ok,
    personId,
    sentPayload: payload,
    pcoResponse: body,
  });
}
