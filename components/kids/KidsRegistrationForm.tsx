"use client";

import { useState } from "react";

const SERVICE_OPTIONS = [
  { id: "2971216", label: "Sanctuary | 8:30" },
  { id: "6060961", label: "Life Group | 9:45" },
  { id: "2971214", label: "BX | 11:00" },
  { id: "6060981", label: "Midweek" },
  { id: "2971217", label: "East Ridge | 11:00" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

type ChildInfo = {
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "";
  birthdate: string;
};

type ParentInfo = {
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  service: string;
  consentToText: boolean;
  parentalRightsNotes: string;
};

const EMPTY_CHILD: ChildInfo = {
  firstName: "",
  lastName: "",
  gender: "",
  birthdate: "",
};

const EMPTY_PARENT: ParentInfo = {
  parentFirstName: "",
  parentLastName: "",
  parentEmail: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  service: "",
  consentToText: false,
  parentalRightsNotes: "",
};

const inputCls =
  "w-full rounded-xl border border-[#00205B]/20 px-4 py-3 text-[#00142a] text-sm placeholder:text-[#00205B]/35 focus:outline-none focus:ring-2 focus:ring-[#00abc9] focus:border-transparent transition bg-white";

const labelCls =
  "block font-condensed font-800 text-[#00205B] text-sm mb-1.5 tracking-wide";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && <span className="text-[#00abc9] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function KidsRegistrationForm() {
  const [step, setStep] = useState(1);
  const [parent, setParent] = useState<ParentInfo>(EMPTY_PARENT);
  const [children, setChildren] = useState<ChildInfo[]>([{ ...EMPTY_CHILD }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const setP = (key: keyof ParentInfo, value: string | boolean) =>
    setParent((p) => ({ ...p, [key]: value }));

  const setChild = (index: number, key: keyof ChildInfo, value: string) =>
    setChildren((cs) =>
      cs.map((c, i) => (i === index ? { ...c, [key]: value } : c))
    );

  const addChild = () =>
    setChildren((cs) => [...cs, { ...EMPTY_CHILD }]);

  const removeChild = (index: number) =>
    setChildren((cs) => cs.filter((_, i) => i !== index));

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/pco/kids-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentFirstName: parent.parentFirstName,
          parentLastName: parent.parentLastName,
          parentEmail: parent.parentEmail,
          phone: parent.phone,
          children: children.map((c) => ({
            firstName: c.firstName,
            lastName: c.lastName,
            gender: c.gender,
            birthdate: c.birthdate,
          })),
          address: {
            street: parent.street,
            city: parent.city,
            state: parent.state,
            zip: parent.zip,
          },
          service: parent.service,
          consentToText: parent.consentToText,
          parentalRightsNotes: parent.parentalRightsNotes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setParent(EMPTY_PARENT);
    setChildren([{ ...EMPTY_CHILD }]);
    setStep(1);
    setSubmitted(false);
    setError("");
  }

  if (submitted) {
    const count = children.length;
    return (
      <div className="rounded-2xl bg-white border border-[#00205B]/10 p-10 text-center max-w-xl mx-auto shadow-sm">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(0,171,201,0.10)" }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M7 16l6 6 12-12"
              stroke="#00abc9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3
          className="font-condensed font-900 text-[#00205B] mb-3"
          style={{ fontSize: "1.75rem", letterSpacing: "-0.01em" }}
        >
          {count === 1 ? "You're registered!" : `${count} kids registered!`}
        </h3>
        <p className="text-[#00205B]/60 leading-relaxed mb-8">
          We&apos;ll see you Sunday. Look for a welcome text if you opted in.
          Your {count === 1 ? "child" : "children"} will be in our system before
          you arrive — first-time check-in takes about 60 seconds.
        </p>
        <button
          onClick={resetForm}
          className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3 rounded-full transition-colors"
          style={{ background: "#00205B", color: "white" }}
        >
          Register Another Family
        </button>
      </div>
    );
  }

  const stepLabel =
    step === 1
      ? "Parent Information"
      : step === 2
      ? `Children (${children.length})`
      : "Details & Preferences";

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-condensed font-800 text-sm transition-colors"
                style={{
                  background: s <= step ? "#00abc9" : "rgba(0,32,91,0.08)",
                  color: s <= step ? "#00142a" : "rgba(0,32,91,0.35)",
                }}
              >
                {s < step ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8l3.5 3.5 6.5-6.5"
                      stroke="#00142a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 3 && (
                <div
                  className="flex-1 h-0.5 mx-2 transition-colors"
                  style={{
                    background: s < step ? "#00abc9" : "rgba(0,32,91,0.12)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-[#00205B]/50 text-xs font-condensed font-700 tracking-wide uppercase">
          Step {step} of 3 &mdash; {stepLabel}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#00205B]/10 p-8 shadow-sm">
        {/* Step 1 — Parent Info */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required>
                <input
                  className={inputCls}
                  value={parent.parentFirstName}
                  onChange={(e) => setP("parentFirstName", e.target.value)}
                  placeholder="Jane"
                  autoComplete="given-name"
                />
              </Field>
              <Field label="Last Name" required>
                <input
                  className={inputCls}
                  value={parent.parentLastName}
                  onChange={(e) => setP("parentLastName", e.target.value)}
                  placeholder="Smith"
                  autoComplete="family-name"
                />
              </Field>
            </div>
            <Field label="Email Address" required>
              <input
                type="email"
                className={inputCls}
                value={parent.parentEmail}
                onChange={(e) => setP("parentEmail", e.target.value)}
                placeholder="jane@example.com"
                autoComplete="email"
              />
            </Field>
            <Field label="Phone Number" required>
              <input
                type="tel"
                className={inputCls}
                value={parent.phone}
                onChange={(e) => setP("phone", e.target.value)}
                placeholder="(555) 123-4567"
                autoComplete="tel"
              />
            </Field>
          </div>
        )}

        {/* Step 2 — Children */}
        {step === 2 && (
          <div className="space-y-6">
            {children.map((child, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#00205B]/10 p-5 space-y-4 relative"
              >
                {children.length > 1 && (
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-condensed font-800 text-[#00205B]/50 text-xs tracking-wide uppercase">
                      Child {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeChild(idx)}
                      className="text-[#00205B]/35 hover:text-red-500 transition-colors text-xs font-condensed font-700 tracking-wide uppercase"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {children.length === 1 && (
                  <p className="font-condensed font-800 text-[#00205B]/50 text-xs tracking-wide uppercase mb-1">
                    Child Information
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" required>
                    <input
                      className={inputCls}
                      value={child.firstName}
                      onChange={(e) => setChild(idx, "firstName", e.target.value)}
                      placeholder="Olivia"
                    />
                  </Field>
                  <Field label="Last Name" required>
                    <input
                      className={inputCls}
                      value={child.lastName}
                      onChange={(e) => setChild(idx, "lastName", e.target.value)}
                      placeholder="Smith"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Gender" required>
                    <select
                      className={inputCls}
                      value={child.gender}
                      onChange={(e) =>
                        setChild(idx, "gender", e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Select gender
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </Field>
                  <Field label="Birthday" required>
                    <input
                      type="date"
                      className={inputCls}
                      value={child.birthdate}
                      onChange={(e) => setChild(idx, "birthdate", e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </Field>
                </div>
              </div>
            ))}

            {/* Add another child */}
            <button
              type="button"
              onClick={addChild}
              className="w-full rounded-xl border-2 border-dashed border-[#00205B]/15 py-3 text-sm font-condensed font-700 tracking-wide text-[#00205B]/40 hover:border-[#00abc9]/50 hover:text-[#00abc9] transition-colors"
            >
              + Add Another Child
            </button>
          </div>
        )}

        {/* Step 3 — Details */}
        {step === 3 && (
          <div className="space-y-5">
            <Field label="Street Address" required>
              <input
                className={inputCls}
                value={parent.street}
                onChange={(e) => setP("street", e.target.value)}
                placeholder="123 Main St"
                autoComplete="street-address"
              />
            </Field>
            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-3">
                <Field label="City" required>
                  <input
                    className={inputCls}
                    value={parent.city}
                    onChange={(e) => setP("city", e.target.value)}
                    placeholder="Chattanooga"
                    autoComplete="address-level2"
                  />
                </Field>
              </div>
              <div className="col-span-1">
                <Field label="State" required>
                  <select
                    className={inputCls}
                    value={parent.state}
                    onChange={(e) => setP("state", e.target.value)}
                    autoComplete="address-level1"
                  >
                    <option value="" disabled>
                      —
                    </option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="ZIP" required>
                  <input
                    className={inputCls}
                    value={parent.zip}
                    onChange={(e) => setP("zip", e.target.value)}
                    placeholder="37421"
                    maxLength={10}
                    autoComplete="postal-code"
                  />
                </Field>
              </div>
            </div>
            <Field label="Which Service?" required>
              <select
                className={inputCls}
                value={parent.service}
                onChange={(e) => setP("service", e.target.value)}
              >
                <option value="" disabled>
                  Select a service
                </option>
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            {/* Consent to text */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="consent-text"
                type="checkbox"
                checked={parent.consentToText}
                onChange={(e) => setP("consentToText", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#00205B]/30 accent-[#00abc9] cursor-pointer flex-shrink-0"
              />
              <label
                htmlFor="consent-text"
                className="text-sm text-[#00205B]/65 leading-relaxed cursor-pointer"
              >
                <span className="font-condensed font-800 text-[#00205B]">
                  Receive text updates
                </span>{" "}
                about your child while in our care. Opt out anytime.
                Message/data rates may apply.
              </label>
            </div>

            <Field label="Parental Rights / Notes">
              <textarea
                className={`${inputCls} min-h-[96px] resize-y`}
                value={parent.parentalRightsNotes}
                onChange={(e) => setP("parentalRightsNotes", e.target.value)}
                placeholder="Any custody, visitation, or support orders we should know about?"
              />
            </Field>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        {step > 1 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="font-condensed font-700 tracking-wide uppercase text-sm border border-[#00205B]/20 text-[#00205B] px-6 py-3 rounded-full hover:border-[#00205B]/40 transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={() => {
              if (step === 1) {
                if (
                  !parent.parentFirstName ||
                  !parent.parentLastName ||
                  !parent.parentEmail ||
                  !parent.phone
                ) {
                  setError("Please fill in all required fields.");
                  return;
                }
              }
              if (step === 2) {
                for (const child of children) {
                  if (
                    !child.firstName ||
                    !child.lastName ||
                    !child.gender ||
                    !child.birthdate
                  ) {
                    setError(
                      "Please fill in all required fields for each child."
                    );
                    return;
                  }
                }
              }
              setError("");
              setStep((s) => s + 1);
            }}
            className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3 rounded-full transition-colors"
            style={{ background: "#00abc9", color: "#00142a" }}
          >
            Next
          </button>
        ) : (
          <button
            disabled={
              submitting ||
              !parent.street ||
              !parent.city ||
              !parent.state ||
              !parent.zip ||
              !parent.service
            }
            onClick={handleSubmit}
            className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#00205B", color: "white" }}
          >
            {submitting ? "Submitting…" : "Submit Registration"}
          </button>
        )}
      </div>
    </div>
  );
}
