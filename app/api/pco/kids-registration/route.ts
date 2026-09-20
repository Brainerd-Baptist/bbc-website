import { NextRequest, NextResponse } from "next/server";

// TODO: Validate exact payload format against PCO API docs once creds are live

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

  // Build included array of form field submissions
  const included: object[] = [
    {
      type: "Person",
      id: "person-1",
      attributes: {
        first_name: parentFirstName,
        last_name: parentLastName,
        email_addresses: [{ address: parentEmail, primary: true }],
      },
    },
    // Phone number (2717360)
    {
      type: "FormFieldSubmission",
      id: "ffs-phone",
      attributes: {},
      relationships: {
        form_field: { data: { type: "FormField", id: "2717360" } },
        form_field_option: { data: null },
      },
      meta: {
        responses: [{ value: { number: phone, location: "Mobile" } }],
      },
    },
    // Consent to Text (5876472)
    {
      type: "FormFieldSubmission",
      id: "ffs-consent",
      attributes: {},
      relationships: {
        form_field: { data: { type: "FormField", id: "5876472" } },
        form_field_option: { data: null },
      },
      meta: {
        responses: [{ value: consentToText ? "true" : "false" }],
      },
    },
    // Address (2716232)
    {
      type: "FormFieldSubmission",
      id: "ffs-address",
      attributes: {},
      relationships: {
        form_field: { data: { type: "FormField", id: "2716232" } },
        form_field_option: { data: null },
      },
      meta: {
        responses: [
          {
            value: {
              location: "Home",
              street: address.street,
              city: address.city,
              state: address.state,
              zip: address.zip,
            },
          },
        ],
      },
    },
    // Gender of child (2716233)
    {
      type: "FormFieldSubmission",
      id: "ffs-gender",
      attributes: {},
      relationships: {
        form_field: { data: { type: "FormField", id: "2716233" } },
        form_field_option: { data: null },
      },
      meta: {
        responses: [{ value: childGender }],
      },
    },
    // Birthdate of child (2716237)
    {
      type: "FormFieldSubmission",
      id: "ffs-birthdate",
      attributes: {},
      relationships: {
        form_field: { data: { type: "FormField", id: "2716237" } },
        form_field_option: { data: null },
      },
      meta: {
        responses: [{ value: childBirthdate }],
      },
    },
    // What Service (2719110) — value is the option ID
    {
      type: "FormFieldSubmission",
      id: "ffs-service",
      attributes: {},
      relationships: {
        form_field: { data: { type: "FormField", id: "2719110" } },
        form_field_option: { data: { type: "FormFieldOption", id: service } },
      },
      meta: {
        responses: [{ value: service }],
      },
    },
  ];

  // Child name fields — submitted as the form person's child info via notes or
  // as an additional name field. PCO forms don't natively support child names
  // as a separate person without a relationship; we include them in notes if
  // no dedicated field exists, or you can add a text field for child name.
  // For now we prepend child info to parental rights notes.
  const childInfo = `Child: ${childFirstName} ${childLastName}`;
  const notesValue = parentalRightsNotes
    ? `${childInfo}\n${parentalRightsNotes}`
    : childInfo;

  // Parental Rights/notes (2750017)
  included.push({
    type: "FormFieldSubmission",
    id: "ffs-notes",
    attributes: {},
    relationships: {
      form_field: { data: { type: "FormField", id: "2750017" } },
      form_field_option: { data: null },
    },
    meta: {
      responses: [{ value: notesValue }],
    },
  });

  const payload = {
    data: {
      type: "FormSubmission",
      attributes: {},
      relationships: {
        person: { data: { type: "Person", id: null } },
      },
    },
    included,
  };

  const credentials = Buffer.from(`${appId}:${secret}`).toString("base64");

  let pcoRes: Response;
  try {
    pcoRes = await fetch(
      "https://api.planningcenteronline.com/people/v2/forms/376960/form_submissions",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  } catch (err) {
    console.error("PCO fetch error:", err);
    return NextResponse.json(
      { error: "Failed to reach Planning Center" },
      { status: 502 }
    );
  }

  if (!pcoRes.ok) {
    let detail = "";
    try {
      const errBody = await pcoRes.json();
      detail = JSON.stringify(errBody);
    } catch {
      detail = await pcoRes.text();
    }
    console.error("PCO error response:", pcoRes.status, detail);
    return NextResponse.json(
      { error: `Planning Center returned ${pcoRes.status}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
