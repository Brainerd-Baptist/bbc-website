"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Step definitions ────────────────────────────────────────────────── */
const STEPS = [
  {
    id: "brokenness",
    num: 1,
    title: "We Live in Brokenness",
    body: "You feel it. Everyone does. Anxiety, loneliness, relationships that fall apart, a sense that something is deeply wrong — with the world and with us. This isn't just bad luck. The Bible calls it brokenness.",
    cta: "But how did we get here?",
  },
  {
    id: "design",
    num: 2,
    title: "God's Original Design",
    body: "God made the world good. He made people to know him, love each other, and live in the world he designed. This is what we were made for — wholeness, purpose, peace.",
    cta: "So what went wrong?",
  },
  {
    id: "sin",
    num: 3,
    title: "Sin Broke Everything",
    body: "Sin is the choice to leave God out — to do things our own way. That choice, made by the first humans and repeated by every person since, separated us from God's design and brought brokenness into the world.",
    cta: "Can't we just fix it ourselves?",
  },
  {
    id: "coping",
    num: 4,
    title: "We Keep Trying to Escape",
    body: "We reach for things to fill the gap — money, success, romance, pleasure, religion, distraction. Some of them are good things. But none of them fix brokenness. They just lead back to more of it.",
    cta: "Is there a way out?",
  },
  {
    id: "gospel",
    num: 5,
    title: "God Had a Plan",
    body: "God didn't leave us there. He sent his Son Jesus — fully God, fully human — to live the life we couldn't live, die the death we deserved, and rise from the dead three days later. Jesus defeated sin and opened a way back to God's design.",
    cta: "How do I get there?",
  },
  {
    id: "repent",
    num: 6,
    title: "Repent and Believe",
    body: "We move from brokenness to God's design by going through the Gospel. Repent — turn from sin and self-direction. Believe — trust Jesus with your whole life. This is how we enter a restored relationship with God.",
    cta: "What if I fall back?",
  },
  {
    id: "recover",
    num: 7,
    title: "The Way Back Is Always the Same",
    body: "Even after following Jesus, we stumble. We wander back into brokenness. But the Gospel is still the way home. Repent again. Believe again. Return to God's design — not through willpower, but through Jesus.",
    cta: null,
  },
];

/* ─── SVG element visibility per step ────────────────────────────────── */
// Elements: broken-circle, broken-labels, design-circle, design-label,
//           sin-arrow, cope-arrows, gospel-circle, gospel-label,
//           repent-arrow, restore-arrow, recover-arrow
type Elem =
  | "broken-circle"
  | "broken-labels"
  | "design-circle"
  | "design-label"
  | "sin-arrow"
  | "cope-arrows"
  | "gospel-circle"
  | "gospel-label"
  | "repent-arrow"
  | "restore-arrow"
  | "recover-arrow";

const VISIBLE: Record<string, Elem[]> = {
  brokenness: ["broken-circle", "broken-labels"],
  design: ["broken-circle", "broken-labels", "design-circle", "design-label"],
  sin: ["broken-circle", "broken-labels", "design-circle", "design-label", "sin-arrow"],
  coping: ["broken-circle", "broken-labels", "design-circle", "design-label", "sin-arrow", "cope-arrows"],
  gospel: ["broken-circle", "broken-labels", "design-circle", "design-label", "sin-arrow", "cope-arrows", "gospel-circle", "gospel-label"],
  repent: ["broken-circle", "broken-labels", "design-circle", "design-label", "sin-arrow", "cope-arrows", "gospel-circle", "gospel-label", "repent-arrow", "restore-arrow"],
  recover: ["broken-circle", "broken-labels", "design-circle", "design-label", "sin-arrow", "cope-arrows", "gospel-circle", "gospel-label", "repent-arrow", "restore-arrow", "recover-arrow"],
};

function isVisible(step: string, elem: Elem) {
  return VISIBLE[step]?.includes(elem) ?? false;
}

