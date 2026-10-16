/**
 * "Plan a Visit" -> Planning Center People (server-side only).
 *
 * Instead of a PCO form submission (forms can't be created through the API, and
 * a submission still needs someone to process it), we write real records:
 *
 *   1. the adult  — found by email, or created; mobile number added (Check-Ins
 *                   searches by phone, so this is what makes kids easy to find)
 *   2. each child — found by name + birthday, or created (child, birthday, grade)
 *   3. household  — kids are placed in the adult's household (created if needed)
 *   4. workflow   — a card on the adult: bringing kids -> BrainerdKids Visitor,
 *                   no kids -> First Time Guests. Visit details go in a card note.
 *
 * Every step is best-effort and reported, so one failure never loses the rest
 * and the notification email can say exactly what landed in PCO.
 */
import { pcoAuth } from "@/lib/pco-forms";
import { VISIT_WORKFLOWS } from "@/lib/visit-form";

const BASE = "https://api.planningcenteronline.com/people/v2";

export interface VisitKid {
  firstName: string;
  lastName: string;
  birthday: string; // YYYY-MM-DD
  grade: string; // label from the form, may be ""
  gender: string; // "Male" | "Female"
  allergies: string; // free text, "None" when none
}

export interface VisitPcoInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bringingKids: boolean;
  kids: VisitKid[];
  /** One-line visit summary for the workflow card note. */
  summary: string;
}

export interface VisitPcoResult {
  parent: boolean;
  /** Every child is a PCO person (found or created). */
  kidsRegistered: boolean;
  /** Kids share a household with the adult. */
  householdLinked: boolean;
  workflow: boolean;
  steps: string[];
  errors: string[];
}

type Call = { ok: boolean; status: number; json: any; text: string };

async function call(auth: string, method: string, path: string, body?: unknown): Promise<Call> {
  // PCO allows 100 requests / 20 s per org. On a 429, wait out the window (Retry-After) and retry.
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 429 && attempt < 3) {
      const wait = Math.min(Math.max(Number(res.headers.get("retry-after")) || 4, 1), 12);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      /* non-JSON error body */
    }
    return { ok: res.ok, status: res.status, json, text };
  }
}

async function findOrCreateAdult(
  auth: string,
  first: string,
  last: string,
  email: string,
): Promise<string> {
  const found = await call(
    auth,
    "GET",
    `/people?where[search_name_or_email]=${encodeURIComponent(email)}&per_page=1`,
  );
  const existing = found.json?.data?.[0]?.id;
  if (existing) return String(existing);

  const r = await call(auth, "POST", "/people", {
    data: { type: "Person", attributes: { first_name: first, last_name: last } },
  });
  if (!r.ok) throw new Error(fail("create person", r));
  const id = String(r.json.data.id);
  const e = await call(auth, "POST", `/people/${id}/emails`, {
    data: { type: "Email", attributes: { address: email, location: "Home", primary: true } },
  });
  if (!e.ok) throw new Error(fail("add email", e));
  return id;
}

function fail(what: string, r: Call) {
  return `${what}: ${r.status} ${r.text.slice(0, 300)}`;
}

/** Form label -> PCO grade integer (-1 = Pre-K, 0 = K, 1-12). undefined = leave blank. */
export function gradeToPco(label: string): number | undefined {
  const l = label.toLowerCase();
  if (!l || l.startsWith("not in school")) return undefined;
  if (l.startsWith("pre")) return -1;
  if (l.startsWith("kinder")) return 0;
  const n = parseInt(l, 10);
  return Number.isFinite(n) && n >= 1 && n <= 12 ? n : undefined;
}

async function ensurePhone(auth: string, personId: string, phone: string, errors: string[]) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return;
  const list = await call(auth, "GET", `/people/${personId}/phone_numbers?per_page=25`);
  const have: string[] = (list.json?.data ?? []).map((p: any) =>
    String(p.attributes?.number ?? "").replace(/\D/g, ""),
  );
  if (have.some((h) => h.endsWith(digits.slice(-10)))) return;
  const r = await call(auth, "POST", `/people/${personId}/phone_numbers`, {
    data: { type: "PhoneNumber", attributes: { number: phone, location: "Mobile", primary: have.length === 0 } },
  });
  if (!r.ok) errors.push(fail("phone", r));
}

