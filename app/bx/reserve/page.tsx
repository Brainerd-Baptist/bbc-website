"use client";

/**
 * /bx/reserve — MOCKUP ONLY, not wired to real data, not linked from /bx yet.
 *
 * Local prototype of the redesigned public BX reservation flow discussed
 * with Josiah on 2026-09-24: conditional multi-step form, an availability
 * signal pulled (in the real version) from PCO Calendar without exposing
 * booking details, a live cost estimate built from the actual BX rate
 * sheet, room-setup presets, and a real confirmation state. Nothing here
 * submits anywhere — nothing is committed or pushed per standing instruction.
 */

import { useMemo, useState } from "react";

// ── Rate table, transcribed from the BX "Room Rental Information" sheet ──
interface Room {
  name: string;
  nonProfit4hr: number;
  profit4hr: number;
  extraHrNonProfit: number;
  extraHrProfit: number;
  theaterCap: number | null;
  banquetCap: number | null;
  avNote: string;
}

const ROOMS: Room[] = [
  { name: "The Crossing",   nonProfit4hr: 600, profit4hr: 800, extraHrNonProfit: 75, extraHrProfit: 75, theaterCap: 400, banquetCap: 300, avNote: "Complete AV Package available (tech required)" },
  { name: "The Loft",       nonProfit4hr: 275, profit4hr: 475, extraHrNonProfit: 50, extraHrProfit: 50, theaterCap: 100, banquetCap: 80,  avNote: "AV setup fee $75/event" },
  { name: "CrossView",      nonProfit4hr: 200, profit4hr: 250, extraHrNonProfit: 25, extraHrProfit: 25, theaterCap: 50,  banquetCap: 40,  avNote: "Large-screen TV + HDMI included" },
  { name: "CrossTies Cafe", nonProfit4hr: 175, profit4hr: 225, extraHrNonProfit: 25, extraHrProfit: 25, theaterCap: 60,  banquetCap: 50,  avNote: "Large-screen TV + HDMI included" },
  { name: "CrossPointe A",  nonProfit4hr: 150, profit4hr: 200, extraHrNonProfit: 25, extraHrProfit: 25, theaterCap: 40,  banquetCap: 30,  avNote: "AV setup fee $50/event" },
  { name: "CrossPointe B",  nonProfit4hr: 150, profit4hr: 200, extraHrNonProfit: 25, extraHrProfit: 25, theaterCap: 40,  banquetCap: 30,  avNote: "AV setup fee $50/event" },
  { name: "CrossPointe C",  nonProfit4hr: 150, profit4hr: 200, extraHrNonProfit: 25, extraHrProfit: 25, theaterCap: 40,  banquetCap: 30,  avNote: "AV setup fee $50/event" },
  { name: "CrossTies A",    nonProfit4hr: 125, profit4hr: 150, extraHrNonProfit: 25, extraHrProfit: 25, theaterCap: 20,  banquetCap: 10,  avNote: "Large-screen TV + HDMI included" },
  { name: "CrossTies B",    nonProfit4hr: 125, profit4hr: 150, extraHrNonProfit: 25, extraHrProfit: 25, theaterCap: 20,  banquetCap: 10,  avNote: "Large-screen TV + HDMI included" },
  { name: "CrossTies C",    nonProfit4hr: 125, profit4hr: 150, extraHrNonProfit: 25, extraHrProfit: 25, theaterCap: 20,  banquetCap: 10,  avNote: "Large-screen TV + HDMI included" },
  { name: "Soccer Field",   nonProfit4hr: 0,   profit4hr: 0,   extraHrNonProfit: 0,  extraHrProfit: 0,  theaterCap: null, banquetCap: null, avNote: "Not on current rate sheet — contact us for pricing" },
  { name: "Basketball Courts", nonProfit4hr: 0, profit4hr: 0,  extraHrNonProfit: 0,  extraHrProfit: 0,  theaterCap: null, banquetCap: null, avNote: "Not on current rate sheet — contact us for pricing" },
];

const SETUPS = [
  { key: "classroom", label: "Classroom", desc: "6' tables, chairs facing one direction.", usesCapacity: "theater" as const },
  { key: "banquet",   label: "Banquet / Rounds", desc: "72\" round tables, 8–10 per table.", usesCapacity: "banquet" as const },
  { key: "theater",   label: "Theater", desc: "Chairs only, rows facing forward.", usesCapacity: "theater" as const },
  { key: "ushape",    label: "U-Shape", desc: "6' tables in an open-ended U.", usesCapacity: "theater" as const },
];

