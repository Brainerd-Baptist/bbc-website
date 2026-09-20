import { NextRequest, NextResponse } from "next/server";

interface ConnectBody {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  howHeard: string[]; // array of option IDs (required, at least one)
  interests: string[]; // array of option IDs (optional)
  notes?: string;
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

  let body: ConnectBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { firstName, lastName, email, phone, howHeard, interests, notes } = body;

  // Basic validation
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

  const included: object[] = [
    {
      type: "Person",
      id: "person-1",
      attributes: {
        first_name: firstName,
        last_name: lastName,
        email_addresses: [{ address: email, primary: true }],
      },
    },
    // Phone number (10599346)
    {
      type: "FormFieldSubmission",
      id: "ffs-phone",
      attributes: {},
      relationships: {
        form_field: { data: { type: "FormField", id: "10599346" } },
      },
      meta: {
        responses: [{ value: { number: phone, location: "Mobile" } }],
      },
    },
    // How did you hear about Brainerd? (10599355) — one entry per selected option ID
    {
      type: "FormFieldSubmission",
      id: "ffs-how-heard",
      attributes: {},
      relationships: {
        form_field: { data: { type: "FormField", id: "10599355" } },
      },
      meta: {
        responses: howHeard.map((id) => ({ value: id })),
      },
    },
  ];

  // I'm interested in… (10599352) — optional, only include if at least one selected
  if (interests && interests.length > 0) {
    included.push({
      type: "FormFieldSubmission",
      id: "ffs-interests",
      attributes: {},
      relationships: {
        form_field: { data: { type: "FormField", id: "10599352" } },
      },
      meta: {
        responses: interests.map((id) => ({ value: id })),
      },
    });
  }

  // Anything else? (10599358) — optional
  if (notes && notes.trim()) {
    included.push({
      type: "FormFieldSubmission",
      id: "ffs-notes",
      attributes: {},
      relationships: {
        form_field: { data: { type: "FormField", id: "10599358" } },
      },
      meta: {
        responses: [{ value: notes.trim() }],
      },
    });
  }

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
      "https://api.planningcenteronline.com/people/v2/forms/1326026/form_submissions",
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