async function findOrCreateChild(auth: string, k: VisitKid, errors: string[]): Promise<string | null> {
  const q =
    `where[first_name]=${encodeURIComponent(k.firstName)}` +
    `&where[last_name]=${encodeURIComponent(k.lastName)}` +
    `&where[birthdate]=${encodeURIComponent(k.birthday)}&per_page=1`;
  const found = await call(auth, "GET", `/people?${q}`);
  const existing = found.json?.data?.[0]?.id;
  if (existing) return String(existing);

  const grade = gradeToPco(k.grade);
  const allergies = k.allergies.trim();
  const hasMedical = allergies !== "" && !/^(none|no|n\/a|na|nope|nothing)\.?$/i.test(allergies);
  const base: Record<string, unknown> = {
    first_name: k.firstName,
    last_name: k.lastName,
    birthdate: k.birthday,
    child: true,
  };
  if (grade !== undefined) base.grade = grade;
  // Check-Ins shows medical_notes on the child's label. Only set it when there is something to say.
  if (hasMedical) base.medical_notes = `Allergies/medical: ${allergies}`;
  const genderId = k.gender === "Female" ? "6707882" : k.gender === "Male" ? "6707858" : "";

  // Try the full record first; drop optional extras one at a time rather than lose the child.
  const attempts: Array<() => Promise<Call>> = [];
  if (genderId) {
    attempts.push(() =>
      call(auth, "POST", "/people", {
        data: {
          type: "Person",
          attributes: base,
          relationships: { gender: { data: { type: "Gender", id: genderId } } },
        },
      }),
    );
    attempts.push(() =>
      call(auth, "POST", "/people", {
        data: { type: "Person", attributes: { ...base, gender: k.gender === "Female" ? "F" : "M" } },
      }),
    );
  }
  attempts.push(() => call(auth, "POST", "/people", { data: { type: "Person", attributes: base } }));

  let r: Call = { ok: false, status: 0, json: null, text: "" };
  for (let n = 0; n < attempts.length; n++) {
    r = await attempts[n]();
    if (r.ok) break;
    if (n < attempts.length - 1) errors.push(fail(`create ${k.firstName} (attempt ${n + 1}; retrying simpler)`, r));
  }
  if (!r.ok) {
    errors.push(fail(`create ${k.firstName}`, r));
    return null;
  }
  return String(r.json.data.id);
}

async function linkHousehold(
  auth: string,
  parentId: string,
  parentLast: string,
  kidIds: string[],
  errors: string[],
): Promise<boolean> {
  const hh = await call(auth, "GET", `/people/${parentId}/households?per_page=5`);
  const existing = hh.json?.data?.[0];
  const person = (id: string) => ({ type: "Person", id });

  if (existing) {
    const current: string[] = (existing.relationships?.people?.data ?? []).map((p: any) => String(p.id));
    const missing = kidIds.filter((id) => !current.includes(id));
    if (missing.length === 0) return true;
    const r = await call(auth, "PATCH", `/households/${existing.id}`, {
      data: {
        type: "Household",
        id: String(existing.id),
        relationships: { people: { data: [...current, ...missing].map(person) } },
      },
    });
    if (!r.ok) errors.push(fail("household update", r));
    return r.ok;
  }

  const r = await call(auth, "POST", "/households", {
    data: {
      type: "Household",
      attributes: { name: `${parentLast || "Visitor"} Household`, primary_contact_id: Number(parentId) },
      relationships: { people: { data: [parentId, ...kidIds].map(person) } },
    },
  });
  if (!r.ok) errors.push(fail("household create", r));
  return r.ok;
}

async function addWorkflowCard(
  auth: string,
  workflowId: string,
  personId: string,
  note: string,
  errors: string[],
): Promise<boolean> {
  let r = await call(auth, "POST", `/people/${personId}/workflow_cards`, {
    data: {
      type: "WorkflowCard",
      relationships: { workflow: { data: { type: "Workflow", id: workflowId } } },
    },
  });
  if (!r.ok) {
    const first = fail("workflow card (person route)", r);
    r = await call(auth, "POST", `/workflows/${workflowId}/cards`, {
      data: {
        type: "WorkflowCard",
        relationships: { person: { data: { type: "Person", id: personId } } },
      },
    });
    if (!r.ok) {
      errors.push(first, fail("workflow card (workflow route)", r));
      return false;
    }
  }
  const cardId = r.json?.data?.id;
  if (cardId && note) {
    const n = await call(auth, "POST", `/people/${personId}/workflow_cards/${cardId}/notes`, {
      data: { type: "WorkflowCardNote", attributes: { note } },
    });
    if (!n.ok) errors.push(fail("card note", n)); // card still exists; just no note
  }
  return true;
}

export async function registerVisitInPco(
  appId: string,
  secret: string,
  input: VisitPcoInput,
): Promise<VisitPcoResult> {
  const auth = pcoAuth(appId, secret);
  const out: VisitPcoResult = {
    parent: false,
    kidsRegistered: false,
    householdLinked: false,
    workflow: false,
    steps: [],
    errors: [],
  };

  let parentId: string;
  try {
    parentId = await findOrCreateAdult(auth, input.firstName, input.lastName, input.email);
    out.parent = true;
    out.steps.push("adult");
  } catch (e) {
    out.errors.push(`adult: ${e instanceof Error ? e.message : String(e)}`);
    return out;
  }

  await ensurePhone(auth, parentId, input.phone, out.errors);

  if (input.bringingKids && input.kids.length > 0) {
    const ids: string[] = [];
    for (const k of input.kids) {
      const id = await findOrCreateChild(auth, k, out.errors);
      if (id) ids.push(id);
    }
    out.kidsRegistered = ids.length === input.kids.length;
    if (ids.length) out.steps.push(`${ids.length} child${ids.length === 1 ? "" : "ren"}`);
    if (ids.length) {
      out.householdLinked = await linkHousehold(auth, parentId, input.lastName, ids, out.errors);
      if (out.householdLinked) out.steps.push("household");
    }
  }

  const wf = input.bringingKids ? VISIT_WORKFLOWS.kids : VISIT_WORKFLOWS.guests;
  out.workflow = await addWorkflowCard(auth, wf.id, parentId, input.summary, out.errors);
  if (out.workflow) out.steps.push(wf.name);

  return out;
}
