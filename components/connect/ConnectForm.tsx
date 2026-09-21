"use client";

import { useState } from "react";

const HOW_HEARD_OPTIONS = [
  { id: "11728678", label: "Friend" },
  { id: "11728679", label: "Coworker" },
  { id: "11728680", label: "Neighbor" },
  { id: "11728681", label: "Family" },
  { id: "11728682", label: "Social Media" },
  { id: "11728683", label: "Website" },
  { id: "11728684", label: "The BX" },
];

const INTEREST_OPTIONS = [
  { id: "11728671", label: "Learning more about Brainerd" },
  { id: "11728672", label: "Joining a Life Group" },
  { id: "11728673", label: "Kids" },
  { id: "11728674", label: "Students" },
  { id: "11728675", label: "College & Young Adults" },
  { id: "11728676", label: "Serving" },
  { id: "11728677", label: "Baptism" },
];

const inputClass =
  "border border-border-strong rounded-xl px-4 py-3 w-full text-fg bg-surface-raised placeholder:text-fg-muted transition";

function CheckboxGroup({
  options,
  selected,
  onChange,
  name,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (id: string, checked: boolean) => void;
  name: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
      {options.map((opt) => {
        const checked = selected.includes(opt.id);
        return (
          <label
            key={opt.id}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <span className="relative flex-shrink-0 w-5 h-5">
              <input
                type="checkbox"
                name={name}
                value={opt.id}
                checked={checked}
                onChange={(e) => onChange(opt.id, e.target.checked)}
                className="peer sr-only"
              />
              {/* Custom checkbox box */}
              <span className="block w-5 h-5 rounded border-2 border-border-strong bg-surface-raised peer-checked:bg-accent-solid peer-checked:border-accent transition group-hover:border-accent/60" />
              {/* Checkmark */}
              {checked && (
                <svg
                  className="absolute inset-0 m-auto w-3 h-3 text-white pointer-events-none"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="2,6 5,9 10,3" />
                </svg>
              )}
            </span>
            <span className="text-fg text-sm leading-snug select-none">
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default function ConnectForm({ showMembershipOption = false }: { showMembershipOption?: boolean }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [howHeard, setHowHeard] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [wantsMembership, setWantsMembership] = useState(false);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  function toggleHowHeard(id: string, checked: boolean) {
    setHowHeard((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id)
    );
  }

  function toggleInterest(id: string, checked: boolean) {
    setInterests((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id)
    );
  }

  const howHeardError = touched && howHeard.length === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);

    if (howHeard.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/pco/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          howHeard,
          interests,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        // Membership isn't a PCO Connect form option (yet) — routed as its
        // own email separately. Fire-and-forget: a hiccup here shouldn't
        // block the main connect submission from showing success.
        if (showMembershipOption && wantsMembership) {
          fetch("/api/contact/membership", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: `${firstName} ${lastName}`.trim(),
              email,
              phone,
              message: "Checked \"I'm interested in membership\" on the Connect form.",
            }),
          }).catch(() => {});
        }
        setSuccess(true);
      }
    } catch {
      setError("Unable to submit. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-accent/10 border border-accent/30 px-8 py-10 text-center space-y-3">
        <div className="flex justify-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20">
            <svg
              className="w-6 h-6 text-accent-text"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
        </div>
        <p className="text-fg font-semibold text-lg">You&apos;re all set!</p>
        <p className="text-fg-muted text-sm leading-relaxed max-w-sm mx-auto">
          Thanks! Someone from our team will be in touch soon. We&apos;re glad
          you&apos;re here.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-fg">
            First name <span className="text-accent-text">*</span>
          </label>
          <input
            type="text"
            required
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-fg">
            Last name <span className="text-accent-text">*</span>
          </label>
          <input
            type="text"
            required
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Smith"
            className={inputClass}
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-fg">
          Email <span className="text-accent-text">*</span>
        </label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          className={inputClass}
        />
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-fg">
          Phone <span className="text-accent-text">*</span>
        </label>
        <input
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(423) 555-0100"
          className={inputClass}
        />
      </div>

      {/* How did you hear about Brainerd? */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-fg">
            How did you hear about Brainerd?{" "}
            <span className="text-accent-text">*</span>
          </p>
          <p className="text-xs text-fg-muted mt-0.5">Select all that apply.</p>
        </div>
        <CheckboxGroup
          options={HOW_HEARD_OPTIONS}
          selected={howHeard}
          onChange={toggleHowHeard}
          name="howHeard"
        />
        {howHeardError && (
          <p className="text-danger-text text-xs mt-1">
            Please select at least one option.
          </p>
        )}
      </div>

      {/* I'm interested in… */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-fg">
            I&apos;m interested in…
          </p>
          <p className="text-xs text-fg-muted mt-0.5">
            Optional — select anything that applies.
          </p>
        </div>
        <CheckboxGroup
          options={INTEREST_OPTIONS}
          selected={interests}
          onChange={toggleInterest}
          name="interests"
        />
      </div>

      {showMembershipOption && (
        <label className="flex items-start gap-3 cursor-pointer group rounded-xl border border-border hover:border-accent/30 p-4 transition-colors">
          <span className="relative flex-shrink-0 w-5 h-5 mt-0.5">
            <input
              type="checkbox"
              checked={wantsMembership}
              onChange={(e) => setWantsMembership(e.target.checked)}
              className="peer sr-only"
            />
            <span className="block w-5 h-5 rounded border-2 border-border-strong bg-surface-raised peer-checked:bg-accent-solid peer-checked:border-accent transition group-hover:border-accent/60" />
            {wantsMembership && (
              <svg className="absolute inset-0 m-auto w-3 h-3 text-white pointer-events-none" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,6 5,9 10,3" />
              </svg>
            )}
          </span>
          <span>
            <span className="block text-fg text-sm font-medium">I&apos;m interested in membership</span>
            <span className="block text-fg-muted text-xs mt-0.5">Someone will reach out to walk you through what that looks like.</span>
          </span>
        </label>
      )}

      {/* Anything else? */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-fg">
          Anything else?
        </label>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything you'd like us to know?"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-danger-text text-sm bg-danger-bg border border-danger-border rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 px-6 rounded-xl font-semibold text-white text-base transition
          bg-accent hover:bg-brand-navy
          disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending…" : "Connect with us"}
      </button>
    </form>
  );
}
