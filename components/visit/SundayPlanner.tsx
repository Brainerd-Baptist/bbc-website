"use client";

import { useState } from "react";

// ── Types ───────────────────────────────────────────────────
type WhoOption = {
  id: string;
  label: string;
  sub: string;
  needsKids?: boolean;
};

type PlanResult = {
  plan: string[];
  hasKidsCheckIn: boolean;
  greeting: string;
};

// ── Data ────────────────────────────────────────────────────
const WHO_OPTIONS: WhoOption[] = [
  { id: "adults",    label: "Just adults",            sub: "Couple, individual, or group" },
  { id: "infant",    label: "Infant or toddler",      sub: "6 weeks through PreK",          needsKids: true },
  { id: "elementary",label: "Elementary-age kids",    sub: "Kindergarten through 5th grade", needsKids: true },
  { id: "student",   label: "Middle or high schooler", sub: "6th through 12th grade" },
  { id: "college",   label: "College or young adult",  sub: "18s and up" },
];

const TIME_OPTIONS = [
  { id: "8:30",  label: "8:30 AM",  sub: "Choir & Orchestra" },
  { id: "11:00", label: "11:00 AM", sub: "Band Led" },
  { id: "either",label: "Not sure", sub: "Either works for us" },
];

const CONNECT_OPTIONS = [
  { id: "yes",   label: "Yes — tell me about Life Groups", sub: "Small-group Bible study at 9:45 AM between services" },
  { id: "maybe", label: "Maybe — what is that?",           sub: "I'm curious but not sure it's for me" },
  { id: "no",    label: "Just the worship service for now", sub: "We'll keep it simple this visit" },
];

// ── Small UI pieces ──────────────────────────────────────────
function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150"
      style={{
        borderColor: selected ? "var(--accent)" : "var(--border-strong)",
        background: selected ? "var(--accent-bg)" : "var(--surface-raised)",
        color: selected ? "var(--fg)" : "var(--fg)",
      }}
    >
      {children}
    </button>
  );
}

