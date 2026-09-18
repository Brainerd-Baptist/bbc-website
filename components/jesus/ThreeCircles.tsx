"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Step definitions ───────────────────────────────────────────────── */
const STEPS = [
  {
    id: "brokenness",
    num: 1,
    title: "We Live in Brokenness",
    body: "You feel it. Everyone does. Anxiety, loneliness, relationships that fall apart — a sense that something is deeply wrong with the world and with us. The Bible calls it brokenness.",
    cta: "But how did we get here?",
  },
  {
    id: "design",
    num: 2,
    title: "God's Original Design",
    body: "God made the world good. He designed people to know him, love each other, and live in wholeness. This is what we were made for — purpose, peace, and relationship with God.",
    cta: "So what went wrong?",
  },
  {
    id: "sin",
    num: 3,
    title: "Sin Broke Everything",
    body: "Sin is the choice to leave God out — to do things our own way. That choice, made by the first humans and repeated by every person since, shattered God's design and brought brokenness into the world.",
    cta: "Can't we fix it ourselves?",
  },
  {
    id: "coping",
    num: 4,
    title: "We Keep Trying to Escape",
    body: "We reach for things to fill the gap — money, success, romance, pleasure, religion. Some are good things. But none of them fix brokenness. They always loop us back to more of it.",
    cta: "Is there a way out?",
  },
  {
    id: "gospel",
    num: 5,
    title: "God Had a Plan",
    body: "God sent his Son Jesus — fully God, fully human — to live the life we couldn't live, die the death we deserved, and rise from the dead three days later. Jesus defeated sin and opened a way back.",
    cta: "How do I get there?",
  },
  {
    id: "repent",
    num: 6,
    title: "Repent and Believe",
    body: "We move from brokenness to God's design by going through the Gospel. Repent — turn from sin. Believe — trust Jesus with your whole life. This is how we enter a restored relationship with God.",
    cta: "What if I fall back?",
  },
  {
    id: "recover",
    num: 7,
    title: "The Way Back Is Always the Same",
    body: "Even after following Jesus, we stumble back into brokenness. But the Gospel is still the way home. Repent again. Believe again. Return to God's design — not through willpower, but through Jesus.",
    cta: null,
  },
];

type Elem =
  | "broken-circle" | "broken-labels"
  | "design-circle" | "design-label"
  | "sin-arrow" | "cope-arrows"
  | "gospel-circle" | "gospel-label"
  | "repent-arrow" | "restore-arrow"
  | "recover-arrow";

const VISIBLE: Record<string, Elem[]> = {
  brokenness: ["broken-circle", "broken-labels"],
  design:     ["broken-circle", "broken-labels", "design-circle", "design-label"],
  sin:        ["broken-circle", "broken-labels", "design-circle", "design-label", "sin-arrow"],
  coping:     ["broken-circle", "broken-labels", "design-circle", "design-label", "sin-arrow", "cope-arrows"],
  gospel:     ["broken-circle", "broken-labels", "design-circle", "design-label", "sin-arrow", "cope-arrows", "gospel-circle", "gospel-label"],
  repent:     ["broken-circle", "broken-labels", "design-circle", "design-label", "sin-arrow", "cope-arrows", "gospel-circle", "gospel-label", "repent-arrow", "restore-arrow"],
  recover:    ["broken-circle", "broken-labels", "design-circle", "design-label", "sin-arrow", "cope-arrows", "gospel-circle", "gospel-label", "repent-arrow", "restore-arrow", "recover-arrow"],
};

function vis(step: string, e: Elem) {
  return VISIBLE[step]?.includes(e) ?? false;
}

