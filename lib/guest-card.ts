/**
 * The "guest card" QR: a vCard (contact card) for Plan a Visit guests.
 *
 * Scanning it with a phone camera shows the contact on screen, so the Welcome Team
 * and kids check-in team can see everything at a glance, and save it if they want.
 *   - Company = "Brainerd Guest", so a contact search for "Brainerd Guest" lists every guest
 *   - Job title = the visit date and service, so it shows right under the name
 *   - Notes = party details, one line per child (age or grade, allergies), link to the profile
 *
 * Pure functions only, so the server can build the card for both the confirmation email and
 * the on-screen QR. Children's full birthdates are deliberately left off.
 */

export interface GuestCardKid {
  firstName: string;
  lastName: string;
  birthday: string; // YYYY-MM-DD
  grade: string; // form label, may be ""
  gender: string; // "Male" | "Female" | ""
  allergies: string;
}

export interface GuestCardInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateLabel: string;
  /** e.g. "8:30 AM", or "" when they were not sure. */
  serviceLabel: string;
  outOfTown: boolean;
  notes: string;
  kids: GuestCardKid[];
  /** Kids are already in Planning Center, so check-in is quick. */
  kidsRegistered: boolean;
  /** Planning Center person id of the adult, when we have it. */
  pcoPersonId?: string;
}

/** "Grade 3", "Kindergarten" for school-age kids; "3 yrs" / "8 mo" for younger ones. */
export function kidAgeOrGrade(birthday: string, grade: string, today = new Date()): string {
  const g = grade.toLowerCase();
  if (g.startsWith("kinder")) return "Kindergarten";
  const n = parseInt(g, 10);
  if (Number.isFinite(n) && n >= 1 && n <= 12) return `Grade ${n}`;

  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthday);
  let age = "";
  if (m) {
    const y = +m[1], mo = +m[2], d = +m[3];
    let months = (today.getFullYear() - y) * 12 + (today.getMonth() + 1 - mo);
    if (today.getDate() < d) months -= 1;
    if (months >= 0) age = months < 24 ? `${months} mo` : `${Math.floor(months / 12)} yrs`;
  }
  if (g.startsWith("pre")) return age ? `Pre-K, ${age}` : "Pre-K";
  return age;
}

// RFC 6350 text escaping: backslash, comma, semicolon (newlines are added after, as "\n").
const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");

export function buildGuestVCard(i: GuestCardInput): string {
  const fullName = `${i.firstName} ${i.lastName}`.trim();
  const when = [i.dateLabel, i.serviceLabel].filter(Boolean).join(", ");

  const noteLines: string[] = [`Brainerd Guest. Visiting ${when}`];
  if (i.outOfTown) noteLines.push("Visiting from out of town");
  if (i.kids.length) {
    noteLines.push(
      i.kidsRegistered
        ? "Kids (already pre-registered in Planning Center):"
        : "Kids (check them in at the kids desk):",
    );
    for (const k of i.kids) {
      const parts = [
        `${k.firstName} ${k.lastName}`.trim(),
        kidAgeOrGrade(k.birthday, k.grade),
        k.gender === "Female" ? "Girl" : k.gender === "Male" ? "Boy" : "",
        k.allergies ? `ALLERGY/MEDICAL: ${k.allergies}` : "",
      ].filter(Boolean);
      noteLines.push(`- ${parts.join(" · ")}`);
    }
  }
  if (i.notes) noteLines.push(`Note from guest: ${i.notes}`);
  noteLines.push("Registered online with the Plan a Visit form");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(i.lastName)};${esc(i.firstName)};;;`,
    `FN:${esc(fullName)}`,
    "ORG:Brainerd Guest",
    `TITLE:${esc(`Visiting ${when}`)}`,
    i.phone ? `TEL;TYPE=CELL:${esc(i.phone)}` : null,
    i.email ? `EMAIL:${esc(i.email)}` : null,
    i.pcoPersonId ? `URL:https://people.planningcenteronline.com/people/AC${i.pcoPersonId}` : null,
    "CATEGORIES:Brainerd Guest",
    `NOTE:${noteLines.map(esc).join("\\n")}`,
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\n");
}
