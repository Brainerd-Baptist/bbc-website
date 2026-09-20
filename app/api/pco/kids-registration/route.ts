import { NextRequest, NextResponse } from "next/server";
import {
  pcoAuth,
  findOrCreatePerson,
  submitForm,
  type FieldAnswer,
} from "@/lib/pco-forms";

interface ChildInfo {
  firstName: string;
  lastName: string;
  gender: string; // PCO Gender resource ID (e.g. "6707858" = Male, "6707882" = Female)
  birthdate: string; // YYYY-MM-DD
}

interface RegistrationBody {
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  phone: string;
  children: ChildInfo[];
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
    children,
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
  if (!children || children.length === 0) {
    return NextResponse.json(
      { error: "At least one child is required" },
      { status: 400 }
    );
  }
  for (const child of children) {
    if (!child.firstName || !child.lastName || !child.gender || !child.birthdate) {
      return NextResponse.json(
        { error: "Each child requires a first name, last name, gender, and birthdate" },
        { status: 400 }
      );
    }
  }
  if (!service) {
    return NextResponse.json(
      { error: "Service selection is required" },
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

  // Submit one PCO form per child — shared parent fields on each
  const errors: string[] = [];
  for (const child of children) {
    const answers: FieldAnswer[] = [
      // Phone
      { kind: "phone", fieldId: FIELD.phone, number: phone, location: "Mobile" },

      // Consent to text
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

      // Child gender — PCO gender field expects "Male" or "Female"
      { kind: "text", fieldId: FIELD.gender, value: child.gender },

      // Child birthdate (YYYY-MM-DD)
      { kind: "text", fieldId: FIELD.birthdate, value: child.birthdate },

      // Service selection — workflow_dropdown option field
      { kind: "option", fieldId: FIELD.service, optionId: service },

      // Notes: child name + optional parental rights note
      {
        kind: "text",
        fieldId: FIELD.notes,
        value: parentalRightsNotes?.trim()
          ? `Child: ${child.firstName} ${child.lastName}\n${parentalRightsNotes.trim()}`
          : `Child: ${child.firstName} ${child.lastName}`,
      },
    ];

    try {
      await submitForm(auth, "376960", personId, answers);
    } catch (err) {
      console.error(`PCO submission failed for child ${child.firstName}:`, err);
      errors.push(`${child.firstName} ${child.lastName}`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: `Failed to submit to Planning Center for: ${errors.join(", ")}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
