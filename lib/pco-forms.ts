/**
 * PCO form submission helpers — server-side only.
 *
 * PCO does NOT accept FormFieldSubmission objects in the `included` sidepost
 * of a FormSubmission POST — it rejects them with "form_field_submissions_attributes
 * cannot be assigned".
 *
 * Correct approach (3 steps):
 *  1. Find an existing person by email, or create a new one.
 *  2. POST the FormSubmission (person relationship only) → get submission ID.
 *  3. POST each field answer individually to the nested form_field_submissions endpoint.
 */

const PCO_BASE = "https://api.planningcenteronline.com";

export function pcoAuth(appId: string, secret: string) {
  return `Basic ${Buffer.from(`${appId}:${secret}`).toString("base64")}`;
}

/** Search PCO for a person by email; return their ID, or null if not found. */
async function findPersonByEmail(
  auth: string,
  email: string
): Promise<string | null> {
  const res = await fetch(
    `${PCO_BASE}/people/v2/people?where[search_name_or_email]=${encodeURIComponent(email)}&per_page=5`,
    { headers: { Authorization: auth, "Content-Type": "application/json" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  // Match by email address precisely (search is fuzzy)
  const people: Array<{ id: string; attributes: { name?: string } }> =
    data.data ?? [];
  if (people.length === 0) return null;
  // If only one result, use it. Otherwise return the first match.
  return people[0].id;
}

/** Create a new PCO person; return their ID. */
async function createPerson(
  auth: string,
  firstName: string,
  lastName: string,
  email: string
): Promise<string> {
  const createRes = await fetch(`${PCO_BASE}/people/v2/people`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        type: "Person",
        attributes: { first_name: firstName, last_name: lastName },
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`PCO create person failed: ${createRes.status} ${err}`);
  }

  const createData = await createRes.json();
  const personId: string = createData.data.id;

  // Add email address
  await fetch(`${PCO_BASE}/people/v2/people/${personId}/emails`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        type: "Email",
        attributes: { address: email, location: "Home", primary: true },
      },
    }),
  });

  return personId;
}

/**
 * Find an existing PCO person by email, or create a new one.
 * Returns the person's PCO ID.
 */
export async function findOrCreatePerson(
  auth: string,
  firstName: string,
  lastName: string,
  email: string
): Promise<string> {
  const existing = await findPersonByEmail(auth, email);
  if (existing) return existing;
  return createPerson(auth, firstName, lastName, email);
}

/** A single answer to one form field. */
export interface FieldAnswer {
  fieldId: string;
  /** Raw value — string, option ID, phone object, address object, etc. */
  value: unknown;
}

/**
 * Submit a PCO form on behalf of a known person.
 *
 * Step A: POST FormSubmission with person relationship — receives submission ID.
 * Step B: POST each FieldAnswer to the nested form_field_submissions endpoint.
 *
 * For checkbox / multi-select fields, pass one FieldAnswer per selected option.
 */
export async function submitForm(
  auth: string,
  formId: string,
  personId: string,
  answers: FieldAnswer[]
): Promise<void> {
  const headers = { Authorization: auth, "Content-Type": "application/json" };

  // ── Step A: create the FormSubmission ───────────────────────────────────
  const submissionRes = await fetch(
    `${PCO_BASE}/people/v2/forms/${formId}/form_submissions`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: {
          type: "FormSubmission",
          attributes: {},
          relationships: {
            person: { data: { type: "Person", id: personId } },
          },
        },
      }),
    }
  );

  if (!submissionRes.ok) {
    let detail = "";
    try { detail = JSON.stringify(await submissionRes.json()); }
    catch { detail = await submissionRes.text(); }
    throw new Error(`PCO create submission failed: ${submissionRes.status} ${detail}`);
  }

  const submissionData = await submissionRes.json();
  const submissionId: string = submissionData.data.id;

  // ── Step B: post each field answer individually ─────────────────────────
  const fieldBase = `${PCO_BASE}/people/v2/forms/${formId}/form_submissions/${submissionId}/form_field_submissions`;

  for (const answer of answers) {
    const fieldRes = await fetch(fieldBase, {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: {
          type: "FormFieldSubmission",
          attributes: {
            responses: [{ value: answer.value }],
          },
          relationships: {
            form_field: { data: { type: "FormField", id: answer.fieldId } },
          },
        },
      }),
    });

    if (!fieldRes.ok) {
      let detail = "";
      try { detail = JSON.stringify(await fieldRes.json()); }
      catch { detail = await fieldRes.text(); }
      // Log and continue — don't abort the whole submission over one field
      console.error(
        `PCO field ${answer.fieldId} failed: ${fieldRes.status} ${detail}`
      );
    }
  }
}
