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
  childGender: "M" | "F";
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

  // Basic validation
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

  // Step 1: find or create the parent in PCO People
  let personId: string;
  try {
    personId = await findOrCreatePerson(
      auth,
      parentFirstName,
      parentLastName,
      parentEmail
    );
  } catch (err) {
    console.error("PCO person lookup/create failed:", err);
    return NextResponse.json(
      { error: "Failed to identify submitter in Planning Center" },
      { status: 502 }
    );
  }

  // Step 2: build field answers
  const answers: FieldAnswer[] = [];

  // Phone
  answers.push({
    fieldId: FIELD.phone,
    value: { number: phone, location: "Mobile" },
  });

  // Consent to text
  answers.push({
    fieldId: FIELD.consent,
    value: consentToText ? "true" : "false",
  });

  // Address
  answers.push({
    fieldId: FIELD.address,
    value: {
      location: "Home",
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
    },
  });

  // Child gender
  answers.push({ fieldId: FIELD.gender, value: childGender });

  // Child birthdate
  answers.push({ fieldId: FIELD.birthdate, value: childBirthdate });

  // Service selection (option ID)
  answers.push({ fieldId: FIELD.service, value: service });

  // Child name + optional parental rights notes
  const childLine = `Child: ${childFirstName} ${childLastName}`;
  const notesValue = parentalRightsNotes?.trim()
    ? `${childLine}\n${parentalRightsNotes.trim()}`
    : childLine;
  answers.push({ fieldId: FIELD.notes, value: notesValue });

  // Step 3: submit the form
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
