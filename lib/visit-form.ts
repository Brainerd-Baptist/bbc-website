/**
 * "Plan a Visit" form — shared config (server + client safe: no secrets).
 *
 * The form on /visit always (1) emails the guest-services contact and
 * (2) sends the guest a confirmation. If the Planning Center "Plan a Visit"
 * form has been created and its IDs filled in below, it ALSO submits there so
 * PCO workflows route the card ("bringing kids: yes" -> BrainerdKids Visitor,
 * "no" -> First Time Guests). Leave `formId` empty until that form exists;
 * the route skips PCO cleanly and nothing breaks.
 *
 * See the project doc "website-plan-a-visit-form-spec" for the exact PCO
 * form fields to create.
 */

/** Who gets the heads-up email for every submission ("only me for now"). */
export const VISIT_NOTIFY_EMAIL = "jking@brainerdbaptist.org";

export const KIDS_PREREG_URL = "https://brainerdbaptist.churchcenter.com/people/forms/376960";

export const VISIT_SERVICES = [
  { id: "830", label: "8:30 AM", sub: "Choir & Orchestra" },
  { id: "1100", label: "11:00 AM", sub: "Band-Led" },
] as const;

export type VisitServiceId = (typeof VISIT_SERVICES)[number]["id"];

export const VISIT_PCO = {
  /** PCO People form ID for "Plan a Visit". Empty = PCO submission off. */
  formId: "",
  fields: {
    phone: "",      // phone_number
    date: "",       // string — we send e.g. "Sunday, Oct 18"
    service: "",    // workflow_dropdown or dropdown (options below)
    outOfTown: "",  // workflow_dropdown/dropdown (yes/no options below)
    kids: "",       // workflow_dropdown: THIS is what routes to the kids workflow
    kidsInfo: "",   // string — "Ava 4, Sam 7"
    notes: "",      // string
  },
  options: {
    service: { "830": "", "1100": "", unsure: "" } as Record<string, string>,
    outOfTown: { yes: "", no: "" } as Record<string, string>,
    kids: { yes: "", no: "" } as Record<string, string>,
  },
};

export function visitPcoReady(): boolean {
  const f = VISIT_PCO;
  return Boolean(
    f.formId &&
      f.fields.phone && f.fields.date && f.fields.service &&
      f.fields.kids && f.options.kids.yes && f.options.kids.no &&
      f.options.service["830"] && f.options.service["1100"],
  );
}
