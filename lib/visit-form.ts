/**
 * "Plan a Visit" form — shared config (server + client safe: no secrets).
 *
 * Every submission (1) writes the visitor into Planning Center People
 * (adult, children, household, workflow card — see lib/pco-visit.ts),
 * (2) emails the guest-services contact, and (3) sends the guest a confirmation.
 */

/** Who gets the heads-up email for every submission ("only me for now"). */
/** Who hears about "Take a Next Step" requests. Route by interest later. */
export const NEXT_STEP_NOTIFY_EMAIL = "jking@brainerdbaptist.org";
export const VISIT_NOTIFY_EMAIL = "jking@brainerdbaptist.org";

/**
 * Who also gets the heads-up when a visitor is bringing kids.
 * Josiah for now; switch to "kids@brainerdbaptist.org" once the kids team is ready.
 * (Same address as above = one email, no duplicates.)
 */
export const VISIT_KIDS_EMAIL = "jking@brainerdbaptist.org";

export const KIDS_PREREG_URL = "https://brainerdbaptist.churchcenter.com/people/forms/376960";

export const VISIT_SERVICES = [
  { id: "830", label: "8:30 AM", sub: "Choir & Orchestra" },
  { id: "1100", label: "11:00 AM", sub: "Band-Led" },
] as const;

export type VisitServiceId = (typeof VISIT_SERVICES)[number]["id"];

/** Planning Center workflows a visit lands in (card goes on the adult). */
export const VISIT_WORKFLOWS = {
  kids: { id: "354738", name: "BrainerdKids Visitor" },
  guests: { id: "321059", name: "First Time Guests" },
} as const;
