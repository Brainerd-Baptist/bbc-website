"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Steps ──────────────────────────────────────────────────────────── */
const STEPS = [
  { id: "brokenness", num: 1, title: "We Live in Brokenness",       body: "You feel it. Everyone does. Anxiety, loneliness, relationships that fall apart — a sense that something is deeply wrong with the world and with us. The Bible calls it brokenness.",                                                                          cta: "But how did we get here?" },
  { id: "design",     num: 2, title: "God's Original Design",        body: "God made the world good. He designed people to know him, love each other, and live in wholeness. This is what we were made for — purpose, peace, and relationship with God.",                                                                                        cta: "So what went wrong?" },
  { id: "sin",        num: 3, title: "Sin Broke Everything",         body: "Sin is the choice to leave God out — to do things our own way. That choice, made by the first humans and repeated by every person since, shattered God's design and brought brokenness into the world.",                                                             cta: "Can't we fix it ourselves?" },
  { id: "coping",     num: 4, title: "We Keep Trying to Escape",     body: "We reach for things to fill the gap — money, success, romance, religion. Some are good things. But none of them fix brokenness. They always loop us back to more of it.",                                                                                           cta: "Is there a way out?" },
  { id: "gospel",     num: 5, title: "God Had a Plan",               body: "God sent his Son Jesus — fully God, fully human — to live the life we couldn't live, die the death we deserved, and rise from the dead three days later. Jesus defeated sin and opened a way back.",                                                                cta: "How do I get there?" },
  { id: "repent",     num: 6, title: "Repent and Believe",           body: "We move from brokenness to God's design by going through the Gospel. Repent — turn from sin. Believe — trust Jesus with your whole life. This is how we enter a restored relationship with God.",                                                                   cta: "What if I fall back?" },
  { id: "recover",    num: 7, title: "The Way Back Is Always the Same", body: "Even after following Jesus, we stumble back into brokenness. But the Gospel is still the way home. Repent again. Believe again. Return to God's design — not through willpower, but through Jesus.",                                                          cta: null },
];

type Elem = "broken-circle"|"broken-labels"|"design-circle"|"design-label"|"sin-arrow"|"cope-arrows"|"gospel-circle"|"gospel-label"|"repent-arrow"|"restore-arrow"|"recover-arrow";

const VISIBLE: Record<string, Elem[]> = {
  brokenness: ["broken-circle","broken-labels"],
  design:     ["broken-circle","broken-labels","design-circle","design-label"],
  sin:        ["broken-circle","broken-labels","design-circle","design-label","sin-arrow"],
  coping:     ["broken-circle","broken-labels","design-circle","design-label","sin-arrow","cope-arrows"],
  gospel:     ["broken-circle","broken-labels","design-circle","design-label","sin-arrow","cope-arrows","gospel-circle","gospel-label"],
  repent:     ["broken-circle","broken-labels","design-circle","design-label","sin-arrow","cope-arrows","gospel-circle","gospel-label","repent-arrow","restore-arrow"],
  recover:    ["broken-circle","broken-labels","design-circle","design-label","sin-arrow","cope-arrows","gospel-circle","gospel-label","repent-arrow","restore-arrow","recover-arrow"],
};
const vis = (step: string, e: Elem) => VISIBLE[step]?.includes(e) ?? false;

/* ─── Circle layout — tall portrait triangle ─────────────────────────
   The triangle is now TALLER than wide so it reads on portrait mobile.
   Labels for Design+Gospel go ABOVE their circles (not below) so they
   never collide with the vertical midfield.
   Full canvas: 400 × 450
 */
const DX = 100, DY = 130; // God's Design
const GX = 300, GY = 130; // Gospel
const BX = 200, BY = 320; // Brokenness  ← moved much lower
const R  = 66;

/* ─── Per-step viewBox "camera" ─────────────────────────────────────── */
type VB = [number,number,number,number];
const VIEWBOXES: Record<string, VB> = {
  brokenness: [82, 200, 235, 235],   // zoom: brokenness fills the frame
  design:     [12,  35, 295, 330],   // design + brokenness, generous room
  sin:        [12,  35, 295, 330],   // same + sin arrow
  coping:     [10,  25, 315, 355],   // wider for coping arms
  gospel:     [10,  15, 385, 430],   // all three + labels above/below
  repent:     [10,  15, 385, 430],
  recover:    [10,  15, 385, 430],
};

