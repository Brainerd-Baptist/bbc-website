/**
 * PCO form submission helpers — server-side only.
 *
 * PCO accepts FormSubmissionValue objects in the `included` array of a
 * FormSubmission POST. The correct type is "FormSubmissionValue" (NOT
 * "FormFieldSubmission"), and values use flat attributes — not a `responses`
 * array. Field type shapes:
 *
 *   phone:    { value, number, location }
 *   checkbox: { value: optionId }  + relationships.form_field_option
 *   text/etc: { value }
 *   address:  { value, street, city, state, zip, location }
 */

const PCO_BASE = "https://api.planningcenteronline.com";

export function pcoAuth(appId: string, secret: string) {
  return `Basic ${Buffer.from(`${appId}:${secret}`).toString("base64")}`;
}

// ── Person helpers ────────────────────────────────────────────────────────

async function findPersonByEmail(auth: string, email: string): Promise<string | null> {
  const res = await fetch(
    `${PCO_BASE}/people/v2/people?where[search_name_or_email]=${encodeURIComponent(email)}&per_page=5`,
    { headers: { Authorization: auth, "Content-Type": "application/json" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const people: Array<{ id: string }> = data.data ?? [];
  return people.length > 0 ? people[0].id : null;
}

async function createPerson(auth: string, firstName: string, lastName: string, email: string): Promise<string> {
  const res = await fetch(`${PCO_BASE}/people/v2/people`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      data: { type: "Person", attributes: { first_name: firstName, last_name: lastName } },
    }),
  });
  if (!res.ok) throw new Error(`PCO create person: ${res.status} ${await res.text()}`);
  const personId: string = (await res.json()).data.id;

  // Add email
  await fetch(`${PCO_BASE}/people/v2/people/${personId}/emails`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      data: { type: "Email", attributes: { address: email, location: "Home", primary: true } },
    }),
  });

  return personId;
}

export async function findOrCreatePerson(
  auth: string, firstName: string, lastName: string, email: string
): Promise<string> {
  return (await findPersonByEmail(auth, email)) ?? (await createPerson(auth, firstName, lastName, email));
}

// ── Field answer types ────────────────────────────────────────────────────

/** Plain text / date / boolean field. */
export type TextAnswer   = { kind: "text";     fieldId: string; value: string };
/** Phone number field. */
export type PhoneAnswer  = { kind: "phone";    fieldId: string; number: string; location?: string };
/** Address field. */
export type AddressAnswer= { kind: "address";  fieldId: string; street: string; city: string; state: string; zip: string; location?: string };
/** Checkbox / dropdown field — one answer per selected option. */
export type OptionAnswer = { kind: "option";   fieldId: string; optionId: string };

export type FieldAnswer = TextAnswer | PhoneAnswer | AddressAnswer | OptionAnswer;

/** Build a FormSubmissionValue `included` entry for a given answer. */
function toFormSubmissionValue(a: FieldAnswer): object {
  const base = {
    type: "FormSubmissionValue",
    relationships: {
      form_field: { data: { type: "FormField", id: a.fieldId } },
      form_field_option: { data: null as { type: string; id: string } | null },
    },
  };

  switch (a.kind) {
    case "phone":
      return { ...base, attributes: { value: a.number, number: a.number, location: a.location ?? "Mobile" } };

    case "address":
      return {
        ...base,
        attributes: {
          value: `${a.street}, ${a.city}, ${a.state} ${a.zip}`,
          street: a.street, city: a.city, state: a.state, zip: a.zip,
          location: a.location ?? "Home",
        },
      };

    case "option":
      return {
        ...base,
        attributes: { value: a.optionId },
        relationships: {
          form_field: { data: { type: "FormField", id: a.fieldId } },
          form_field_option: { data: { type: "FormFieldOption", id: a.optionId } },
        },
      };

    case "text":
    default:
      return { ...base, attributes: { value: a.value } };
  }
}

// ── Form submission ───────────────────────────────────────────────────────

/**
 * Submit a PCO form on behalf of a known person.
 * Field values are passed as FormSubmissionValue objects in the `included`
 * array of the initial FormSubmission POST.
 */
export async function submitForm(
  auth: string,
  formId: string,
  personId: string,
  answers: FieldAnswer[]
): Promise<void> {
  const headers = { Authorization: auth, "Content-Type": "application/json" };

  const payload = {
    data: {
      type: "FormSubmission",
      attributes: {},
      relationships: {
        person: { data: { type: "Person", id: personId } },
      },
    },
    included: answers.map(toFormSubmissionValue),
  };

  const res = await fetch(
    `${PCO_BASE}/people/v2/forms/${formId}/form_submissions`,
    { method: "POST", headers, body: JSON.stringify(payload) }
  );

  if (!res.ok) {
    let detail = "";
    try { detail = JSON.stringify(await res.json()); } catch { detail = await res.text(); }
    throw new Error(`PCO form submission failed: ${res.status} ${detail}`);
  }
}