function StepLabel({ num, label }: { num: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="font-condensed font-900 leading-none flex-shrink-0"
        style={{ fontSize: "2rem", color: "var(--accent-text)", opacity: 0.4 }}
      >
        {num}
      </span>
      <p className="font-condensed font-700 text-fg" style={{ fontSize: "1.15rem" }}>
        {label}
      </p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export default function SundayPlanner() {
  const [who, setWho] = useState<string[]>([]);
  const [time, setTime] = useState<string>("");
  const [connect, setConnect] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  function toggleWho(id: string) {
    setWho((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (who.length === 0 || !time) return;
    setLoading(true);
    setError("");
    setResult(null);

    // Build human-readable labels
    const whoLabels = who.map(
      (id) => WHO_OPTIONS.find((o) => o.id === id)?.label ?? id
    );

    try {
      const res = await fetch("/api/sunday-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ who: whoLabels, time, connect }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data: PlanResult = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Try again or just ask us when you arrive — we'll be glad to help.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setWho([]);
    setTime("");
    setConnect("");
    setResult(null);
    setError("");
    setEmail("");
    setEmailSent(false);
  }

  function handleEmailSend() {
    if (!result || !email) return;
    const planText = result.plan.join("\n• ");
    const subject = encodeURIComponent("Your Sunday Plan — Brainerd Baptist Church");
    const body = encodeURIComponent(
      `Hi!\n\nHere's your Sunday plan for visiting Brainerd Baptist Church:\n\n• ${planText}\n\n${result.greeting}\n\n${
        result.hasKidsCheckIn
          ? "Pre-register your kids to skip the check-in line:\nhttps://brainerdbaptist.churchcenter.com/people/forms/376960\n\n"
          : ""
      }We're at 300 Brookfield Ave, Chattanooga, TN 37411.\n\nSee you Sunday!`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
    setEmailSent(true);
  }

  const canSubmit = who.length > 0 && time !== "" && connect !== "";

  return (
    <section className="py-20 px-6" style={{ background: "var(--surface-sunken)" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <p className="eyebrow text-center mb-3">Before You Arrive</p>
        <h2
          className="font-condensed font-900 text-fg text-center mb-3"
          style={{ fontSize: "clamp(2.4rem, 6vw, 3.6rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
        >
          Plan Your First Sunday
        </h2>
        <p className="text-fg-muted text-center mb-12 max-w-sm mx-auto text-sm">
          Two quick questions and we'll give you a specific plan — where to park, where to go, what to expect.
        </p>

        {/* ── Result view ── */}
        {result ? (
          <div className="bg-surface-raised rounded-2xl p-8 shadow-sm border border-border">
            {/* Plan bullets */}
            <p className="eyebrow mb-5">Your Sunday Plan</p>
            <ul className="space-y-4 mb-6">
              {result.plan.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
                    style={{ background: "var(--accent)" }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-fg text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ul>

            {/* PCO pre-registration callout */}
            {result.hasKidsCheckIn && (
              <div
                className="rounded-xl p-5 mb-6 border-l-4"
                style={{ background: "var(--accent-bg)", borderColor: "var(--accent)" }}
              >
                <p className="font-condensed font-800 text-fg mb-1" style={{ fontSize: "1.05rem" }}>
                  Skip the check-in line
                </p>
                <p className="text-fg-muted text-sm mb-3">
                  Pre-register your kids before Sunday and you'll be in and out of check-in in seconds.
                </p>
                <a
                  href="https://brainerdbaptist.churchcenter.com/people/forms/376960"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-condensed font-700 tracking-wide uppercase text-sm bg-accent-solid hover:bg-accent-solid-hover text-white px-5 py-2.5 rounded-full transition-colors"
                >
                  Pre-Register Your Family →
                </a>
              </div>
            )}

            {/* Greeting */}
            <p className="text-fg-muted text-sm italic border-t border-border pt-5 mb-6">
              {result.greeting}
            </p>

            {/* Optional email */}
            {!emailSent ? (
              <div>
                <p className="text-xs font-semibold text-fg-muted uppercase tracking-widest mb-3">
                  Want this in your inbox?
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border-strong text-sm text-fg placeholder:text-fg-subtle focus:border-accent"
                  />
                  <button
                    onClick={handleEmailSend}
                    disabled={!email}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40"
                    style={{ background: "var(--color-brand-navy)" }}
                  >
                    Send
                  </button>
                </div>
                <p className="text-fg-subtle text-xs mt-2">
                  One email, just your plan. Nothing else.
                </p>
              </div>
            ) : (
              <p className="text-accent-text text-sm font-semibold">✓ Opening your email app now</p>
            )}

            {/* Reset */}
            <button
              onClick={handleReset}
              className="mt-6 text-fg-muted text-xs hover:text-fg-muted transition-colors underline underline-offset-2"
            >
              Start over
            </button>
          </div>
        ) : (
          /* ── Question view ── */
          <div className="bg-surface-raised rounded-2xl p-8 shadow-sm border border-border space-y-10">
            {/* Q1 */}
            <div>
              <StepLabel num={1} label="Who's coming with you?" />
              <div className="space-y-2">
                {WHO_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.id}
                    selected={who.includes(opt.id)}
                    onClick={() => toggleWho(opt.id)}
                  >
                    <span className="font-condensed font-700 text-fg" style={{ fontSize: "1.05rem" }}>
                      {opt.label}
                    </span>
                    <span className="block text-fg-muted text-xs mt-0.5">{opt.sub}</span>
                  </Chip>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div>
              <StepLabel num={2} label="Which service time works better?" />
              <div className="space-y-2">
                {TIME_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.id}
                    selected={time === opt.id}
                    onClick={() => setTime(opt.id)}
                  >
                    <span className="font-condensed font-700 text-fg" style={{ fontSize: "1.05rem" }}>
                      {opt.label}
                    </span>
                    <span className="block text-fg-muted text-xs mt-0.5">{opt.sub}</span>
                  </Chip>
                ))}
              </div>
            </div>

            {/* Q3 */}
            <div>
              <StepLabel num={3} label="Want to connect beyond Sunday worship?" />
              <div className="space-y-2">
                {CONNECT_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.id}
                    selected={connect === opt.id}
                    onClick={() => setConnect(opt.id)}
                  >
                    <span className="font-condensed font-700 text-fg" style={{ fontSize: "1.05rem" }}>
                      {opt.label}
                    </span>
                    <span className="block text-fg-muted text-xs mt-0.5">{opt.sub}</span>
                  </Chip>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="w-full font-condensed font-700 tracking-wide uppercase text-white py-4 rounded-full transition-all disabled:opacity-40"
              style={{
                background: canSubmit && !loading ? "var(--accent)" : "var(--accent)",
                fontSize: "1rem",
              }}
            >
              {loading ? "Building your plan…" : "Get My Sunday Plan"}
            </button>

            {error && (
              <p className="text-sm text-danger-text text-center -mt-4">{error}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