type Availability = "available" | "ask" | "unavailable";

// Deterministic mock availability so the same room always shows the same
// state during the demo, standing in for a real PCO Calendar lookup.
function mockAvailability(room: string): Availability {
  let h = 0;
  for (const c of room) h = (h * 31 + c.charCodeAt(0)) % 97;
  if (h % 5 === 0) return "unavailable";
  if (h % 3 === 0) return "ask";
  return "available";
}

const AVAIL_META: Record<Availability, { label: string; sub: string; bg: string; fg: string; dot: string }> = {
  available:   { label: "Available",  sub: "Open on this date.",                                    bg: "rgba(0,150,90,0.10)",  fg: "#0a7a56", dot: "#1fae7a" },
  ask:         { label: "Ask us",     sub: "A flexible standing use is here — may be able to move.", bg: "rgba(180,130,0,0.10)", fg: "#8a6400", dot: "#c99a1a" },
  unavailable: { label: "Unavailable", sub: "This time is booked.",                                  bg: "rgba(200,40,40,0.08)", fg: "#b02a2a", dot: "#c94040" },
};

const STEPS = ["Your Info", "Event Details", "Setup & Extras", "Policies", "Review"];

export default function BXReservePage() {
  const [step, setStep] = useState(0);

  // Step 1 — contact
  const [orgName, setOrgName] = useState("");
  const [isProfit, setIsProfit] = useState<"nonprofit" | "profit">("nonprofit");
  const [contactName, setContactName] = useState("");
  const [isMember, setIsMember] = useState<"yes" | "no" | "">("");
  const [email, setEmail] = useState("");

  // Step 2 — event
  const [eventName, setEventName] = useState("");
  const [guests, setGuests] = useState<number>(25);
  const [date, setDate] = useState("");
  const [roomName, setRoomName] = useState(ROOMS[0].name);
  const [startHour, setStartHour] = useState(4); // hours of use
  const room = useMemo(() => ROOMS.find((r) => r.name === roomName)!, [roomName]);
  const availability = useMemo(() => (date ? mockAvailability(roomName) : null), [roomName, date]);

  // Step 3 — setup & extras
  const [setupKey, setSetupKey] = useState("banquet");
  const [tablecloths, setTablecloths] = useState(0);
  const [avPackage, setAvPackage] = useState<"none" | "mic" | "complete">("none");

  // Step 4 — policies
  const [policiesRead, setPoliciesRead] = useState(false);
  const [policiesExpanded, setPoliciesExpanded] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  // ── Cost estimate ──
  const estimate = useMemo(() => {
    const base = isProfit === "profit" ? room.profit4hr : room.nonProfit4hr;
    const extraHrRate = isProfit === "profit" ? room.extraHrProfit : room.extraHrNonProfit;
    const extraHours = Math.max(0, startHour - 4);
    const roomCost = base + extraHours * extraHrRate;
    const tableclothCost = tablecloths * 13;
    let avCost = 0;
    if (avPackage === "mic") avCost = 35;
    if (avPackage === "complete" && room.name === "The Crossing") avCost = 425;
    else if (avPackage === "complete" && room.name === "The Loft") avCost = 75;
    else if (avPackage === "complete" && room.name.startsWith("CrossPointe")) avCost = 50;
    const total = roomCost + tableclothCost + avCost;
    return { roomCost, tableclothCost, avCost, total, extraHours, extraHrRate };
  }, [room, isProfit, startHour, tablecloths, avPackage]);

  const cap = room[SETUPS.find((s) => s.key === setupKey)!.usesCapacity === "theater" ? "theaterCap" : "banquetCap"];
  const overCapacity = cap !== null && guests > cap;

  const fg = "var(--fg)";
  const cardBg = "var(--surface-raised)";
  const border = "1px solid var(--border)";

  function next() { setStep((s) => Math.min(STEPS.length - 1, s + 1)); }
  function back() { setStep((s) => Math.max(0, s - 1)); }

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,150,90,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "1.75rem" }}>✓</div>
          <p style={{ color: "var(--accent-text)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Request Submitted — Mockup
          </p>
          <h1 style={{ color: fg, fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800, fontSize: "2rem", marginBottom: "0.75rem" }}>
            Reference #BX-1043
          </h1>
          <p style={{ color: "var(--fg-muted)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            We've sent a confirmation to <strong>{email || "your email"}</strong> with everything you submitted.
            BX staff will review availability for <strong>{room.name}</strong> on <strong>{date || "your requested date"}</strong> and
            follow up within 3 business days with a proposal and next steps.
          </p>
          <div style={{ background: cardBg, border, borderRadius: "1rem", padding: "1.25rem 1.5rem", textAlign: "left", marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Estimated Total</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color: fg }}>${estimate.total.toLocaleString()}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--fg-subtle)", marginTop: "0.25rem" }}>Final quote confirmed in your proposal. 25% deposit due at signing.</p>
          </div>
          <button
            onClick={() => { setSubmitted(false); setStep(0); }}
            style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-text)", background: "none", border: "none", cursor: "pointer" }}
          >
            ← Start a new mock request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", paddingBottom: "5rem" }}>

      {/* Header */}
      <div style={{ background: "var(--brand-band)", padding: "4.5rem 1.5rem 2rem" }}>
        <div style={{ maxWidth: "60rem", margin: "0 auto" }}>
          <p style={{ color: "var(--accent)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Mockup — nothing here submits anywhere
          </p>
          <h1 style={{ color: "var(--fg-on-dark)", fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.25rem)", letterSpacing: "-0.03em", margin: 0 }}>
            Reserve a BX Room
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: "60rem", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {STEPS.map((label, i) => (
            <div
              key={label}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                fontSize: "0.75rem", fontWeight: 700,
                color: i === step ? "var(--accent-text)" : i < step ? fg : "var(--fg-subtle)",
              }}
            >
              <span
                style={{
                  width: 20, height: 20, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem",
                  background: i <= step ? "var(--accent-solid)" : "var(--hover-subtle)",
                  color: i <= step ? "var(--fg-on-accent)" : "var(--fg-subtle)",
                }}
              >
                {i < step ? "✓" : i + 1}
              </span>
              {label}
              {i < STEPS.length - 1 && <span style={{ color: "var(--fg-subtle)", margin: "0 0.25rem" }}>—</span>}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>

          {/* ── Form panel ── */}
          <div style={{ background: cardBg, border, borderRadius: "1rem", padding: "2rem" }}>

            {step === 0 && (
              <div>
                <h2 style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800, fontSize: "1.4rem", color: fg, marginBottom: "1.25rem" }}>Your Info</h2>
                <Field label="Individual or Organization Name">
                  <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Thompson Family, or GCAR" style={inputStyle} />
                </Field>
                <Field label="Is this a profit or non-profit request?">
                  <div style={{ display: "flex", gap: "0.6rem" }}>
                    {(["nonprofit", "profit"] as const).map((v) => (
                      <button key={v} onClick={() => setIsProfit(v)} style={pillButton(isProfit === v)}>
                        {v === "nonprofit" ? "Non-Profit" : "Profit / Commercial"}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Contact Person Name">
                  <input value={contactName} onChange={(e) => setContactName(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Is this person a Brainerd Baptist Church member?">
                  <div style={{ display: "flex", gap: "0.6rem" }}>
                    {(["yes", "no"] as const).map((v) => (
                      <button key={v} onClick={() => setIsMember(v)} style={pillButton(isMember === v)}>
                        {v === "yes" ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Email">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                </Field>
                <p style={{ fontSize: "0.75rem", color: "var(--fg-subtle)", marginTop: "0.5rem" }}>
                  We'll email you a link to this reservation — no password needed unless you want to save an account for next time.
                </p>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800, fontSize: "1.4rem", color: fg, marginBottom: "1.25rem" }}>Event Details</h2>
                <Field label="Event Name">
                  <input value={eventName} onChange={(e) => setEventName(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Approximate Number of Guests">
                  <input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} style={inputStyle} />
                </Field>
                <Field label="Requested Date (no Saturday or Sunday events)">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Hours needed (4 hrs included in base rate)">
                  <input type="number" min={1} max={12} value={startHour} onChange={(e) => setStartHour(Number(e.target.value))} style={inputStyle} />
                </Field>
                <Field label="Room">
                  <select value={roomName} onChange={(e) => setRoomName(e.target.value)} style={inputStyle}>
                    {ROOMS.map((r) => <option key={r.name} value={r.name}>{r.name}</option>)}
                  </select>
                </Field>

                {date && availability && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: AVAIL_META[availability].bg, borderRadius: "0.75rem", padding: "0.75rem 1rem", marginTop: "0.5rem" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: AVAIL_META[availability].dot, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "0.8rem", fontWeight: 700, color: AVAIL_META[availability].fg }}>{AVAIL_META[availability].label}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>{AVAIL_META[availability].sub}</p>
                    </div>
                  </div>
                )}
                {!date && (
                  <p style={{ fontSize: "0.75rem", color: "var(--fg-subtle)" }}>Pick a date to see availability for this room.</p>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800, fontSize: "1.4rem", color: fg, marginBottom: "1.25rem" }}>Setup &amp; Extras</h2>

                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Room Layout</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  {SETUPS.map((s) => {
                    const capForThis = room[s.usesCapacity === "theater" ? "theaterCap" : "banquetCap"];
                    return (
                      <button
                        key={s.key}
                        onClick={() => setSetupKey(s.key)}
                        style={{
                          textAlign: "left", padding: "1rem", borderRadius: "0.75rem", cursor: "pointer",
                          border: setupKey === s.key ? "2px solid var(--accent)" : "1px solid var(--border)",
                          background: setupKey === s.key ? "var(--accent-bg)" : "transparent",
                        }}
                      >
                        <p style={{ fontWeight: 700, fontSize: "0.85rem", color: fg }}>{s.label}</p>
                        <p style={{ fontSize: "0.72rem", color: "var(--fg-muted)", marginBottom: "0.4rem" }}>{s.desc}</p>
                        <p style={{ fontSize: "0.7rem", color: "var(--fg-subtle)" }}>
                          {capForThis !== null ? `Fits up to ${capForThis} in ${room.name}` : "Capacity not listed for this space"}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {overCapacity && (
                  <p style={{ fontSize: "0.78rem", color: "#b02a2a", background: "rgba(200,40,40,0.08)", borderRadius: "0.6rem", padding: "0.6rem 0.9rem", marginBottom: "1.25rem" }}>
                    {guests} guests is over {room.name}'s capacity for this layout ({cap}). Consider a larger room or a different setup.
                  </p>
                )}

                <Field label="Tablecloths needed ($13.00 each)">
                  <input type="number" min={0} value={tablecloths} onChange={(e) => setTablecloths(Number(e.target.value))} style={inputStyle} />
                </Field>

                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "1.25rem 0 0.75rem" }}>A/V</p>
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                  {(["none", "mic", "complete"] as const).map((v) => (
                    <button key={v} onClick={() => setAvPackage(v)} style={pillButton(avPackage === v)}>
                      {v === "none" ? "No A/V needed" : v === "mic" ? "Handheld Mic ($35)" : "Full A/V Package"}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: "0.72rem", color: "var(--fg-subtle)", marginTop: "0.5rem" }}>{room.avNote}</p>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800, fontSize: "1.4rem", color: fg, marginBottom: "1.25rem" }}>Policies</h2>
                <div style={{ background: "var(--surface-sunken)", borderRadius: "0.75rem", padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: fg, marginBottom: "0.5rem" }}>The short version:</p>
                  <ul style={{ fontSize: "0.8rem", color: "var(--fg-muted)", lineHeight: 1.7, paddingLeft: "1.1rem" }}>
                    <li>No alcohol, dancing, or smoking on the property.</li>
                    <li>Weddings are limited to Brainerd Baptist Church members.</li>
                    <li>A 25% deposit is due with your signed proposal; it's forfeited if canceled within 60 days of your date.</li>
                    <li>Music must be pre-approved at least 48 hours before your event.</li>
                    <li>You're responsible for any damage to the space or its equipment.</li>
                  </ul>
                  <button onClick={() => setPoliciesExpanded((e) => !e)} style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent-text)", background: "none", border: "none", cursor: "pointer", marginTop: "0.75rem" }}>
                    {policiesExpanded ? "Hide full policy text ▲" : "Read the full policy text ▼"}
                  </button>
                  {policiesExpanded && (
                    <p style={{ fontSize: "0.75rem", color: "var(--fg-subtle)", marginTop: "0.75rem", lineHeight: 1.6 }}>
                      [Full Terms of Use and Event Policies &amp; Procedures text would render here, expandable
                      rather than paginated across three form screens as it is today.]
                    </p>
                  )}
                </div>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.85rem", color: fg, cursor: "pointer" }}>
                  <input type="checkbox" checked={policiesRead} onChange={(e) => setPoliciesRead(e.target.checked)} style={{ marginTop: "0.2rem" }} />
                  I have read and agree to Brainerd Crossroads' Terms of Use and Event Policies.
                </label>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800, fontSize: "1.4rem", color: fg, marginBottom: "1.25rem" }}>Review &amp; Submit</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "var(--fg-muted)", marginBottom: "1.5rem" }}>
                  <ReviewRow label="Requested by" value={`${orgName || "—"} (${contactName || "—"})`} />
                  <ReviewRow label="Type" value={isProfit === "profit" ? "Profit / Commercial" : "Non-Profit"} />
                  <ReviewRow label="Event" value={eventName || "—"} />
                  <ReviewRow label="Room" value={roomName} />
                  <ReviewRow label="Date" value={date || "—"} />
                  <ReviewRow label="Guests" value={String(guests)} />
                  <ReviewRow label="Setup" value={SETUPS.find((s) => s.key === setupKey)!.label} />
                </div>
                <button
                  disabled={!policiesRead}
                  onClick={() => setSubmitted(true)}
                  style={{
                    width: "100%", padding: "0.9rem", borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.9rem",
                    border: "none", cursor: policiesRead ? "pointer" : "not-allowed",
                    background: policiesRead ? "var(--accent-solid)" : "var(--hover-subtle)",
                    color: policiesRead ? "var(--fg-on-accent)" : "var(--fg-subtle)",
                  }}
                >
                  Submit Reservation Request
                </button>
                {!policiesRead && <p style={{ fontSize: "0.72rem", color: "var(--fg-subtle)", marginTop: "0.5rem", textAlign: "center" }}>Agree to the policies on the previous step to submit.</p>}
              </div>
            )}

            {/* Nav */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingTop: "1.5rem", borderTop: border }}>
              <button onClick={back} disabled={step === 0} style={{ fontSize: "0.8rem", fontWeight: 700, color: step === 0 ? "var(--fg-subtle)" : fg, background: "none", border: "none", cursor: step === 0 ? "default" : "pointer" }}>
                ← Back
              </button>
              {step < STEPS.length - 1 && (
                <button onClick={next} style={{ fontSize: "0.8rem", fontWeight: 700, padding: "0.6rem 1.4rem", borderRadius: "0.6rem", background: "var(--accent-solid)", color: "var(--fg-on-accent)", border: "none", cursor: "pointer" }}>
                  Continue →
                </button>
              )}
            </div>
          </div>

          {/* ── Live estimate sidebar ── */}
          <div style={{ position: "sticky", top: "1.5rem", background: cardBg, border, borderRadius: "1rem", padding: "1.5rem" }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
              Estimated Cost
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", fontSize: "0.8rem", marginBottom: "1rem" }}>
              <EstRow label={`${room.name} (4 hrs)`} value={isProfit === "profit" ? room.profit4hr : room.nonProfit4hr} />
              {estimate.extraHours > 0 && (
                <EstRow label={`+${estimate.extraHours} extra hr × $${estimate.extraHrRate}`} value={estimate.extraHours * estimate.extraHrRate} />
              )}
              {tablecloths > 0 && <EstRow label={`Tablecloths × ${tablecloths}`} value={estimate.tableclothCost} />}
              {estimate.avCost > 0 && <EstRow label="A/V" value={estimate.avCost} />}
            </div>
            <div style={{ borderTop: border, paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: fg }}>Estimated Total</span>
              <span style={{ fontSize: "1.4rem", fontWeight: 800, color: fg }}>${estimate.total.toLocaleString()}</span>
            </div>
            <p style={{ fontSize: "0.7rem", color: "var(--fg-subtle)", marginTop: "0.6rem", lineHeight: 1.5 }}>
              25% deposit due at signing. Final quote confirmed by BX staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--fg-muted)", marginBottom: "0.35rem" }}>{label}</label>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
      <span style={{ color: "var(--fg-subtle)" }}>{label}</span>
      <span style={{ color: "var(--fg)", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function EstRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
      <span style={{ color: "var(--fg-muted)" }}>{label}</span>
      <span style={{ color: "var(--fg)", fontWeight: 600 }}>${value.toLocaleString()}</span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  borderRadius: "0.6rem",
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--fg)",
  fontSize: "0.85rem",
};

function pillButton(active: boolean): React.CSSProperties {
  return {
    fontSize: "0.78rem",
    fontWeight: 700,
    padding: "0.5rem 1rem",
    borderRadius: "999px",
    border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
    background: active ? "var(--accent-bg)" : "transparent",
    color: active ? "var(--accent-text)" : "var(--fg-muted)",
    cursor: "pointer",
  };
}
