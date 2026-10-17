/**
 * "Take a Next Step" -> Planning Center People (server-side only).
 *
 * Same idea as Plan a Visit: write real records instead of a form submission.
 *   1. the person — found by email, or created; mobile number added
 *   2. a profile note ("Completed the online Next Step form ...")
 *   3. one workflow card per area of interest, each with a card note
 *
 * Every step is best-effort and reported, so one failure never loses the rest.
 */
import { pcoAuth } from "@/lib/pco-forms";
import { findOrCreateAdult, ensurePhone, addProfileNote, addWorkflowCard } from "@/lib/pco-visit";

/** Interest option id (see INTEREST_OPTIONS in ConnectForm) -> the workflow its card lands in. */
export const NEXT_STEP_INTERESTS: Record<string, { label: string; workflowId: string; workflowName: string }> = {
  "11728671": { label: "Learning more about Brainerd", workflowId: "179221", workflowName: "CC: General Follow Up" },
  "11728672": { label: "Joining a Life Group", workflowId: "793476", workflowName: "cc: Life Group Interest" },
  "11728673": { label: "Kids", workflowId: "203007", workflowName: "CC: Wants info about Kids Ministry" },
  "11728674": { label: "Students", workflowId: "179205", workflowName: "CC: Wants info about Student Ministry" },
  "11728675": { label: "College & Young Adults", workflowId: "179207", workflowName: "CC: Wants info about College" },
  "11728676": { label: "Serving", workflowId: "179221", workflowName: "CC: General Follow Up" },
  "11728677": { label: "Baptism", workflowId: "179218", workflowName: "CC: Baptism/Following Jesus" },
};

export const NEXT_STEP_MEMBERSHIP = {
  label: "Membership",
  workflowId: "793477",
  workflowName: "cc: Membership Interest",
};

export const HOW_HEARD_LABELS: Record<string, string> = {
  "11728678": "Friend",
  "11728679": "Coworker",
  "11728680": "Neighbor",
  "11728681": "Family",
  "11728682": "Social Media",
  "11728683": "Website",
  "11728684": "The BX",
};

export interface NextStepInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  interestIds: string[];
  wantsMembership: boolean;
  howHeardIds: string[];
  notes: string;
}

export interface NextStepResult {
  person: boolean;
  /** Workflow names that got a card. */
  cards: string[];
  /** Interests we could not place in a workflow (so staff still see them in the email). */
  unplaced: string[];
  interestLabels: string[];
  howHeard: string[];
  errors: string[];
}

export async function registerNextStepInPco(
  appId: string,
  secret: string,
  input: NextStepInput,
): Promise<NextStepResult> {
  const auth = pcoAuth(appId, secret);
  const out: NextStepResult = {
    person: false,
    cards: [],
    unplaced: [],
    interestLabels: [],
    howHeard: input.howHeardIds.map((id) => HOW_HEARD_LABELS[id]).filter(Boolean),
    errors: [],
  };

  // Group interests by workflow so one card carries every reason for that workflow.
  const byWorkflow = new Map<string, { name: string; labels: string[] }>();
  const add = (label: string, workflowId: string, workflowName: string) => {
    out.interestLabels.push(label);
    const g = byWorkflow.get(workflowId) ?? { name: workflowName, labels: [] };
    g.labels.push(label);
    byWorkflow.set(workflowId, g);
  };
  for (const id of input.interestIds) {
    const m = NEXT_STEP_INTERESTS[id];
    if (m) add(m.label, m.workflowId, m.workflowName);
    else out.unplaced.push(id);
  }
  if (input.wantsMembership) {
    add(NEXT_STEP_MEMBERSHIP.label, NEXT_STEP_MEMBERSHIP.workflowId, NEXT_STEP_MEMBERSHIP.workflowName);
  }

  let personId: string;
  try {
    personId = await findOrCreateAdult(auth, input.firstName, input.lastName, input.email);
    out.person = true;
  } catch (e) {
    out.errors.push(`person: ${e instanceof Error ? e.message : String(e)}`);
    return out;
  }

  await ensurePhone(auth, personId, input.phone, out.errors);

  const stamp = new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const interestText = out.interestLabels.length ? out.interestLabels.join(", ") : "no specific interest checked";
  const how = out.howHeard.length ? ` Heard about us through: ${out.howHeard.join(", ")}.` : "";
  const extra = input.notes.trim() ? ` Note: ${input.notes.trim()}` : "";

  await addProfileNote(
    auth,
    personId,
    `Completed the online Take a Next Step form on ${stamp}. Interested in: ${interestText}.${how}${extra}`,
    out.errors,
  );

  // No interest checked: still give someone a card to follow up on.
  if (byWorkflow.size === 0) {
    byWorkflow.set("179221", { name: "CC: General Follow Up", labels: [] });
  }

  for (const [workflowId, g] of byWorkflow) {
    const note =
      `Take a Next Step form (${stamp}). ` +
      (g.labels.length ? `Interested in: ${g.labels.join(", ")}.` : "No specific interest checked.") +
      how +
      extra;
    const ok = await addWorkflowCard(auth, workflowId, personId, note, out.errors);
    if (ok) out.cards.push(g.name);
  }

  return out;
}
