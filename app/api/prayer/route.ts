/**
 * POST /api/prayer
 *
 * Accepts a prayer request from the /live page and records it in
 * Planning Center as a People Note on the submitter's profile.
 *
 * Flow:
 *   1. If email provided → search PCO for an existing person
 *   2. If not found (or no email) → create a new Person record
 *   3. Create a Note on that person with category "Prayer Request"
 *
 * Body: { name: string; request: string; email?: string; isPrivate?: boolean }
 */

import { NextRequest, NextResponse } from "next/server";

const PCO_BASE = "https://api.planningcenteronline.com";

function pcoAuth() {
  const appId  = process.env.PCO_APP_ID;
  const secret = process.env.PCO_SECRET;
  if (!appId || !secret) return null;
  return `Basic ${Buffer.from(`${appId}:${secret}`).toString("base64")}`;
}

async function pcoFetch(path: string, opts: RequestInit = {}) {
  const auth = pcoAuth();
  if (!auth) throw new Error("PCO credentials not configured");
  return fetch(`${PCO_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });
}

/** Find an existing PCO person by email. Returns person ID or null. */
async function findPersonByEmail(email: string): Promise<string | null> {
  try {
    const res = await pcoFetch(
      `/people/v2/people?where[search_name_or_email]=${encodeURIComponent(email)}&per_page=5`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    // Exact email match
    const match = json.data?.find((p: { attributes: { emails?: Array<{ address: string }> } }) =>
      p.attributes?.emails?.some((e: { address: string }) =>
        e.address.toLowerCase() === email.toLowerCase(),
      ),
    );
    return match?.id ?? json.data?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

/** Create a minimal PCO person with first/last name and optional email. */
async function createPerson(
  name: string,
  email?: string,
): Promise<string | null> {
  try {
    const parts     = name.trim().split(/\s+/);
    const firstName = parts[0] ?? name;
    const lastName  = parts.slice(1).join(" ") || "";

    const res = await pcoFetch("/people/v2/people", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "Person",
          attributes: { first_name: firstName, last_name: lastName },
        },
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const personId: string = json.data?.id;
    if (!personId) return null;

    // Attach email if provided
    if (email) {
      await pcoFetch(`/people/v2/people/${personId}/emails`, {
        method: "POST",
        body: JSON.stringify({
          data: {
            type: "Email",
            attributes: { address: email, location: "Home", primary: true },
          },
        }),
      });
    }

    return personId;
  } catch {
    return null;
  }
}

/** Get or create the "Prayer Request" note category. Returns category ID or null. */
async function getPrayerCategoryId(): Promise<string | null> {
  try {
    const res = await pcoFetch("/people/v2/note_categories?per_page=50");
    if (!res.ok) return null;
    const json = await res.json();
    const cat = json.data?.find(
      (c: { attributes: { name: string } }) =>
        c.attributes.name.toLowerCase().includes("prayer"),
    );
    if (cat) return cat.id as string;

    // Create one if it doesn't exist
    const createRes = await pcoFetch("/people/v2/note_categories", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "NoteCategory",
          attributes: { name: "Prayer Request" },
        },
      }),
    });
    if (!createRes.ok) return null;
    const newJson = await createRes.json();
    return newJson.data?.id ?? null;
  } catch {
    return null;
  }
}

/** Create a PCO note on a person. */
async function createNote(
  personId: string,
  noteText: string,
  categoryId: string | null,
): Promise<boolean> {
  try {
    const body: {
      data: {
        type: string;
        attributes: { note: string; note_category_id?: string };
        relationships?: { note_category: { data: { type: string; id: string } } };
      };
    } = {
      data: {
        type: "Note",
        attributes: { note: noteText },
      },
    };

    if (categoryId) {
      body.data.attributes.note_category_id = categoryId;
    }

    const res = await pcoFetch(`/people/v2/people/${personId}/notes`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { name?: string; request?: string; email?: string; isPrivate?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, request, email, isPrivate = false } = body;

  if (!name?.trim() || !request?.trim()) {
    return NextResponse.json(
      { error: "Name and request are required" },
      { status: 400 },
    );
  }

  if (!pcoAuth()) {
    // Graceful degradation — log and return success so the UI isn't blocked
    console.warn("[prayer] PCO credentials not configured — request not saved");
    return NextResponse.json({ ok: true, saved: false });
  }

  // 1. Find or create person
  let personId: string | null = null;
  if (email?.trim()) {
    personId = await findPersonByEmail(email.trim());
  }
  if (!personId) {
    personId = await createPerson(name.trim(), email?.trim());
  }

  if (!personId) {
    console.error("[prayer] Could not find or create PCO person");
    return NextResponse.json({ error: "Failed to record request" }, { status: 502 });
  }

  // 2. Get or create the prayer note category
  const categoryId = await getPrayerCategoryId();

  // 3. Build note text
  const now     = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  const privacy = isPrivate ? " [PRIVATE — prayer team only]" : "";
  const noteText = [
    `PRAYER REQUEST${privacy}`,
    `Submitted: ${now} ET via brainerdbaptist.org/live`,
    "",
    request.trim(),
  ].join("\n");

  // 4. Create the note
  const saved = await createNote(personId, noteText, categoryId);

  if (!saved) {
    console.error("[prayer] Failed to create PCO note for person", personId);
    return NextResponse.json({ error: "Failed to save request" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, saved: true });
}
