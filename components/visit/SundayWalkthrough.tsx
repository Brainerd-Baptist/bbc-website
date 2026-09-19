"use client";

import { useState, useRef } from "react";

const TEAL = "#00abc9";
const NAVY = "#00205B";

const STEPS = [
  {
    num: "01",
    label: "Choose your service",
    heading: "8:30 or 11:00am",
    body: "Both services are identical in content — same sermon, same structure, same everything. The difference is music: 8:30 features choir and orchestra, 11:00 is band-led worship. The 9:45 slot between them is Life Groups — small group Bible study, worth trying, but nothing you need to think about your first Sunday.",
    note: null,
  },
  {
    num: "02",
    label: "Parking",
    heading: "Multiple lots, no stress",
    // TODO: Add specific lot names/directions once confirmed
    body: "There are multiple parking lots at 300 Brookfield Ave. If you're arriving for the first time, the main lot off Brookfield is a good place to start. Overflow parking is available [ADD: overflow lot location/direction] when the main lot fills up near the start of service.",
    note: "Bringing kids? Park near the kids entrance — it's on [ADD: which side of the building].",
  },
  {
    num: "03",
    label: "Kids check-in",
    heading: "Families, use the kids entrance",
    body: "There's a separate entrance for families with children. Dedicated check-in staff will walk you through everything your first time — you'll be in and out in about 10 minutes. You and your child each get a matching security tag, which is how pickup works when the service is over.",
    note: "Check-in opens 30 minutes before each service. All volunteers are background-checked.",
  },
  {
    num: "04",
    label: "Walking in",
    heading: "Someone will find you",
    body: "Greeters are at every door. Fair warning: Brainerd Baptist is a genuinely relational crowd — people will say hi, introduce themselves, maybe offer to show you around. Nobody is going to ask you to stand up and introduce yourself in front of the room. But if you walk in looking a little uncertain, someone will notice.",
    note: null,
  },
  {
    num: "05",
    label: "The service",
    heading: "About 75 minutes",
    body: "Music comes first — congregational singing, not just a band performing at you. Then an expository sermon: we work through a book of the Bible verse by verse, week after week. Bring a Bible or use the pew Bibles already in the seats. Wear what you'd wear on a Saturday. There's no script for how to act — just show up.",
    note: null,
  },
  {
    num: "06",
    label: "After",
    heading: "No pressure, no checklist",
    body: "When the service ends, you're free to head straight out. People tend to linger and talk — that's just the culture here. If you want to connect with someone on staff, look for [ADD: staff identifier — shirt color, lanyard, etc.] near [ADD: where staff typically stand after service]. Or reach us anytime through the Connect page.",
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
              borderColor: canPrev ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)",
              color: canPrev ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.15)",
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
                  background: i === idx ? TEAL : "rgba(255,255,255,0.18)",
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
            style={{ color: "rgba(255,255,255,0.18)" }}
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
