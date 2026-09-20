/**
 * PCO form submission helpers — server-side only.
 *
 * PCO requires a two-step process for anonymous form submissions:
 *  1. Find an existing person by email, or create a new one.
 *  2. POST the FormSubmission with the person's ID.
 *
 * FormFieldSubmission responses go in `attributes.responses`, NOT `meta`.
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
 * Build the `included` array of FormFieldSubmission objects for a PCO form
 * submission payload.
 *
 * Each answer becomes one FormFieldSubmission. For checkbox / multi-select
 * fields, pass one FieldAnswer per selected option.
 */
export function buildFieldSubmissions(answers: FieldAnswer[]): object[] {
  return answers.map((a, i) => ({
    type: "FormFieldSubmission",
    id: `ffs-${i}`,
    attributes: {
      responses: [{ value: a.value }],
    },
    relationships: {
      form_field: { data: { type: "FormField", id: a.fieldId } },
    },
  }));
}

/**
 * Submit a PCO form on behalf of a known person.
 *
 * @param auth   - Basic auth header value (from `pcoAuth()`)
 * @param formId - PCO form ID (numeric string)
 * @param personId - PCO person ID
 * @param answers  - Field answers built with `buildFieldSubmissions` helpers
 */
export async function submitForm(
  auth: string,
  formId: string,
  personId: string,
  answers: FieldAnswer[]
): Promise<void> {
  const payload = {
    data: {
      type: "FormSubmission",
      attributes: {},
      relationships: {
        person: { data: { type: "Person", id: personId } },
      },
    },
    included: buildFieldSubmissions(answers),
  };

  const res = await fetch(
    `${PCO_BASE}/people/v2/forms/${formId}/form_submissions`,
    {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      detail = await res.text();
    }
    throw new Error(`PCO form submission failed: ${res.status} ${detail}`);
  }
}