/* ─── Per-step "camera" viewBoxes ────────────────────────────────────── */
// These zoom the SVG camera to the relevant elements, so each step fills the space nicely
type VB = [number, number, number, number]; // x y w h
const VIEWBOXES: Record<string, VB> = {
  brokenness: [75, 178, 250, 200],   // zoom into brokenness circle
  design:     [18, 30,  280, 270],   // design (top-left) + brokenness (bottom-center)
  sin:        [18, 30,  280, 270],   // same + sin arrow
  coping:     [10, 18,  340, 295],   // wider for coping arms
  gospel:     [10, 18,  380, 340],   // all three circles
  repent:     [10, 18,  380, 340],   // full + repent arrows
  recover:    [10, 18,  380, 340],   // full + recover
};

/* ─── Animated viewBox hook ──────────────────────────────────────────── */
function useAnimatedViewBox(target: VB): string {
  const current = useRef<VB>(target);
  const [vb, setVb] = useState<VB>(target);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    const from = current.current;
    const to = target;
    if (from.every((v, i) => v === to[i])) return;

    const start = performance.now();
    const dur = 520;

    function ease(t: number) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function tick(now: number) {
      const t = Math.min((now - start) / dur, 1);
      const e = ease(t);
      const next = from.map((v, i) => v + (to[i] - v) * e) as VB;
      setVb(next);
      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        current.current = to;
      }
    }

    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target]);

  return vb.join(" ");
}

/* ─── Draw-on animation helpers ─────────────────────────────────────── */
function useDrawOn(show: boolean, delay = 0) {
  const [drawn, setDrawn] = useState(false);
  const prev = useRef(false);
  useEffect(() => {
    if (show && !prev.current) {
      setDrawn(false);
      const t = setTimeout(() => setDrawn(true), delay);
      return () => clearTimeout(t);
    }
    prev.current = show;
  }, [show, delay]);
  return drawn;
}

/* ─── Animated elements ──────────────────────────────────────────────── */
function AnimCircle({
  cx, cy, r, stroke, strokeW = 2.5, show, delay = 0,
}: {
  cx: number; cy: number; r: number; stroke: string; strokeW?: number; show: boolean; delay?: number;
}) {
  const drawn = useDrawOn(show, delay);
  const circ = 2 * Math.PI * r;
  return (
    <circle
      cx={cx} cy={cy} r={r}
      fill="none" stroke={stroke} strokeWidth={strokeW}
      strokeDasharray={circ}
      strokeDashoffset={drawn ? 0 : circ}
      style={{
        transition: drawn ? `stroke-dashoffset 0.85s cubic-bezier(0.4,0,0.2,1)` : "none",
        opacity: show ? 1 : 0,
      }}
    />
  );
}

function AnimPath({
  d, stroke, strokeW = 2.5, show, delay = 0, len = 350,
}: {
  d: string; stroke: string; strokeW?: number; show: boolean; delay?: number; len?: number;
}) {
  const drawn = useDrawOn(show, delay);
  return (
    <path
      d={d} fill="none" stroke={stroke} strokeWidth={strokeW}
      strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={len} strokeDashoffset={drawn ? 0 : len}
      style={{
        transition: drawn ? `stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)` : "none",
        opacity: show ? 1 : 0,
      }}
    />
  );
}

function AnimLabel({
  x, y, lines, fill, size = 14, weight = 700, show, delay = 0, anchor = "middle",
}: {
  x: number; y: number; lines: string[]; fill: string; size?: number;
  weight?: number; show: boolean; delay?: number; anchor?: "middle" | "start" | "end";
}) {
  const [op, setOp] = useState(0);
  const prev = useRef(false);
  useEffect(() => {
    if (show && !prev.current) {
      setOp(0);
      const t = setTimeout(() => setOp(1), delay + 600);
      return () => clearTimeout(t);
    }
    prev.current = show;
  }, [show, delay]);
  return (
    <text
      textAnchor={anchor} fill={fill} fontSize={size} fontWeight={weight}
      fontFamily="var(--font-barlow-condensed), sans-serif"
      letterSpacing="0.08em"
      style={{ transition: "opacity 0.35s ease", opacity: show ? op : 0, textTransform: "uppercase" }}
    >
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.2}>{l}</tspan>
      ))}
    </text>
  );
}

