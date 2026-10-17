"use client";

import { useEffect, useState } from "react";
import Section from "@/components/ui/Section";
import GuestCardQR from "@/components/connect/GuestCardQR";
import { VISIT_SERVICES, KIDS_PREREG_URL } from "@/lib/visit-form";

const inputClass =
  "border border-border-strong rounded-xl px-4 py-3 w-full text-fg bg-surface-raised placeholder:text-fg-muted transition";

function nextSundays(count = 5): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7)); // today if Sunday, else next Sunday
  for (let i = 0; i < count; i++) {
    out.push(
      d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    );
    d.setDate(d.getDate() + 7);
  }
  return out;
}

interface Kid { firstName: string; lastName: string; birthday: string; grade: string; gender: string; allergies: string }
const emptyKid = (lastName = ""): Kid => ({ firstName: "", lastName, birthday: "", grade: "", gender: "", allergies: "" });
const MAX_KIDS = 8;
const GRADES = [
  "Not in school yet", "Pre-K", "Kindergarten", "1st grade", "2nd grade", "3rd grade", "4th grade",
  "5th grade", "6th grade", "7th grade", "8th grade", "9th grade", "10th grade", "11th grade", "12th grade",
];

const REASSURANCES = [
  "We'll send you parking and arrival details.",
  "Our Welcome Team will know you're coming.",
  "Services run about an hour, and you can wear whatever you'd like.",
  "Free coffee is waiting just inside the sanctuary doors.",
];

