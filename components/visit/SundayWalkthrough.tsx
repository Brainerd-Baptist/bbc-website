"use client";

import { useState, useRef } from "react";

const TEAL = "#00abc9";
const NAVY = "#00205B";

const STEPS = [
  {
    num: "01",
    label: "Choose your service",
    heading: "8:30 or 11:00am",
    body: "Both services are at the Sanctuary — the main building on Brookfield Ave with the steeple. A lot of people simply pick whichever time works better. Both services sing many of the same songs; the difference is who's leading up front — a choir and orchestra at 8:30, a band at 11:00. The 9:45 slot between them is Life Groups — a great way to get connected, but nothing you need to think about your first Sunday.",
    note: null,
  },
  {
    num: "02",
    label: "Parking",
    heading: "Pull into the Red or Orange lot",
    body: "The Red Lot is off Brookfield Ave, directly south of the Sanctuary — easiest to find, closest to the main entrance. The Orange Lot is on the north side if the Red fills up. All lots are free and open before and after service.",
    note: "Bringing kids? Pull into the Purple Lot on the west side of the building — it puts you right at the Brainerd Kids entrance.",
  },
  {
    num: "03",
    label: "Kids check-in",
    heading: "Families, use the Purple Lot entrance",
    body: "Park in the Purple Lot and head to the Brainerd Kids entrance on the west side of the building. Dedicated check-in staff will walk you through everything your first time — you'll each receive a matching security tag, which is how pickup works when service ends. Plan about 10 extra minutes the first week; it goes fast after that.",
    note: "Check-in opens 30 minutes before each service. All volunteers are background-checked.",
  },
  {
    num: "04",
    label: "Walking in",
    heading: "Someone will find you",
    body: "Greeters are at every door. Fair warning: Brainerd Baptist is a genuinely relational crowd — people will say hi, introduce themselves, maybe offer to show you around. Nobody is going to ask you to stand up in front of the room. But if you walk in looking a little uncertain, someone will notice.",
    note: null,
  },
  {
    num: "05",
    label: "The service",
    heading: "About 75 minutes",
    body: "Music leads — congregational singing, not just a band performing at you. Then an expository sermon: we work through a book of the Bible verse by verse, week after week. Bring a Bible or use the pew Bibles already in the seats. Wear what you'd wear on a Saturday. There's no script for how to act — just show up.",
    note: null,
  },
  {
    num: "06",
    label: "After",
    heading: "No pressure, no checklist",
    body: "When the service ends, you're free to head straight out. People tend to linger in the lobby and on the front steps — that's just the culture here. If you have questions or want to connect with someone on staff, the Connect page is the easiest next step. We'd love to see you again next week.",
    note: null,
  },
];

export default function SundayWalkthrough() {
  const [idx, setIdx] = useState(0);
  const step = STEPS[idx];
  const canNext = idx < STEPS.length - 1;
  const canPrev = idx > 0;

  const tx = useRef<number | null>(null);
  const onTS = (e: React.TouchEvent) => { tx.current = e.touches[0].clientX; };
  const onTE = (e: React.TouchEvent) => {
    if (tx.current === null) return;
    const dx = e.changedTouches[0].clientX - tx.current;
    if (Math.abs(dx) > 36) {
      if (dx < 0 && canNext) setIdx(i => i + 1);
      if (dx > 0 && canPrev) setIdx(i => i - 1);
    }
    tx.current = null;
  };

  return (
    <section
      className="py-24 px-6 select-none"
      style={{ background: "#00142a" }}
      onTouchStart={onTS}
      onTouchEnd={onTE}
    >
      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <p className="font-condensed font-700 text-center tracking-widest uppercase text-xs mb-3"
          style={{ color: TEAL }}>
          Your First Sunday
        </p>
        <h2
          className="font-condensed font-900 text-white text-center mb-16"
          style={{ fontSize: "clamp(2.8rem, 7vw, 4.5rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
        >
          Step by Step
        </h2>

        {/* Nav */}
        <div className="flex items-center justify-between mb-10 max-w-lg mx-auto">
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            disabled={!canPrev}
            className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full border transition-all"
            style={{
              borderColor: canPrev ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.14)",
              color: canPrev ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.32)",
              background: "transparent",
              cursor: canPrev ? "pointer" : "not-allowed",
            }}
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Step ${i + 1}`}
                style={{
                  width: i === idx ? 26 : 7,
                  height: 7,
                  borderRadius: 4,
                  padding: 0,
                  background: i === idx ? TEAL : "rgba(255,255,255,0.32)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all .3s ease",
                }}
              />
            ))}
          </div>

          {canNext ? (
            <button
              onClick={() => setIdx(i => Math.min(STEPS.length - 1, i + 1))}
              className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full transition-colors"
              style={{ background: TEAL, color: "#fff", cursor: "pointer" }}
            >
              Next →
            </button>
          ) : (
            <a
              href="/connect"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full inline-block"
              style={{ background: TEAL, color: "#fff" }}
            >
              Connect →
            </a>
          )}
        </div>

        {/* Step content */}
        <div
          className="max-w-2xl mx-auto"
          key={idx}
          style={{ animation: "fadeUp .3s ease" }}
        >
          {/* Step label */}
          <p
            className="font-condensed font-700 tracking-widest uppercase text-xs mb-4"
            style={{ color: `${TEAL}88` }}
          >
            {step.label}
          </p>

          {/* Big number + heading row */}
          <div className="flex items-start gap-5 mb-6">
            <span
              className="font-condensed font-900 leading-none flex-shrink-0"
              style={{ fontSize: "clamp(4rem, 10vw, 6rem)", color: TEAL, opacity: 0.15, letterSpacing: "-0.04em", lineHeight: 0.85 }}
            >
              {step.num}
            </span>
            <h3
              className="font-condensed font-900 text-white"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", letterSpacing: "-0.02em", lineHeight: 1.05, paddingTop: "0.15em" }}
            >
              {step.heading}
            </h3>
          </div>

          {/* Body */}
          <p
            className="leading-relaxed mb-5"
            style={{ color: "rgba(255,255,255,0.58)", fontSize: "1.05rem", maxWidth: 520 }}
          >
            {step.body}
          </p>

          {/* Note */}
          {step.note && (
            <p
              className="font-condensed font-700 text-sm"
              style={{ color: TEAL, letterSpacing: "0.01em" }}
            >
              → {step.note}
            </p>
          )}

          {/* Step counter */}
          <p
            className="font-condensed text-sm mt-10"
            style={{ color: "var(--fg-subtle)" }}
          >
            {idx + 1} of {STEPS.length}
          </p>
        </div>

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
