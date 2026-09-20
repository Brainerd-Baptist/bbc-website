import { NextRequest, NextResponse } from "next/server";
import {
  pcoAuth,
  findOrCreatePerson,
  submitForm,
  type FieldAnswer,
} from "@/lib/pco-forms";

interface RegistrationBody {
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  phone: string;
  childFirstName: string;
  childLastName: string;
  childGender: string;
  childBirthdate: string; // YYYY-MM-DD
  address: { street: string; city: string; state: string; zip: string };
  service: string; // option ID
  consentToText: boolean;
  parentalRightsNotes?: string;
}

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

export async function POST(req: NextRequest) {
  const appId = process.env.PCO_APP_ID;
  const secret = process.env.PCO_SECRET;

  if (!appId || !secret) {
    return NextResponse.json(
      { error: "PCO credentials not configured" },
      { status: 500 }
    );
  }

  let body: RegistrationBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    parentFirstName,
    parentLastName,
    parentEmail,
    phone,
    childFirstName,
    childLastName,
    childGender,
    childBirthdate,
    address,
    service,
    consentToText,
    parentalRightsNotes,
  } = body;

  if (!parentFirstName || !parentLastName || !parentEmail || !phone) {
    return NextResponse.json(
      { error: "Parent name, email, and phone are required" },
      { status: 400 }
    );
  }
  if (!childFirstName || !childLastName || !childBirthdate || !service) {
    return NextResponse.json(
      { error: "Child name, birthdate, and service are required" },
      { status: 400 }
    );
  }

  const auth = pcoAuth(appId, secret);

  let personId: string;
  try {
    personId = await findOrCreatePerson(auth, parentFirstName, parentLastName, parentEmail);
  } catch (err) {
    console.error("PCO person lookup/create failed:", err);
    return NextResponse.json(
      { error: "Failed to identify submitter in Planning Center" },
      { status: 502 }
    );
  }

  const answers: FieldAnswer[] = [
    // Phone — flat number/location attributes
    { kind: "phone", fieldId: FIELD.phone, number: phone, location: "Mobile" },

    // Consent to text — plain text boolean
    { kind: "text", fieldId: FIELD.consent, value: consentToText ? "true" : "false" },

    // Address
    {
      kind: "address",
      fieldId: FIELD.address,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      location: "Home",
    },

    // Child gender
    { kind: "text", fieldId: FIELD.gender, value: childGender },

    // Child birthdate (YYYY-MM-DD)
    { kind: "text", fieldId: FIELD.birthdate, value: childBirthdate },

    // Service selection — option field
    { kind: "option", fieldId: FIELD.service, optionId: service },

    // Notes: child name + optional parental rights note
    {
      kind: "text",
      fieldId: FIELD.notes,
      value: parentalRightsNotes?.trim()
        ? `Child: ${childFirstName} ${childLastName}\n${parentalRightsNotes.trim()}`
        : `Child: ${childFirstName} ${childLastName}`,
    },
  ];

  try {
    await submitForm(auth, "376960", personId, answers);
  } catch (err) {
    console.error("PCO form submission error:", err);
    return NextResponse.json(
      { error: "Failed to submit to Planning Center" },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