/* ─── Draw animation helper ──────────────────────────────────────────── */
function useDrawAnim(trigger: boolean, len = 600) {
  const [drawn, setDrawn] = useState(false);
  const prev = useRef(false);
  useEffect(() => {
    if (trigger && !prev.current) {
      setDrawn(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    }
    prev.current = trigger;
  }, [trigger]);
  return drawn;
}

/* ─── Individual animated SVG elements ───────────────────────────────── */

function AnimCircle({
  cx, cy, r, stroke, fill = "none", strokeW = 3, show, delay = 0,
}: {
  cx: number; cy: number; r: number; stroke: string; fill?: string;
  strokeW?: number; show: boolean; delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  const prevShow = useRef(false);
  useEffect(() => {
    if (show && !prevShow.current) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
    prevShow.current = show;
  }, [show, delay]);

  const circ = 2 * Math.PI * r;
  return (
    <circle
      cx={cx} cy={cy} r={r}
      fill={fill} stroke={stroke} strokeWidth={strokeW}
      strokeDasharray={circ}
      strokeDashoffset={visible ? 0 : circ}
      style={{ transition: visible ? `stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}ms` : "none", opacity: show ? 1 : 0 }}
    />
  );
}

function AnimPath({
  d, stroke, strokeW = 2.5, show, delay = 0, len = 400,
}: {
  d: string; stroke: string; strokeW?: number; show: boolean; delay?: number; len?: number;
}) {
  const [visible, setVisible] = useState(false);
  const prevShow = useRef(false);
  useEffect(() => {
    if (show && !prevShow.current) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
    prevShow.current = show;
  }, [show, delay]);

  return (
    <path
      d={d} fill="none" stroke={stroke} strokeWidth={strokeW}
      strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={len}
      strokeDashoffset={visible ? 0 : len}
      style={{ transition: visible ? `stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}ms` : "none", opacity: show ? 1 : 0 }}
    />
  );
}

function AnimText({
  x, y, text, fill, fontSize = 11, fontWeight = 600, show, delay = 0, anchor = "middle",
}: {
  x: number; y: number; text: string; fill: string; fontSize?: number;
  fontWeight?: number; show: boolean; delay?: number; anchor?: "middle" | "start" | "end";
}) {
  const [opacity, setOpacity] = useState(0);
  const prevShow = useRef(false);
  useEffect(() => {
    if (show && !prevShow.current) {
      setOpacity(0);
      const t = setTimeout(() => setOpacity(1), delay + 400);
      return () => clearTimeout(t);
    }
    prevShow.current = show;
  }, [show, delay]);
  return (
    <text
      x={x} y={y} textAnchor={anchor}
      fill={fill} fontSize={fontSize} fontWeight={fontWeight}
      fontFamily="var(--font-barlow-condensed), sans-serif"
      letterSpacing="0.05em"
      style={{ transition: "opacity 0.4s ease", opacity, textTransform: "uppercase" }}
    >
      {text}
    </text>
  );
}

/* ─── Broken circle (jagged) ─────────────────────────────────────────── */
function BrokenCircle({ show }: { show: boolean }) {
  const cx = 200, cy = 270, r = 68;
  // Draw as arc segments with gaps to look broken/fragmented
  const [visible, setVisible] = useState(false);
  const prevShow = useRef(false);
  useEffect(() => {
    if (show && !prevShow.current) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(t);
    }
    prevShow.current = show;
  }, [show]);

  const segs = [
    "M 200,202 A 68,68 0 0 1 249,220",
    "M 256,228 A 68,68 0 0 1 268,270",
    "M 266,282 A 68,68 0 0 1 242,325",
    "M 233,332 A 68,68 0 0 1 165,330",
    "M 156,324 A 68,68 0 0 1 135,283",
    "M 133,271 A 68,68 0 0 1 148,222",
    "M 154,214 A 68,68 0 0 1 196,202",
  ];

  return (
    <g style={{ opacity: show ? 1 : 0 }}>
      {segs.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={80}
          strokeDashoffset={visible ? 0 : 80}
          style={{
            transition: visible
              ? `stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms`
              : "none",
          }}
        />
      ))}
      {/* jagged cracks */}
      {visible && (
        <>
          <line x1="200" y1="202" x2="205" y2="218" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="249" y1="220" x2="256" y2="228" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="268" y1="270" x2="266" y2="282" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="242" y1="325" x2="233" y2="332" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="165" y1="330" x2="156" y2="324" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="135" y1="283" x2="133" y2="271" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="148" y1="222" x2="154" y2="214" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function ThreeCircles() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];
  const v = step.id;

  const canNext = stepIdx < STEPS.length - 1;
  const canPrev = stepIdx > 0;

  // Positions
  const DX = 100, DY = 110;   // God's Design center
  const GX = 300, GY = 110;   // Gospel center
  const BX = 200, BY = 270;   // Brokenness center
  const R = 68;

  const NAVY = "#00205B";
  const TEAL = "#00abc9";
  const WHITE = "rgba(255,255,255,0.9)";
  const WHITE_DIM = "rgba(255,255,255,0.45)";

  return (
    <div className="w-full">
      {/* ── Progress dots ── */}
      <div className="flex justify-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStepIdx(i)}
            aria-label={`Step ${i + 1}: ${s.title}`}
            className="transition-all duration-300"
            style={{
              width: i === stepIdx ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === stepIdx ? TEAL : "rgba(255,255,255,0.2)",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* ── Canvas + text ── */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">

        {/* SVG Canvas */}
        <div className="w-full max-w-[420px] flex-shrink-0 mx-auto lg:mx-0">
          <svg
            viewBox="0 0 400 360"
            className="w-full h-auto"
            style={{ filter: "drop-shadow(0 0 40px rgba(0,171,201,0.08))" }}
          >
            <defs>
              {/* Sketch filter for hand-drawn look */}
              <filter id="sketch" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="3" seed="7" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              {/* Arrowhead markers */}
              <marker id="arrow-white" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.6)" />
              </marker>
              <marker id="arrow-teal" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill={TEAL} />
              </marker>
              <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,120,80,0.9)" />
              </marker>
            </defs>

            {/* ── God's Design circle ── */}
            <g filter="url(#sketch)">
              <AnimCircle
                cx={DX} cy={DY} r={R}
                stroke={TEAL} strokeW={2.5}
                show={isVisible(v, "design-circle")}
              />
            </g>
            {/* Cross inside design circle */}
            {isVisible(v, "design-circle") && (
              <g style={{ opacity: isVisible(v, "design-circle") ? 1 : 0, transition: "opacity 0.5s ease 0.9s" }}>
                <line x1={DX} y1={DY - 30} x2={DX} y2={DY + 30} stroke={TEAL} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                <line x1={DX - 20} y1={DY - 8} x2={DX + 20} y2={DY - 8} stroke={TEAL} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              </g>
            )}
            <AnimText x={DX} y={DY + R + 18} text="GOD'S DESIGN" fill={TEAL} fontSize={9} show={isVisible(v, "design-label")} />

            {/* ── Gospel circle ── */}
            <g filter="url(#sketch)">
              <AnimCircle
                cx={GX} cy={GY} r={R}
                stroke={TEAL} strokeW={2.5}
                show={isVisible(v, "gospel-circle")}
              />
            </g>
            {/* Cross inside gospel circle */}
            {isVisible(v, "gospel-circle") && (
              <g style={{ opacity: isVisible(v, "gospel-circle") ? 1 : 0, transition: "opacity 0.5s ease 0.9s" }}>
                <line x1={GX} y1={GY - 32} x2={GX} y2={GY + 32} stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />
                <line x1={GX - 22} y1={GY - 10} x2={GX + 22} y2={GY - 10} stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}
            <AnimText x={GX} y={GY + R + 18} text="THE GOSPEL" fill={WHITE} fontSize={9} show={isVisible(v, "gospel-label")} />

            {/* ── Brokenness circle (fragmented) ── */}
            <g filter="url(#sketch)">
              <BrokenCircle show={isVisible(v, "broken-circle")} />
            </g>
            <AnimText x={BX} y={BY + R + 18} text="BROKENNESS" fill="rgba(255,255,255,0.55)" fontSize={9} show={isVisible(v, "broken-labels")} />

            {/* Words floating in brokenness */}
            {isVisible(v, "broken-labels") && (
              <>
                <AnimText x={BX - 22} y={BY - 8} text="Pain" fill="rgba(255,255,255,0.4)" fontSize={9} fontWeight={400} show anchor="middle" delay={300} />
                <AnimText x={BX + 16} y={BY + 10} text="Shame" fill="rgba(255,255,255,0.4)" fontSize={9} fontWeight={400} show anchor="middle" delay={500} />
                <AnimText x={BX - 8} y={BY + 26} text="Anxiety" fill="rgba(255,255,255,0.4)" fontSize={9} fontWeight={400} show anchor="middle" delay={700} />
              </>
            )}

            {/* ── Sin arrow: Design → Brokenness ── */}
            <AnimPath
              d={`M ${DX + 30},${DY + 55} Q ${DX + 60},${BY - 40} ${BX - 45},${BY - 30}`}
              stroke="rgba(255,120,80,0.8)"
              strokeW={2}
              show={isVisible(v, "sin-arrow")}
              len={220}
            />
            {/* SIN label */}
            {isVisible(v, "sin-arrow") && (
              <AnimText x={140} y={195} text="SIN" fill="rgba(255,120,80,0.9)" fontSize={9} show delay={0} />
            )}
            {/* Arrowhead */}
            {isVisible(v, "sin-arrow") && (
              <path d="M151,241 L155,234 L163,242 z" fill="rgba(255,120,80,0.8)"
                style={{ opacity: 1, transition: "opacity 0.3s ease 0.7s" }} />
            )}

            {/* ── Coping arrows (looping back into brokenness) ── */}
            <AnimPath
              d={`M ${BX + 60},${BY - 20} Q ${BX + 110},${BY - 60} ${BX + 80},${BY + 30}`}
              stroke="rgba(255,255,255,0.25)"
              strokeW={1.5}
              show={isVisible(v, "cope-arrows")}
              len={200}
              delay={0}
            />
            <AnimPath
              d={`M ${BX - 60},${BY - 20} Q ${BX - 110},${BY - 60} ${BX - 78},${BY + 28}`}
              stroke="rgba(255,255,255,0.25)"
              strokeW={1.5}
              show={isVisible(v, "cope-arrows")}
              len={200}
              delay={150}
            />
            {isVisible(v, "cope-arrows") && (
              <>
                <AnimText x={BX + 106} y={BY - 30} text="Money" fill="rgba(255,255,255,0.3)" fontSize={8} fontWeight={400} show delay={200} anchor="middle" />
                <AnimText x={BX - 108} y={BY - 30} text="Religion" fill="rgba(255,255,255,0.3)" fontSize={8} fontWeight={400} show delay={400} anchor="middle" />
                <AnimText x={BX} y={BY - 58} text="Success" fill="rgba(255,255,255,0.3)" fontSize={8} fontWeight={400} show delay={600} anchor="middle" />
              </>
            )}

            {/* ── Repent arrow: Brokenness → Gospel ── */}
            <AnimPath
              d={`M ${BX + 50},${BY - 28} Q ${BX + 90},${BY - 80} ${GX - 42},${GY + 52}`}
              stroke={TEAL}
              strokeW={2.5}
              show={isVisible(v, "repent-arrow")}
              len={220}
            />
            {isVisible(v, "repent-arrow") && (
              <>
                <AnimText x={270} y={195} text="REPENT" fill={TEAL} fontSize={8} show delay={0} />
                <AnimText x={270} y={206} text="& BELIEVE" fill={TEAL} fontSize={8} show delay={100} />
              </>
            )}

            {/* ── Restore arrow: Gospel → God's Design ── */}
            <AnimPath
              d={`M ${GX - R - 2},${GY} Q ${200},${GY - 55} ${DX + R + 2},${DY}`}
              stroke={TEAL}
              strokeW={2.5}
              show={isVisible(v, "restore-arrow")}
              len={240}
              delay={400}
            />
            {isVisible(v, "restore-arrow") && (
              <AnimText x={200} y={GY - 48} text="RESTORED" fill={TEAL} fontSize={8} show delay={500} />
            )}

            {/* ── Recover arrow: Design → Brokenness loop (dashed) ── */}
            {isVisible(v, "recover-arrow") && (
              <path
                d={`M ${DX + 22},${DY + 60} Q ${DX - 30},${BY - 20} ${BX - 55},${BY - 22}`}
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeDasharray="4 5"
                style={{ opacity: 1 }}
              />
            )}
            {isVisible(v, "recover-arrow") && (
              <AnimText x={100} y={215} text="RECOVER" fill="rgba(255,255,255,0.3)" fontSize={8} show delay={200} />
            )}
          </svg>
        </div>

        {/* ── Text panel ── */}
        <div className="flex-1 flex flex-col justify-center lg:pt-6 px-2 lg:px-0">
          {/* Step number */}
          <p
            className="font-condensed mb-3"
            style={{ fontSize: "4.5rem", lineHeight: 1, color: TEAL, opacity: 0.18, fontWeight: 900, letterSpacing: "-0.03em" }}
          >
            0{step.num}
          </p>

          {/* Title */}
          <h3
            className="font-condensed font-900 text-white mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", letterSpacing: "-0.02em", lineHeight: 1.05 }}
          >
            {step.title}
          </h3>

          {/* Body */}
          <p className="text-white/60 leading-relaxed mb-6" style={{ fontSize: "1rem", maxWidth: 400 }}>
            {step.body}
          </p>

          {/* CTA prompt */}
          {step.cta && (
            <p className="font-condensed font-700 mb-6" style={{ color: TEAL, fontSize: "1rem", letterSpacing: "0.01em" }}>
              {step.cta}
            </p>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              disabled={!canPrev}
              className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full border transition-all"
              style={{
                borderColor: canPrev ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                color: canPrev ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)",
                background: "transparent",
                cursor: canPrev ? "pointer" : "not-allowed",
              }}
            >
              ← Back
            </button>

            {canNext ? (
              <button
                onClick={() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))}
                className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-2.5 rounded-full transition-colors"
                style={{ background: TEAL, color: "#00142a", cursor: "pointer" }}
              >
                Next →
              </button>
            ) : (
              <a
                href="/connect"
                className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-2.5 rounded-full transition-colors inline-block"
                style={{ background: TEAL, color: "#00142a" }}
              >
                Talk to Someone
              </a>
            )}

            <span className="text-white/25 text-sm">
              {stepIdx + 1} / {STEPS.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