/* ─── Animated viewBox ───────────────────────────────────────────────── */
function useAnimatedViewBox(target: VB): string {
  const current = useRef<VB>(target);
  const [vb, setVb] = useState<VB>(target);
  const raf = useRef<number|undefined>(undefined);
  useEffect(() => {
    const from = current.current;
    const to   = target;
    if (from.every((v,i) => v === to[i])) return;
    const start = performance.now();
    const dur   = 480;
    const ease  = (t: number) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    function tick(now: number) {
      const t = Math.min((now-start)/dur, 1);
      const e = ease(t);
      const next = from.map((v,i) => v+(to[i]-v)*e) as VB;
      setVb(next);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else current.current = to;
    }
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target]);
  return vb.join(" ");
}

/* ─── Draw-on animation ──────────────────────────────────────────────── */
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

/* ─── SVG primitives ─────────────────────────────────────────────────── */
function AnimCircle({ cx,cy,r,stroke,strokeW=2.8,show,delay=0 }: { cx:number;cy:number;r:number;stroke:string;strokeW?:number;show:boolean;delay?:number }) {
  const drawn = useDrawOn(show, delay);
  const circ  = 2*Math.PI*r;
  return <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={strokeW} strokeDasharray={circ} strokeDashoffset={drawn?0:circ} style={{ transition: drawn ? `stroke-dashoffset 0.85s cubic-bezier(0.4,0,0.2,1)` : "none", opacity: show?1:0 }} />;
}

function AnimPath({ d,stroke,strokeW=2.6,show,delay=0,len=320 }: { d:string;stroke:string;strokeW?:number;show:boolean;delay?:number;len?:number }) {
  const drawn = useDrawOn(show, delay);
  return <path d={d} fill="none" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={drawn?0:len} style={{ transition: drawn ? `stroke-dashoffset 0.72s cubic-bezier(0.4,0,0.2,1)` : "none", opacity: show?1:0 }} />;
}

// Label that fades in quickly (no long delay — show it as circle draws)
function Lbl({ x,y,lines,fill,size=15,weight=700,show,delay=0,anchor="middle" }: { x:number;y:number;lines:string[];fill:string;size?:number;weight?:number;show:boolean;delay?:number;anchor?:"middle"|"start"|"end" }) {
  const [op, setOp] = useState(0);
  const prev = useRef(false);
  useEffect(() => {
    if (show && !prev.current) {
      setOp(0);
      const t = setTimeout(() => setOp(1), delay + 300);
      return () => clearTimeout(t);
    }
    prev.current = show;
  }, [show, delay]);
  return (
    <text textAnchor={anchor} fill={fill} fontSize={size} fontWeight={weight}
      fontFamily="var(--font-barlow-condensed), sans-serif" letterSpacing="0.07em"
      style={{ transition:"opacity 0.3s ease", opacity:show?op:0, textTransform:"uppercase" }}>
      {lines.map((l,i) => <tspan key={i} x={x} dy={i===0?0:size*1.25}>{l}</tspan>)}
    </text>
  );
}

/* ─── Broken circle (fragmented arcs) ───────────────────────────────── */
function BrokenCircle({ show }: { show:boolean }) {
  const drawn = useDrawOn(show, 0);
  const segs = [
    `M ${BX+R},${BY} A ${R},${R} 0 0 1 ${BX+47},${BY-48}`,
    `M ${BX+40},${BY-54} A ${R},${R} 0 0 1 ${BX-14},${BY-65}`,
    `M ${BX-23},${BY-62} A ${R},${R} 0 0 1 ${BX-59},${BY-32}`,
    `M ${BX-63},${BY-19} A ${R},${R} 0 0 1 ${BX-63},${BY+19}`,
    `M ${BX-59},${BY+32} A ${R},${R} 0 0 1 ${BX-23},${BY+62}`,
    `M ${BX-14},${BY+65} A ${R},${R} 0 0 1 ${BX+40},${BY+54}`,
    `M ${BX+47},${BY+48} A ${R},${R} 0 0 1 ${BX+R},${BY}`,
  ];
  return (
    <g style={{ opacity: show?1:0 }}>
      {segs.map((d,i) => (
        <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={2.8} strokeLinecap="round"
          strokeDasharray={65} strokeDashoffset={drawn?0:65}
          style={{ transition: drawn ? `stroke-dashoffset 0.45s cubic-bezier(0.4,0,0.2,1) ${i*65}ms` : "none" }} />
      ))}
    </g>
  );
}