/* ─── Broken circle (fragmented arcs) ───────────────────────────────── */
function BrokenCircle({ show }: { show: boolean }) {
  const cx = 200, cy = 270, r = 68;
  const drawn = useDrawOn(show, 0);

  // Arc segments with tiny gaps to look cracked
  const segs = [
    `M ${cx + r},${cy} A ${r},${r} 0 0 1 ${cx + 48},${cy - 49}`,
    `M ${cx + 41},${cy - 55} A ${r},${r} 0 0 1 ${cx - 15},${cy - 67}`,
    `M ${cx - 24},${cy - 63} A ${r},${r} 0 0 1 ${cx - 60},${cy - 33}`,
    `M ${cx - 65},${cy - 20} A ${r},${r} 0 0 1 ${cx - 65},${cy + 20}`,
    `M ${cx - 60},${cy + 33} A ${r},${r} 0 0 1 ${cx - 24},${cy + 63}`,
    `M ${cx - 15},${cy + 67} A ${r},${r} 0 0 1 ${cx + 41},${cy + 55}`,
    `M ${cx + 48},${cy + 49} A ${r},${r} 0 0 1 ${cx + r},${cy}`,
  ];

  return (
    <g style={{ opacity: show ? 1 : 0 }}>
      {segs.map((d, i) => (
        <path
          key={i} d={d} fill="none"
          stroke="rgba(255,255,255,0.5)" strokeWidth={2.5} strokeLinecap="round"
          strokeDasharray={60} strokeDashoffset={drawn ? 0 : 60}
          style={{
            transition: drawn
              ? `stroke-dashoffset 0.45s cubic-bezier(0.4,0,0.2,1) ${i * 70}ms`
              : "none",
          }}
        />
      ))}
    </g>
  );
}

