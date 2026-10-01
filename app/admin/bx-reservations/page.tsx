"use client";

/**
 * /admin/bx-reservations — MOCKUP ONLY, not wired to real data.
 *
 * Local prototype of the BX reservations admin dashboard discussed with
 * Josiah on 2026-09-24: a queue of incoming requests with approve /
 * decline / request-info actions, plus a combined calendar view showing
 * requested + confirmed bookings together. All data below is fake —
 * this exists purely to react to the shape of the UI before any real
 * PCO/Gym Insight wiring is designed.
 */

import { useState } from "react";

type Status = "requested" | "proposal_sent" | "deposit_received" | "confirmed" | "declined";

interface MockRequest {
  id: string;
  eventName: string;
  org: string;
  contact: string;
  member: boolean;
  room: string;
  date: string;
  time: string;
  guests: number;
  status: Status;
  total: number;
  submitted: string;
}

const STATUS_META: Record<Status, { label: string; bg: string; fg: string }> = {
  requested:        { label: "Requested",       bg: "var(--accent-bg)",                 fg: "var(--accent-text)" },
  proposal_sent:    { label: "Proposal Sent",   bg: "rgba(180, 130, 0, 0.12)",           fg: "#8a6400" },
  deposit_received: { label: "Deposit Received", bg: "rgba(0, 130, 90, 0.12)",           fg: "#0a7a56" },
  confirmed:        { label: "Confirmed",       bg: "var(--success-bg, rgba(0,150,90,.14))", fg: "var(--success-text, #0a7a56)" },
  declined:         { label: "Declined",        bg: "rgba(200, 40, 40, 0.10)",           fg: "#b02a2a" },
};

const INITIAL: MockRequest[] = [
  { id: "BX-1042", eventName: "Thompson Wedding Reception", org: "Thompson Family", contact: "Casey Thompson", member: true,  room: "The Crossing", date: "Nov 14, 2026", time: "5:00 – 10:00 PM", guests: 180, status: "requested", total: 1050, submitted: "2 hours ago" },
  { id: "BX-1041", eventName: "Chattanooga Realtors Mixer", org: "GCAR", contact: "Dana Whitfield", member: false, room: "CrossTies Cafe", date: "Oct 3, 2026", time: "6:00 – 9:00 PM", guests: 45, status: "proposal_sent", total: 400, submitted: "1 day ago" },
  { id: "BX-1040", eventName: "First Birthday Party", org: "Ruiz Family", contact: "Maria Ruiz", member: false, room: "CrossPointe B", date: "Oct 10, 2026", time: "1:00 – 5:00 PM", guests: 25, status: "deposit_received", total: 250, submitted: "3 days ago" },
  { id: "BX-1039", eventName: "Small Group Leader Training", org: "Brainerd Baptist", contact: "Josiah King", member: true,  room: "The Loft", date: "Oct 17, 2026", time: "9:00 AM – 12:00 PM", guests: 60, status: "requested", total: 275, submitted: "4 days ago" },
  { id: "BX-1038", eventName: "Nonprofit Board Retreat", org: "Chattanooga Reads", contact: "Priya Patel", member: false, room: "CrossView", date: "Nov 21, 2026", time: "8:00 AM – 4:00 PM", guests: 18, status: "confirmed", total: 600, submitted: "1 week ago" },
  { id: "BX-1037", eventName: "Birthday — bounce house request", org: "Alvarez Family", contact: "Sofia Alvarez", member: false, room: "The Crossing", date: "Nov 15, 2026", time: "2:00 – 6:00 PM", guests: 90, status: "declined", total: 800, submitted: "1 week ago" },
];

// Same-day mini agenda, mixing "soft" flexible standing uses (shown plainly
// to staff, unlike the public availability view) with hard confirmed events.
const AGENDA = [
  { room: "The Crossing", label: "Thompson Wedding Reception", kind: "requested", time: "Nov 14 · 5–10 PM" },
  { room: "The Loft", label: "Women's Bible Study (flexible)", kind: "soft", time: "Weekly · Tue 9–11 AM" },
  { room: "CrossView", label: "Chattanooga Reads Retreat", kind: "confirmed", time: "Nov 21 · 8 AM–4 PM" },
  { room: "CrossPointe A", label: "ESL Class (flexible)", kind: "soft", time: "Weekly · Thu 6–8 PM" },
  { room: "CrossTies Cafe", label: "GCAR Mixer", kind: "proposal_sent", time: "Oct 3 · 6–9 PM" },
];

