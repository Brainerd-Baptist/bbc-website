import { NextResponse } from "next/server";
import { pcoAuth, findOrCreatePerson } from "@/lib/pco-forms";

const PCO_BASE = "https://api.planningcenteronline.com";

// PCO form 376960 field IDs
const FIELD = {
  phone:     "2717360",
  consent:   "5876472",
  address:   "2716232",
  gender:    "2716233",
  birthdate: "2716237",
  service:   "2719110",
  notes:     "2750017",
} as const;

// Service option: BX 11:00
const TEST_SERVICE_OPTION = "2971214";

async function runDebug() {
  const appId = process.env.PCO_APP_ID;
  const secret = process.env.PCO_SECRET;
  if (!appId || !secret) return { error: "PCO credentials not configured" };

  const auth = pcoAuth(appId, secret);

  let personId: string;
  try {
    personId = await findOrCreatePerson(
      auth,
      "Debug",
      "Test",
      "debug-test@brainerdbaptist.org"
    );
  } catch (e) {
    return { error: `Person lookup failed: ${String(e)}` };
  }

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
        relationships: { form_field: { data: { type: "FormField", id: FIELD.phone } } },
        attributes: { value: { number: "5551234567", location: "Mobile" } },
      },
      {
        type: "FormSubmissionValue",
        relationships: { form_field: { data: { type: "FormField", id: FIELD.consent } } },
        attributes: { value: "true" },
      },
      {
        type: "FormSubmissionValue",
        relationships: { form_field: { data: { type: "FormField", id: FIELD.address } } },
        attributes: {
          value: { location: "Home", street: "123 Main St", city: "Chattanooga", state: "TN", zip: "37421", country_code: "US" },
        },
      },
      {
        type: "FormSubmissionValue",
        relationships: { form_field: { data: { type: "FormField", id: FIELD.gender } } },
        attributes: { value: "M" },
      },
      {
        type: "FormSubmissionValue",
        relationships: { form_field: { data: { type: "FormField", id: FIELD.birthdate } } },
        attributes: { value: "2020-06-15" },
      },
      {
        type: "FormSubmissionValue",
        relationships: { form_field: { data: { type: "FormField", id: FIELD.service } } },
        attributes: { value: TEST_SERVICE_OPTION },
      },
      {
        type: "FormSubmissionValue",
        relationships: { form_field: { data: { type: "FormField", id: FIELD.notes } } },
        attributes: { value: "Child: Debug Kid" },
      },
    ],
  };

  const res = await fetch(
    `${PCO_BASE}/people/v2/forms/376960/form_submissions`,
    {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  let responseBody: unknown;
  try { responseBody = await res.json(); } catch { responseBody = await res.text(); }

  return {
    status: res.status,
    ok: res.ok,
    personId,
    payload,
    response: responseBody,
  };
}

export async function GET() {
  const result = await runDebug();
  return NextResponse.json(result, { status: 200 });
}

export async function POST() {
  const result = await runDebug();
  return NextResponse.json(result, { status: 200 });
}