/* ─── Arrowhead helper ───────────────────────────────────────────────── */
function Arrowhead({
  x, y, angle, color, show,
}: {
  x: number; y: number; angle: number; color: string; show: boolean;
}) {
  const size = 7;
  const rad = (angle * Math.PI) / 180;
  const tip = { x, y };
  const left = {
    x: x - size * Math.cos(rad) + (size / 2) * Math.sin(rad),
    y: y - size * Math.sin(rad) - (size / 2) * Math.cos(rad),
  };
  const right = {
    x: x - size * Math.cos(rad) - (size / 2) * Math.sin(rad),
    y: y - size * Math.sin(rad) + (size / 2) * Math.cos(rad),
  };
  return (
    <polygon
      points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
      fill={color}
      style={{ opacity: show ? 1 : 0, transition: "opacity 0.3s ease 0.65s" }}
    />
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function ThreeCircles() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];
  const v = step.id;

  const canNext = stepIdx < STEPS.length - 1;
  const canPrev = stepIdx > 0;

  // Circle centers
  const DX = 100, DY = 110; // God's Design
  const GX = 300, GY = 110; // Gospel
  const BX = 200, BY = 270; // Brokenness
  const R  = 68;

  const TEAL  = "#00abc9";
  const RED   = "rgba(255,100,60,0.9)";
  const WHITE = "rgba(255,255,255,0.85)";
  const DIM   = "rgba(255,255,255,0.35)";

  const targetVB = VIEWBOXES[v];
  const viewBox  = useAnimatedViewBox(targetVB);

  return (
    <div className="w-full select-none">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStepIdx(i)}
            aria-label={`Step ${i + 1}: ${s.title}`}
            style={{
              width: i === stepIdx ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: i === stepIdx ? TEAL : "rgba(255,255,255,0.18)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Canvas + text */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-center lg:items-start">

        {/* SVG */}
        <div className="w-full max-w-sm lg:max-w-none lg:w-[420px] flex-shrink-0 mx-auto lg:mx-0">
          <svg
            viewBox={viewBox}
            className="w-full h-auto"
            style={{ overflow: "visible", transition: "none" }}
          >
            <defs>
              <filter id="sketch" x="-8%" y="-8%" width="116%" height="116%">
                <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="9" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>

            {/* ── God's Design circle ── */}
            <g filter="url(#sketch)">
              <AnimCircle cx={DX} cy={DY} r={R} stroke={TEAL} strokeW={3} show={vis(v,"design-circle")} />
            </g>
            {/* Cross inside */}
            <line x1={DX} y1={DY-32} x2={DX} y2={DY+32}
              stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" opacity="0.45"
              style={{ opacity: vis(v,"design-circle") ? 0.45 : 0, transition: "opacity 0.5s ease 1s" }} />
            <line x1={DX-22} y1={DY-8} x2={DX+22} y2={DY-8}
              stroke={TEAL} strokeWidth="2.5" strokeLinecap="round"
              style={{ opacity: vis(v,"design-circle") ? 0.45 : 0, transition: "opacity 0.5s ease 1s" }} />
            <AnimLabel
              x={DX} y={DY + R + 22}
              lines={["God's", "Design"]}
              fill={TEAL} size={14} show={vis(v,"design-label")} />

            {/* ── Gospel circle ── */}
            <g filter="url(#sketch)">
              <AnimCircle cx={GX} cy={GY} r={R} stroke={WHITE} strokeW={3} show={vis(v,"gospel-circle")} />
            </g>
            {/* Cross inside */}
            <line x1={GX} y1={GY-34} x2={GX} y2={GY+34}
              stroke={WHITE} strokeWidth="3" strokeLinecap="round"
              style={{ opacity: vis(v,"gospel-circle") ? 0.8 : 0, transition: "opacity 0.5s ease 1s" }} />
            <line x1={GX-24} y1={GY-10} x2={GX+24} y2={GY-10}
              stroke={WHITE} strokeWidth="3" strokeLinecap="round"
              style={{ opacity: vis(v,"gospel-circle") ? 0.8 : 0, transition: "opacity 0.5s ease 1s" }} />
            <AnimLabel
              x={GX} y={GY + R + 22}
              lines={["The", "Gospel"]}
              fill={WHITE} size={14} show={vis(v,"gospel-label")} />

            {/* ── Brokenness circle ── */}
            <g filter="url(#sketch)">
              <BrokenCircle show={vis(v,"broken-circle")} />
            </g>
            <AnimLabel
              x={BX} y={BY + R + 22}
              lines={["Brokenness"]}
              fill={DIM} size={14} show={vis(v,"broken-labels")} />
            {/* Words inside broken circle */}
            {(["Pain","Shame","Anxiety"] as const).map((word, i) => (
              <AnimLabel key={word} x={BX} y={BY - 14 + i * 18}
                lines={[word]} fill="rgba(255,255,255,0.32)" size={13} weight={400}
                show={vis(v,"broken-labels")} delay={i * 200} />
            ))}

            {/* ── Sin arrow: Design → Brokenness ── */}
            <AnimPath
              d={`M ${DX+28},${DY+58} Q ${DX+55},${BY-55} ${BX-52},${BY-32}`}
              stroke={RED} strokeW={2.5}
              show={vis(v,"sin-arrow")} len={230} />
            <AnimLabel x={134} y={192}
              lines={["Sin"]} fill={RED} size={15}
              show={vis(v,"sin-arrow")} />
            <Arrowhead x={BX-52} y={BY-32} angle={-148} color={RED} show={vis(v,"sin-arrow")} />

            {/* ── Coping arrows ── */}
            <AnimPath
              d={`M ${BX+62},${BY-22} Q ${BX+115},${BY-72} ${BX+82},${BY+35}`}
              stroke="rgba(255,255,255,0.22)" strokeW={1.8}
              show={vis(v,"cope-arrows")} len={210} delay={0} />
            <AnimPath
              d={`M ${BX-62},${BY-22} Q ${BX-115},${BY-72} ${BX-82},${BY+35}`}
              stroke="rgba(255,255,255,0.22)" strokeW={1.8}
              show={vis(v,"cope-arrows")} len={210} delay={120} />
            <AnimLabel x={BX+114} y={BY-38} lines={["Money"]}  fill="rgba(255,255,255,0.28)" size={12} weight={500} show={vis(v,"cope-arrows")} delay={100} />
            <AnimLabel x={BX-114} y={BY-38} lines={["Religion"]} fill="rgba(255,255,255,0.28)" size={12} weight={500} show={vis(v,"cope-arrows")} delay={250} />
            <AnimLabel x={BX} y={BY-78} lines={["Success"]} fill="rgba(255,255,255,0.28)" size={12} weight={500} show={vis(v,"cope-arrows")} delay={400} />

            {/* ── Repent arrow: Brokenness → Gospel ── */}
            <AnimPath
              d={`M ${BX+52},${BY-32} Q ${BX+100},${BY-95} ${GX-45},${GY+52}`}
              stroke={TEAL} strokeW={2.8}
              show={vis(v,"repent-arrow")} len={230} />
            <Arrowhead x={GX-45} y={GY+52} angle={-50} color={TEAL} show={vis(v,"repent-arrow")} />
            <AnimLabel x={272} y={210}
              lines={["Repent", "& Believe"]}
              fill={TEAL} size={13} show={vis(v,"repent-arrow")} delay={0} />

            {/* ── Restore arrow: Gospel → God's Design ── */}
            <AnimPath
              d={`M ${GX-R-2},${GY} Q 200,${GY-62} ${DX+R+2},${DY}`}
              stroke={TEAL} strokeW={2.8}
              show={vis(v,"restore-arrow")} len={250} delay={350} />
            <Arrowhead x={DX+R+2} y={DY} angle={180} color={TEAL} show={vis(v,"restore-arrow")} />
            <AnimLabel x={200} y={GY-52}
              lines={["Restored"]}
              fill={TEAL} size={13} show={vis(v,"restore-arrow")} delay={500} />

            {/* ── Recover arrow (dashed) ── */}
            {vis(v,"recover-arrow") && (
              <path
                d={`M ${DX+20},${DY+62} Q ${DX-28},${BY-30} ${BX-58},${BY-24}`}
                fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.8}
                strokeLinecap="round" strokeDasharray="5 6"
              />
            )}
            <AnimLabel x={96} y={220}
              lines={["Recover"]}
              fill="rgba(255,255,255,0.28)" size={12} show={vis(v,"recover-arrow")} delay={100} />
          </svg>
        </div>

        {/* Text panel */}
        <div className="flex-1 flex flex-col justify-center lg:pt-4 px-1 lg:px-0">
          <p
            className="font-condensed font-900 mb-3"
            style={{ fontSize: "5rem", lineHeight: 1, color: TEAL, opacity: 0.14, letterSpacing: "-0.03em" }}
          >
            0{step.num}
          </p>
          <h3
            className="font-condensed font-900 text-white mb-4"
            style={{ fontSize: "clamp(1.9rem, 4.5vw, 2.6rem)", letterSpacing: "-0.02em", lineHeight: 1.05 }}
          >
            {step.title}
          </h3>
          <p className="text-white/58 leading-relaxed mb-6" style={{ fontSize: "1.05rem", maxWidth: 420 }}>
            {step.body}
          </p>
          {step.cta && (
            <p className="font-condensed font-700 mb-8" style={{ color: TEAL, fontSize: "1.05rem" }}>
              {step.cta}
            </p>
          )}

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
                className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-2.5 rounded-full inline-block"
                style={{ background: TEAL, color: "#00142a" }}
              >
                Talk to Someone
              </a>
            )}

            <span className="text-white/22 text-sm font-condensed">
              {stepIdx + 1} / {STEPS.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