const AGENDA_META: Record<string, { bg: string; fg: string; label: string }> = {
  requested:     { bg: "var(--accent-bg)", fg: "var(--accent-text)", label: "Requested" },
  soft:          { bg: "rgba(140, 140, 140, 0.12)", fg: "var(--fg-muted)", label: "Standing use · flexible" },
  confirmed:     { bg: "rgba(0, 150, 90, 0.12)", fg: "#0a7a56", label: "Confirmed" },
  proposal_sent: { bg: "rgba(180, 130, 0, 0.12)", fg: "#8a6400", label: "Proposal Sent" },
};

export default function BXReservationsAdmin() {
  const [requests, setRequests] = useState(INITIAL);
  const [filter, setFilter] = useState<"all" | Status>("all");

  function setStatus(id: string, status: Status) {
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  const visible = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const pendingCount = requests.filter((r) => r.status === "requested").length;
  const awaitingDeposit = requests.filter((r) => r.status === "proposal_sent").length;
  const revenueThisMonth = requests
    .filter((r) => r.status === "confirmed" || r.status === "deposit_received")
    .reduce((sum, r) => sum + r.total, 0);

  const fg = "var(--fg)";
  const cardBg = "var(--surface-raised)";
  const border = "1px solid var(--border)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", paddingBottom: "4rem" }}>

      {/* Header */}
      <div style={{ background: "var(--brand-band)", padding: "5rem 1.5rem 2.5rem" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--fg-on-dark-muted)", fontSize: "0.8rem", marginBottom: "2rem", textDecoration: "none" }}>
            ← Brainerd Baptist
          </a>
          <p style={{ color: "var(--accent)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Internal · Mockup, not live data
          </p>
          <h1 style={{ color: "var(--fg-on-dark)", fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0 }}>
            BX Reservations
          </h1>
          <p style={{ color: "var(--fg-on-dark-muted)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
            Requests, availability, and status — in one place instead of a spreadsheet.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Pending Review", value: pendingCount, accent: true },
            { label: "Awaiting Deposit", value: awaitingDeposit },
            { label: "Confirmed This Month", value: requests.filter((r) => r.status === "confirmed").length },
            { label: "Revenue (Confirmed + Deposit)", value: `$${revenueThisMonth.toLocaleString()}` },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{ background: cardBg, border, borderRadius: "1rem", padding: "1.25rem 1.5rem" }}>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.25rem" }}>{label}</p>
              <p style={{ color: accent ? "var(--accent-text)" : fg, fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>

          {/* ── Queue ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Request Queue
              </p>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {(["all", "requested", "proposal_sent", "deposit_received", "confirmed", "declined"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "0.3rem 0.7rem",
                      borderRadius: "999px",
                      border: filter === f ? "1px solid var(--accent)" : "1px solid var(--border)",
                      background: filter === f ? "var(--accent-bg)" : "transparent",
                      color: filter === f ? "var(--accent-text)" : "var(--fg-muted)",
                      cursor: "pointer",
                    }}
                  >
                    {f === "all" ? "All" : STATUS_META[f].label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {visible.map((r) => {
                const meta = STATUS_META[r.status];
                return (
                  <div key={r.id} style={{ background: cardBg, border, borderRadius: "1rem", padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.6rem" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.2rem" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--fg-subtle)", fontWeight: 600 }}>{r.id}</span>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              padding: "0.15rem 0.55rem",
                              borderRadius: "999px",
                              background: meta.bg,
                              color: meta.fg,
                            }}
                          >
                            {meta.label}
                          </span>
                          {!r.member && (
                            <span style={{ fontSize: "0.65rem", color: "var(--fg-subtle)", border: "1px solid var(--border)", borderRadius: "999px", padding: "0.1rem 0.5rem" }}>
                              Non-member
                            </span>
                          )}
                        </div>
                        <p style={{ color: fg, fontWeight: 700, fontSize: "0.95rem" }}>{r.eventName}</p>
                        <p style={{ color: "var(--fg-muted)", fontSize: "0.8rem" }}>{r.org} · {r.contact}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ color: fg, fontWeight: 800, fontSize: "1.1rem" }}>${r.total.toLocaleString()}</p>
                        <p style={{ color: "var(--fg-subtle)", fontSize: "0.7rem" }}>submitted {r.submitted}</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1.25rem", fontSize: "0.8rem", color: "var(--fg-muted)", marginBottom: "0.9rem" }}>
                      <span>📍 {r.room}</span>
                      <span>📅 {r.date}</span>
                      <span>🕐 {r.time}</span>
                      <span>👥 {r.guests} guests</span>
                    </div>

                    {r.status !== "declined" && r.status !== "confirmed" && (
                      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                        {r.status === "requested" && (
                          <button
                            onClick={() => setStatus(r.id, "proposal_sent")}
                            style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.45rem 0.9rem", borderRadius: "0.6rem", background: "var(--accent-solid)", color: "var(--fg-on-accent)", border: "none", cursor: "pointer" }}
                          >
                            Approve → Send Proposal
                          </button>
                        )}
                        {r.status === "proposal_sent" && (
                          <button
                            onClick={() => setStatus(r.id, "deposit_received")}
                            style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.45rem 0.9rem", borderRadius: "0.6rem", background: "var(--accent-solid)", color: "var(--fg-on-accent)", border: "none", cursor: "pointer" }}
                          >
                            Mark Deposit Received
                          </button>
                        )}
                        {r.status === "deposit_received" && (
                          <button
                            onClick={() => setStatus(r.id, "confirmed")}
                            style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.45rem 0.9rem", borderRadius: "0.6rem", background: "var(--accent-solid)", color: "var(--fg-on-accent)", border: "none", cursor: "pointer" }}
                          >
                            Confirm Booking
                          </button>
                        )}
                        <button
                          style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.45rem 0.9rem", borderRadius: "0.6rem", background: "transparent", color: "var(--fg)", border: "1px solid var(--border)", cursor: "pointer" }}
                        >
                          Request Info
                        </button>
                        <button
                          onClick={() => setStatus(r.id, "declined")}
                          style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.45rem 0.9rem", borderRadius: "0.6rem", background: "transparent", color: "#b02a2a", border: "1px solid rgba(200,40,40,0.25)", cursor: "pointer" }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {visible.length === 0 && (
                <div style={{ background: cardBg, border, borderRadius: "1rem", padding: "2.5rem", textAlign: "center", color: "var(--fg-muted)", fontSize: "0.875rem" }}>
                  Nothing in this view.
                </div>
              )}
            </div>
          </div>

          {/* ── Agenda / calendar sidebar ── */}
          <div style={{ position: "sticky", top: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: cardBg, border, borderRadius: "1rem", padding: "1.25rem 1.5rem" }}>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
                Combined Calendar (sample)
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                {AGENDA.map((a, i) => {
                  const meta = AGENDA_META[a.kind];
                  return (
                    <div key={i} style={{ borderLeft: `3px solid ${meta.fg}`, paddingLeft: "0.7rem" }}>
                      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: meta.fg, marginBottom: "0.1rem" }}>{meta.label}</p>
                      <p style={{ fontSize: "0.82rem", fontWeight: 600, color: fg }}>{a.label}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--fg-muted)" }}>{a.room} · {a.time}</p>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: "0.7rem", color: "var(--fg-subtle)", marginTop: "1rem", lineHeight: 1.5 }}>
                Staff see real event names and the flexible/soft-block flag here — this
                is different from the public view, which never shows what's actually booked.
              </p>
            </div>

            <div style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: "1rem", padding: "1.25rem 1.5rem" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-text)", marginBottom: "0.4rem" }}>Open question</p>
              <p style={{ fontSize: "0.78rem", color: "var(--fg-muted)", lineHeight: 1.5 }}>
                Payment status here ("Deposit Received") is set manually until we know
                whether Gym Insight can confirm payments automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