function Arrowhead({ x,y,angle,color,show }: { x:number;y:number;angle:number;color:string;show:boolean }) {
  const sz = 7, rad = (angle*Math.PI)/180;
  const tip = {x,y};
  const left  = { x: x - sz*Math.cos(rad) + (sz/2)*Math.sin(rad), y: y - sz*Math.sin(rad) - (sz/2)*Math.cos(rad) };
  const right = { x: x - sz*Math.cos(rad) - (sz/2)*Math.sin(rad), y: y - sz*Math.sin(rad) + (sz/2)*Math.cos(rad) };
  return <polygon points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`} fill={color} style={{ opacity:show?1:0, transition:"opacity 0.3s ease 0.6s" }} />;
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function ThreeCircles() {
  const [stepIdx, setStepIdx] = useState(0);
  const step   = STEPS[stepIdx];
  const v      = step.id;
  const canNext = stepIdx < STEPS.length - 1;
  const canPrev = stepIdx > 0;

  const TEAL  = "#00abc9";
  const RED   = "rgba(255,100,60,0.92)";
  const WHITE = "rgba(255,255,255,0.88)";
  const DIM   = "rgba(255,255,255,0.38)";

  const viewBox = useAnimatedViewBox(VIEWBOXES[v]);

  // ── Swipe support ───────────────────────────────────────────────────
  const touchX = useRef<number|null>(null);
  const touchY = useRef<number|null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null || touchY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 38) {
      if (dx < 0 && canNext) setStepIdx(i => i + 1);
      if (dx > 0 && canPrev) setStepIdx(i => i - 1);
    }
    touchX.current = null;
    touchY.current = null;
  };

  // ── Design circle label — ABOVE the circle ──────────────────────────
  const DLABEL_Y = DY - R - 18;  // above Design circle
  const GLABEL_Y = GY - R - 18;  // above Gospel circle
  const BLABEL_Y = BY + R + 22;  // below Brokenness

  // ── Arrow paths ──────────────────────────────────────────────────────
  const sinStart  = { x: DX+28, y: DY+56 };
  const sinEnd    = { x: BX-50, y: BY-34 };
  const repentStart = { x: BX+50, y: BY-34 };
  const repentEnd   = { x: GX-44, y: GY+52 };

  return (
    <div
      className="w-full select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Mobile nav row (always visible above diagram) ── */}
      <div className="flex items-center justify-between mb-5">
        {/* Prev */}
        <button
          onClick={() => setStepIdx(i => Math.max(0, i-1))}
          disabled={!canPrev}
          className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full border transition-all"
          style={{
            borderColor: canPrev ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)",
            color: canPrev ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.14)",
            background: "transparent", cursor: canPrev ? "pointer" : "not-allowed",
          }}
        >← Back</button>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {STEPS.map((s,i) => (
            <button key={s.id} onClick={() => setStepIdx(i)} aria-label={`Step ${i+1}`}
              style={{
                width: i===stepIdx ? 26 : 7, height: 7, borderRadius: 4, padding: 0,
                background: i===stepIdx ? TEAL : "rgba(255,255,255,0.18)",
                border: "none", cursor: "pointer", transition: "all 0.3s ease",
              }} />
          ))}
        </div>

        {/* Next / CTA */}
        {canNext ? (
          <button
            onClick={() => setStepIdx(i => Math.min(STEPS.length-1, i+1))}
            className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full transition-colors"
            style={{ background: TEAL, color: "#00142a", cursor: "pointer" }}
          >Next →</button>
        ) : (
          <a href="/connect"
            className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full inline-block"
            style={{ background: TEAL, color: "#00142a" }}>Talk →</a>
        )}
      </div>

      {/* ── Diagram + text (side by side on large, stacked on mobile) ── */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-center lg:items-start">

        {/* SVG canvas */}
        <div className="w-full max-w-sm lg:max-w-none lg:w-[420px] flex-shrink-0 mx-auto lg:mx-0">
          {/* Swipe hint (mobile only, step 1) */}
          {stepIdx === 0 && (
            <p className="text-center text-xs mb-3 lg:hidden" style={{ color: "rgba(255,255,255,0.25)", letterSpacing:"0.06em" }}>
              SWIPE TO CONTINUE
            </p>
          )}
          <svg viewBox={viewBox} className="w-full h-auto" style={{ overflow:"visible" }}>
            <defs>
              <filter id="sk" x="-8%" y="-8%" width="116%" height="116%">
                <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="9" result="n"/>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/>
              </filter>
            </defs>

            {/* ── God's Design circle ── */}
            <g filter="url(#sk)">
              <AnimCircle cx={DX} cy={DY} r={R} stroke={TEAL} strokeW={3} show={vis(v,"design-circle")}/>
            </g>
            {/* Cross */}
            <line x1={DX} y1={DY-30} x2={DX} y2={DY+30} stroke={TEAL} strokeWidth="2.5" strokeLinecap="round"
              style={{ opacity: vis(v,"design-circle")?0.48:0, transition:"opacity 0.5s ease 0.9s" }}/>
            <line x1={DX-22} y1={DY-8} x2={DX+22} y2={DY-8} stroke={TEAL} strokeWidth="2.5" strokeLinecap="round"
              style={{ opacity: vis(v,"design-circle")?0.48:0, transition:"opacity 0.5s ease 0.9s" }}/>
            {/* Label ABOVE */}
            <Lbl x={DX} y={DLABEL_Y} lines={["God's","Design"]} fill={TEAL} size={15} show={vis(v,"design-label")}/>

            {/* ── Gospel circle ── */}
            <g filter="url(#sk)">
              <AnimCircle cx={GX} cy={GY} r={R} stroke={WHITE} strokeW={3} show={vis(v,"gospel-circle")}/>
            </g>
            <line x1={GX} y1={GY-33} x2={GX} y2={GY+33} stroke={WHITE} strokeWidth="3" strokeLinecap="round"
              style={{ opacity: vis(v,"gospel-circle")?0.82:0, transition:"opacity 0.5s ease 0.9s" }}/>
            <line x1={GX-23} y1={GY-10} x2={GX+23} y2={GY-10} stroke={WHITE} strokeWidth="3" strokeLinecap="round"
              style={{ opacity: vis(v,"gospel-circle")?0.82:0, transition:"opacity 0.5s ease 0.9s" }}/>
            {/* Label ABOVE */}
            <Lbl x={GX} y={GLABEL_Y} lines={["The","Gospel"]} fill={WHITE} size={15} show={vis(v,"gospel-label")}/>

            {/* ── Brokenness circle ── */}
            <g filter="url(#sk)">
              <BrokenCircle show={vis(v,"broken-circle")}/>
            </g>
            {/* Label BELOW */}
            <Lbl x={BX} y={BLABEL_Y} lines={["Brokenness"]} fill={DIM} size={15} show={vis(v,"broken-labels")}/>
            {/* Interior words */}
            {["Pain","Shame","Anxiety"].map((w,i) => (
              <Lbl key={w} x={BX} y={BY-16+i*20} lines={[w]}
                fill="rgba(255,255,255,0.34)" size={14} weight={400}
                show={vis(v,"broken-labels")} delay={i*180}/>
            ))}

            {/* ── Sin arrow: Design → Brokenness ── */}
            <AnimPath
              d={`M ${sinStart.x},${sinStart.y} Q ${DX+45},${(DY+BY)/2} ${sinEnd.x},${sinEnd.y}`}
              stroke={RED} strokeW={2.6} show={vis(v,"sin-arrow")} len={240}/>
            <Arrowhead x={sinEnd.x} y={sinEnd.y} angle={-148} color={RED} show={vis(v,"sin-arrow")}/>
            <Lbl x={DX+12} y={(DY+BY)/2+8} lines={["Sin"]} fill={RED} size={15} show={vis(v,"sin-arrow")}/>

            {/* ── Coping loops ── */}
            <AnimPath d={`M ${BX+60},${BY-22} Q ${BX+108},${BY-68} ${BX+78},${BY+40}`}
              stroke="rgba(255,255,255,0.2)" strokeW={1.8} show={vis(v,"cope-arrows")} len={200}/>
            <AnimPath d={`M ${BX-60},${BY-22} Q ${BX-108},${BY-68} ${BX-78},${BY+40}`}
              stroke="rgba(255,255,255,0.2)" strokeW={1.8} show={vis(v,"cope-arrows")} len={200} delay={120}/>
            <Lbl x={BX+110} y={BY-55} lines={["Money"]}   fill="rgba(255,255,255,0.30)" size={13} weight={500} show={vis(v,"cope-arrows")} delay={80}/>
            <Lbl x={BX-110} y={BY-55} lines={["Religion"]} fill="rgba(255,255,255,0.30)" size={13} weight={500} show={vis(v,"cope-arrows")} delay={220}/>
            <Lbl x={BX}     y={BY-92} lines={["Success"]}  fill="rgba(255,255,255,0.30)" size={13} weight={500} show={vis(v,"cope-arrows")} delay={380}/>

            {/* ── Repent arrow: Brokenness → Gospel ── */}
            <AnimPath
              d={`M ${repentStart.x},${repentStart.y} Q ${GX-18},${(GY+BY)/2-20} ${repentEnd.x},${repentEnd.y}`}
              stroke={TEAL} strokeW={2.8} show={vis(v,"repent-arrow")} len={260}/>
            <Arrowhead x={repentEnd.x} y={repentEnd.y} angle={-50} color={TEAL} show={vis(v,"repent-arrow")}/>
            <Lbl x={GX-18} y={(GY+BY)/2+10} lines={["Repent","& Believe"]} fill={TEAL} size={13} show={vis(v,"repent-arrow")} anchor="start"/>

            {/* ── Restore arrow: Gospel → Design ── */}
            <AnimPath
              d={`M ${GX-R-2},${GY} Q 200,${GY-70} ${DX+R+2},${DY}`}
              stroke={TEAL} strokeW={2.8} show={vis(v,"restore-arrow")} len={260} delay={350}/>
            <Arrowhead x={DX+R+2} y={DY} angle={180} color={TEAL} show={vis(v,"restore-arrow")}/>
            <Lbl x={200} y={GY-58} lines={["Restored"]} fill={TEAL} size={13} show={vis(v,"restore-arrow")} delay={500}/>

            {/* ── Recover arrow (dashed) ── */}
            {vis(v,"recover-arrow") && (
              <path d={`M ${DX+22},${DY+58} Q ${DX-24},${(DY+BY)/2} ${BX-56},${BY-26}`}
                fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.8}
                strokeLinecap="round" strokeDasharray="5 6"/>
            )}
            <Lbl x={DX-24} y={(DY+BY)/2+12} lines={["Recover"]} fill="rgba(255,255,255,0.30)" size={12} show={vis(v,"recover-arrow")} delay={100}/>
          </svg>
        </div>

        {/* Text panel */}
        <div className="flex-1 flex flex-col justify-center lg:pt-6 px-1 lg:px-0">
          <p className="font-condensed font-900 mb-3"
            style={{ fontSize:"5rem", lineHeight:1, color:TEAL, opacity:0.14, letterSpacing:"-0.03em" }}>
            0{step.num}
          </p>
          <h3 className="font-condensed font-900 text-white mb-4"
            style={{ fontSize:"clamp(1.9rem, 4.5vw, 2.6rem)", letterSpacing:"-0.02em", lineHeight:1.05 }}>
            {step.title}
          </h3>
          <p className="text-white/58 leading-relaxed mb-6" style={{ fontSize:"1.05rem", maxWidth:420 }}>
            {step.body}
          </p>
          {step.cta && (
            <p className="font-condensed font-700 mb-8" style={{ color:TEAL, fontSize:"1.05rem" }}>
              {step.cta}
            </p>
          )}
          {/* Desktop-only large nav buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <button onClick={() => setStepIdx(i => Math.max(0, i-1))} disabled={!canPrev}
              className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full border transition-all"
              style={{ borderColor: canPrev?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.06)", color: canPrev?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.15)", background:"transparent", cursor:canPrev?"pointer":"not-allowed" }}>
              ← Back
            </button>
            {canNext ? (
              <button onClick={() => setStepIdx(i => Math.min(STEPS.length-1, i+1))}
                className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-2.5 rounded-full transition-colors"
                style={{ background:TEAL, color:"#00142a", cursor:"pointer" }}>
                Next →
              </button>
            ) : (
              <a href="/connect" className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-2.5 rounded-full inline-block"
                style={{ background:TEAL, color:"#00142a" }}>
                Talk to Someone
              </a>
            )}
            <span className="text-white/22 text-sm font-condensed">{stepIdx+1} / {STEPS.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