export default function PlanVisitForm() {
  const [sundays, setSundays] = useState<string[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [service, setService] = useState<string>("");
  const [outOfTown, setOutOfTown] = useState<boolean | null>(null);
  const [bringingKids, setBringingKids] = useState<boolean | null>(null);
  const [kids, setKids] = useState<Kid[]>([emptyKid()]);
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [kidsRegistered, setKidsRegistered] = useState(false);
  const [guestVcard, setGuestVcard] = useState("");

  // After submitting, the form swaps for a short card. Bring the reader to the top
  // of this section (heading + card) rather than centering the card mid-section.
  useEffect(() => {
    if (!success) return;
    const id = window.setTimeout(() => {
      const el = document.getElementById("plan-your-visit");
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 88; // clear the sticky header
      window.scrollTo({ top, behavior: "auto" });
    }, 120);
    return () => window.clearTimeout(id);
  }, [success]);

  useEffect(() => {
    const s = nextSundays();
    setSundays(s);
    setDateLabel(s[0]);
  }, []);

  const kidsIncomplete =
    bringingKids === true &&
    kids.some((k) => !k.firstName.trim() || !k.lastName.trim() || !k.birthday || !k.gender);
  const missing =
    !firstName.trim() || !email.trim() || !phone.trim() || !dateLabel || !service ||
    outOfTown === null || bringingKids === null || kidsIncomplete;

  /** Name exactly what is missing, e.g. "Child 1: gender, birthday." */
  function kidsProblem(): string {
    const parts: string[] = [];
    kids.forEach((k, i) => {
      const miss: string[] = [];
      if (!k.firstName.trim()) miss.push("first name");
      if (!k.lastName.trim()) miss.push("last name");
      if (!k.birthday) miss.push("birthday");
      if (!k.gender) miss.push("gender");
      if (miss.length) parts.push(`${kids.length > 1 ? `Child ${i + 1}` : "Your child"}: ${miss.join(", ")}`);
    });
    return `Almost there. ${parts.join(". ")}.`;
  }

  function updateKid(i: number, patch: Partial<Kid>) {
    setKids((prev) => prev.map((k, idx) => (idx === i ? { ...k, ...patch } : k)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (missing) {
      setError(kidsIncomplete ? kidsProblem() : "Please answer the starred questions so we can be ready for you.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/visit/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, lastName, email, phone, dateLabel, service,
          outOfTown, bringingKids, kids: bringingKids ? kids : [], notes, website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error ?? "Something went wrong. Please try again.");
      else {
        setKidsRegistered(Boolean(data.kidsRegistered));
        setGuestVcard(typeof data.vcard === "string" ? data.vcard : "");
        setSuccess(true);
      }
    } catch {
      setError("Unable to submit. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const yesNo = (
    label: string,
    value: boolean | null,
    set: (v: boolean) => void,
    help?: string,
    name?: string,
  ) => (
    <fieldset className="space-y-2">
      <legend className="block text-sm font-medium text-fg">
        {label} <span className="text-accent-text">*</span>
      </legend>
      {help && <p className="text-fg-muted text-xs leading-relaxed">{help}</p>}
      <div className="flex gap-3">
        {[true, false].map((v) => (
          <label
            key={String(v)}
            className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition ${
              value === v ? "border-accent bg-accent/10 text-fg" : "border-border-strong text-fg-muted"
            }`}
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={value === v}
              onChange={() => set(v)}
            />
            {v ? "Yes" : "No"}
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <Section className="py-24 px-6" id="plan-your-visit">
      <div className="max-w-2xl mx-auto">
        <p className="eyebrow text-center mb-4">Plan Your Visit</p>
        <h2 className="text-fg text-center mb-4 h-hero">Let us know you&apos;re coming</h2>
        <p className="text-fg-muted text-center mb-8 max-w-lg mx-auto leading-relaxed">
          We&apos;d love to make your first visit easy and welcoming. Tell us a little about
          you before you come, so we can be ready for you.
        </p>
        <ul className={`mb-10 space-y-2 max-w-md mx-auto ${success ? "hidden" : ""}`}>
          {REASSURANCES.map((r) => (
            <li key={r} className="flex gap-3 text-sm text-fg-muted">
              <span aria-hidden="true" className="text-accent-text font-bold">✓</span>
              {r}
            </li>
          ))}
        </ul>

        {success ? (
          <div className="rounded-2xl bg-accent/10 border border-accent/30 px-8 py-10 text-center space-y-3">
            <p className="text-fg font-semibold text-lg">We&apos;ll see you {dateLabel}!</p>
            <p className="text-fg-muted text-sm leading-relaxed max-w-sm mx-auto">
              Check your email for parking and arrival details. If you have questions before
              Sunday, just reply to that message.
            </p>
            {bringingKids && (
              <p className="text-fg-muted text-sm leading-relaxed max-w-sm mx-auto">
                {kidsRegistered ? (
                  "Your kids are pre-registered. When you arrive, use the Albemarle Ave entrance and check them in as usual."
                ) : (
                  <>
                    Bringing kids? Pre-register your family so check-in is quick.{" "}
                    <a href={KIDS_PREREG_URL} className="text-accent-text font-semibold underline underline-offset-2">
                      Pre-register your kids
                    </a>
                    .
                  </>
                )}
              </p>
            )}
            {guestVcard && <GuestCardQR vcard={guestVcard} />}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-2xl border border-border p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="pv-first" className="block text-sm font-medium text-fg">
                  First name <span className="text-accent-text">*</span>
                </label>
                <input id="pv-first" required autoComplete="given-name" value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="pv-last" className="block text-sm font-medium text-fg">Last name</label>
                <input id="pv-last" autoComplete="family-name" value={lastName}
                  onChange={(e) => setLastName(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pv-email" className="block text-sm font-medium text-fg">
                Email <span className="text-accent-text">*</span>
              </label>
              <input id="pv-email" type="email" required autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pv-phone" className="block text-sm font-medium text-fg">
                Mobile phone <span className="text-accent-text">*</span>
              </label>
              <input id="pv-phone" type="tel" required autoComplete="tel" value={phone}
                onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pv-date" className="block text-sm font-medium text-fg">
                What day will you visit? <span className="text-accent-text">*</span>
              </label>
              <select id="pv-date" value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} className={inputClass}>
                {sundays.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <fieldset className="space-y-2">
              <legend className="block text-sm font-medium text-fg">
                Which service? <span className="text-accent-text">*</span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[...VISIT_SERVICES, { id: "unsure", label: "Not sure yet", sub: "That's fine" }].map((s) => (
                  <label
                    key={s.id}
                    className={`cursor-pointer rounded-xl border px-4 py-3 text-center transition ${
                      service === s.id ? "border-accent bg-accent/10" : "border-border-strong"
                    }`}
                  >
                    <input type="radio" name="pv-service" className="sr-only" checked={service === s.id}
                      onChange={() => setService(s.id)} />
                    <span className="block text-sm font-semibold text-fg">{s.label}</span>
                    <span className="block text-xs text-fg-muted">{s.sub}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {yesNo("Are you visiting from out of town?", outOfTown, setOutOfTown, undefined, "pv-oot")}
            {yesNo(
              "Are you bringing kids?",
              bringingKids,
              (v: boolean) => {
                setBringingKids(v);
                if (v) setKids((prev) => prev.map((k) => (k.lastName ? k : { ...k, lastName: lastName.trim() })));
              },
              "If you're checking in children, plan to arrive 15–20 minutes before the service.",
              "pv-kids",
            )}

            {bringingKids && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-fg">Tell us about your kids</p>
                {kids.map((k, i) => (
                  <div key={i} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">Child {i + 1}</p>
                      {kids.length > 1 && (
                        <button type="button" onClick={() => setKids((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-xs text-accent-text underline underline-offset-2">
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor={`pv-kf-${i}`} className="block text-xs font-medium text-fg">First name <span className="text-accent-text">*</span></label>
                        <input id={`pv-kf-${i}`} value={k.firstName} autoComplete="off"
                          onChange={(e) => updateKid(i, { firstName: e.target.value })} className={inputClass} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor={`pv-kl-${i}`} className="block text-xs font-medium text-fg">Last name <span className="text-accent-text">*</span></label>
                        <input id={`pv-kl-${i}`} value={k.lastName} autoComplete="off"
                          onChange={(e) => updateKid(i, { lastName: e.target.value })} className={inputClass} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor={`pv-kb-${i}`} className="block text-xs font-medium text-fg">Birthday <span className="text-accent-text">*</span></label>
                        <input id={`pv-kb-${i}`} type="date" value={k.birthday} max={new Date().toISOString().slice(0, 10)}
                          onChange={(e) => updateKid(i, { birthday: e.target.value })} className={`${inputClass} min-w-0 max-w-full appearance-none ${touched && !k.birthday ? "!border-red-500" : ""}`} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor={`pv-kg-${i}`} className="block text-xs font-medium text-fg">Grade</label>
                        <select id={`pv-kg-${i}`} value={k.grade} onChange={(e) => updateKid(i, { grade: e.target.value })} className={inputClass}>
                          <option value="">Select…</option>
                          {GRADES.map((g) => (<option key={g} value={g}>{g}</option>))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label htmlFor={`pv-kx-${i}`} className="block text-xs font-medium text-fg">Gender <span className="text-accent-text">*</span></label>
                        <select id={`pv-kx-${i}`} value={k.gender} onChange={(e) => updateKid(i, { gender: e.target.value })} className={`${inputClass} ${touched && !k.gender ? "!border-red-500" : ""}`}>
                          <option value="">Select…</option>
                          <option value="Male">Boy</option>
                          <option value="Female">Girl</option>
                        </select>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label htmlFor={`pv-ka-${i}`} className="block text-xs font-medium text-fg">Allergies or medical needs <span className="text-fg-muted font-normal">(leave blank if none)</span></label>
                        <input id={`pv-ka-${i}`} type="text" value={k.allergies} maxLength={300} placeholder="Only if your child has any"
                          onChange={(e) => updateKid(i, { allergies: e.target.value })} className={`${inputClass}`} />
                      </div>
                    </div>
                  </div>
                ))}
                {kids.length < MAX_KIDS && (
                  <button type="button" onClick={() => setKids((prev) => [...prev, emptyKid(lastName.trim())])}
                    className="w-full py-3 rounded-xl border border-dashed border-border-strong text-sm font-semibold text-accent-text">
                    + Add another child
                  </button>
                )}
                <p className="text-fg-muted text-xs">
                  Our kids team will use this to be ready for them. You&apos;ll be able to pre-register
                  for faster check-in after you submit.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="pv-notes" className="block text-sm font-medium text-fg">
                Anything else we should know, like accessibility needs? (optional)
              </label>
              <textarea id="pv-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
            </div>

            {/* Honeypot — real visitors never see or fill this. */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </label>
            </div>

            {error && touched && <p role="alert" className="text-sm text-fg" style={{ color: "var(--danger-text)" }}>{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-fg-on-accent text-base transition bg-accent-solid hover:bg-accent-solid-hover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending…" : "Let us know I'm coming"}
            </button>
            <p className="text-fg-muted text-xs text-center">
              No pressure, no confusion, no need to figure it out alone.
            </p>
          </form>
        )}
      </div>
    </Section>
  );
}
