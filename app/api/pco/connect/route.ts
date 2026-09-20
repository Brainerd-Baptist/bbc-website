import { NextRequest, NextResponse } from "next/server";
import {
  pcoAuth,
  findOrCreatePerson,
  submitForm,
  type FieldAnswer,
} from "@/lib/pco-forms";

interface ConnectBody {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  howHeard: string[]; // array of option IDs (required, at least one)
  interests: string[]; // array of option IDs (optional)
  notes?: string;
}

// PCO form 1326026 field IDs
const FIELD = {
  phone:     "10599346",
  howHeard:  "10599355",
  interests: "10599352",
  notes:     "10599358",
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

  let body: ConnectBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { firstName, lastName, email, phone, howHeard, interests, notes } = body;

  if (!firstName || !lastName || !email || !phone) {
    return NextResponse.json(
      { error: "First name, last name, email, and phone are required" },
      { status: 400 }
    );
  }

  if (!howHeard || howHeard.length === 0) {
    return NextResponse.json(
      { error: "Please select at least one option for how you heard about Brainerd" },
      { status: 400 }
    );
  }

  const auth = pcoAuth(appId, secret);

  let personId: string;
  try {
    personId = await findOrCreatePerson(auth, firstName, lastName, email);
  } catch (err) {
    console.error("PCO person lookup/create failed:", err);
    return NextResponse.json(
      { error: "Failed to identify submitter in Planning Center" },
      { status: 502 }
    );
  }

  const answers: FieldAnswer[] = [];

  // Phone — use phone kind for flat number/location attributes
  answers.push({ kind: "phone", fieldId: FIELD.phone, number: phone, location: "Mobile" });

  // How heard — one option entry per selected checkbox
  for (const optionId of howHeard) {
    answers.push({ kind: "option", fieldId: FIELD.howHeard, optionId });
  }

  // Interests — one option entry per selected checkbox
  if (interests && interests.length > 0) {
    for (const optionId of interests) {
      answers.push({ kind: "option", fieldId: FIELD.interests, optionId });
    }
  }

  // Notes (optional free text)
  if (notes && notes.trim()) {
    answers.push({ kind: "text", fieldId: FIELD.notes, value: notes.trim() });
  }

  try {
    await submitForm(auth, "1326026", personId, answers);
  } catch (err) {
    console.error("PCO form submission error:", err);
    return NextResponse.json(
      { error: "Failed to submit to Planning Center" },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
