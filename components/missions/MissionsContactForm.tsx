"use client";

import { useState } from "react";

const inputClass =
  "border border-border-strong rounded-xl px-4 py-3 w-full text-fg bg-surface-raised placeholder:text-fg-muted transition";

const INTERESTS = [
  { value: "short-term", label: "Joining a short-term team" },
  { value: "support", label: "Supporting the ongoing work" },
  { value: "other", label: "Other / general question" },
];

export default function MissionsContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("short-term");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, interest, message }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
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
            <svg className="w-6 h-6 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </div>
        <p className="text-fg font-semibold text-lg">You&apos;re all set!</p>
        <p className="text-fg-muted text-sm leading-relaxed max-w-sm mx-auto">
          Thanks for reaching out. Our missions office will follow up soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-fg">
            Name <span className="text-accent-text">*</span>
          </label>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            className={inputClass}
          />
        </div>
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
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-fg">
          I&apos;m interested in <span className="text-accent-text">*</span>
        </label>
        <select
          required
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          className={inputClass}
        >
          {INTERESTS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-fg">
          Message <span className="text-accent-text">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us a little about what you're looking for..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && <p className="text-danger-text text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto font-condensed font-700 tracking-wide uppercase text-sm px-8 py-3.5 rounded-full transition disabled:opacity-50"
        style={{ background: "var(--accent-solid)", color: "var(--fg-on-accent)" }}
      >
        {submitting ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
