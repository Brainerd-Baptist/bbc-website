"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Steps ──────────────────────────────────────────────────────────── */
const STEPS = [
  { id:"brokenness", num:1, title:"We Live in Brokenness",         body:"You feel it. Everyone does. Anxiety, loneliness, relationships that fall apart — a sense that something is deeply wrong with the world and with us. The Bible calls it brokenness.",                                              cta:"But how did we get here?" },
  { id:"design",     num:2, title:"God's Original Design",          body:"God made the world good. He designed people to know him, love each other, and live in wholeness. This is what we were made for — purpose, peace, and relationship with God.",                                                    cta:"So what went wrong?" },
  { id:"sin",        num:3, title:"Sin Broke Everything",           body:"Sin is the choice to leave God out — to do things our own way. That choice, made by the first humans and repeated by every person since, shattered God's design and brought brokenness into the world.",                       cta:"Can't we fix it ourselves?" },
  { id:"coping",     num:4, title:"We Keep Trying to Escape",       body:"We reach for things to fill the gap — money, success, romance, religion. Some are good things. But none of them fix brokenness. They always loop us back to more of it.",                                                      cta:"Is there a way out?" },
  { id:"gospel",     num:5, title:"God Had a Plan",                 body:"God sent his Son Jesus — fully God, fully human — to live the life we couldn't live, die the death we deserved, and rise from the dead three days later. Jesus defeated sin and opened a way back.",                          cta:"How do I get there?" },
  { id:"repent",     num:6, title:"Repent and Believe",             body:"We move from brokenness to God's design by going through the Gospel. Repent — turn from sin. Believe — trust Jesus with your whole life. This is how we enter a restored relationship with God.",                             cta:"What if I fall back?" },
  { id:"recover",    num:7, title:"The Way Back Is Always the Same",body:"Even after following Jesus, we stumble back into brokenness. But the Gospel is still the way home. Repent again. Believe again. Return to God's design — not through willpower, but through Jesus.",                        cta:null },
];

type Elem = "broken-circle"|"broken-inner"|"design-circle"|"design-inner"|"sin-arrow"|"cope-labels"|"gospel-circle"|"gospel-inner"|"repent-arrow"|"restore-arrow"|"recover-arrow";

/* Fix #3: remove "cope-labels" from steps 5-7 so they fade out when Gospel appears */
const VISIBLE: Record<string,Elem[]> = {
  brokenness: ["broken-circle","broken-inner"],
  design:     ["broken-circle","broken-inner","design-circle","design-inner"],
  sin:        ["broken-circle","broken-inner","design-circle","design-inner","sin-arrow"],
  coping:     ["broken-circle","broken-inner","design-circle","design-inner","sin-arrow","cope-labels"],
  gospel:     ["broken-circle","broken-inner","design-circle","design-inner","sin-arrow","gospel-circle","gospel-inner"],
  repent:     ["broken-circle","broken-inner","design-circle","design-inner","sin-arrow","gospel-circle","gospel-inner","repent-arrow","restore-arrow"],
  recover:    ["broken-circle","broken-inner","design-circle","design-inner","sin-arrow","gospel-circle","gospel-inner","repent-arrow","restore-arrow","recover-arrow"],
};
const vis = (step: string, e: Elem) => VISIBLE[step]?.includes(e) ?? false;

/* ─── Geometry — matches the official Three Circles layout ──────────
   God's Design  ← top-left
   Brokenness    ← top-right  (arrow: SIN goes over the top GD→B)
   Gospel        ← bottom-center
   Flow: GD→B (sin) → B→G (repent & believe) → G→GD (recover & pursue)
*/
const GDX=108, GDY=120, R=72;   // God's Design (top-left)
const BX =310, BY =120;          // Brokenness   (top-right)
const GPX=209, GPY=300;          // Gospel       (bottom)

/* ─── Per-step viewBox "camera" ─────────────────────────────────────── */
type VB = [number,number,number,number];
const VIEWBOXES: Record<string,VB> = {
  brokenness: [206, 22, 200, 200],
  design:     [ 22, 36, 360, 178],
  sin:        [ 22,  6, 360, 208],
  coping:     [ 22,  6, 374, 258],   // Fix #1: wider to prevent "RELIGION" clipping
  gospel:     [ 22,  6, 360, 368],   // Fix #5: tighter bottom (was 388)
  repent:     [ 22,  6, 360, 368],
  recover:    [ 22,  6, 360, 368],
};

/* ─── Animated viewBox ───────────────────────────────────────────────── */
function useAnimVB(target: VB): string {
  const cur = useRef<VB>(target);
  const [vb, setVb] = useState<VB>(target);
  const raf = useRef<number|undefined>(undefined);
  useEffect(() => {
    const from = cur.current, to = target;
    if (from.every((v,i)=>v===to[i])) return;
    const start = performance.now(), dur = 500;
    const ease = (t:number) => t<.5 ? 2*t*t : -1+(4-2*t)*t;
    function tick(now: number) {
      const t = Math.min((now-start)/dur,1);
      setVb(from.map((v,i)=>v+(to[i]-v)*ease(t)) as VB);
      if (t<1) raf.current = requestAnimationFrame(tick); else cur.current=to;
    }
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); };
  }, [target]);
  return vb.join(" ");
}

/* ─── Draw-on helper ─────────────────────────────────────────────────── */
function useDrawOn(show: boolean, delay=0) {
  const [on, setOn] = useState(false);
  const prev = useRef(false);
  useEffect(()=>{
    if (show && !prev.current) {
      setOn(false);
      const t = setTimeout(()=>setOn(true), delay);
      return ()=>clearTimeout(t);
    }
    prev.current = show;
  },[show,delay]);
  return on;
}

/* ─── Animated circle (draws itself on) ─────────────────────────────── */
function AnimCircle({cx,cy,r,stroke,sw=2.8,show,delay=0}:{cx:number;cy:number;r:number;stroke:string;sw?:number;show:boolean;delay?:number}) {
  const on = useDrawOn(show,delay);
  const c  = 2*Math.PI*r;
  return <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={sw}
    strokeDasharray={c} strokeDashoffset={on?0:c}
    style={{transition:on?`stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)`:undefined, opacity:show?1:0}}/>;
}

/* ─── Animated path ─────────────────────────────────────────────────── */
function AnimPath({d,stroke,sw=2.6,show,delay=0,len=280}:{d:string;stroke:string;sw?:number;show:boolean;delay?:number;len?:number}) {
  const on = useDrawOn(show,delay);
  return <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
    strokeDasharray={len} strokeDashoffset={on?0:len}
    style={{transition:on?`stroke-dashoffset .72s cubic-bezier(.4,0,.2,1)`:undefined, opacity:show?1:0}}/>;
}

/* ─── Fading label ───────────────────────────────────────────────────── */
function Fade({show,delay=0,children,style}:{show:boolean;delay?:number;children:React.ReactNode;style?:React.CSSProperties}) {
  const [op,setOp] = useState(0);
  const prev = useRef(false);
  useEffect(()=>{
    if(show && !prev.current){ setOp(0); const t=setTimeout(()=>setOp(1),delay+300); return ()=>clearTimeout(t); }
    prev.current=show;
  },[show,delay]);
  return <g style={{opacity:show?op:0,transition:`opacity .35s ease`,...style}}>{children}</g>;
}

/* ─── Multi-line text helper ─────────────────────────────────────────── */
function MLText({x,y,lines,fill,size=15,weight=800,anchor="middle",ls="0.06em"}:{
  x:number;y:number;lines:string[];fill:string;size?:number;weight?:number;anchor?:string;ls?:string
}) {
  return (
    <text y={y} textAnchor={anchor as any} fill={fill} fontSize={size} fontWeight={weight}
      fontFamily="var(--font-barlow-condensed), sans-serif"
      letterSpacing={ls} style={{textTransform:"uppercase"}}>
      {lines.map((l,i)=><tspan key={i} x={x} dy={i===0?0:size*1.3}>{l}</tspan>)}
    </text>
  );
}

/* ─── Broken circle (fragmented arcs = brokenness) ──────────────────── */
function BrokenCircle({show}:{show:boolean}) {
  const on = useDrawOn(show,0);
  const segs=[
    `M ${BX+R},${BY} A ${R},${R} 0 0 1 ${BX+48},${BY-49}`,
    `M ${BX+41},${BY-55} A ${R},${R} 0 0 1 ${BX-14},${BY-66}`,
    `M ${BX-23},${BY-63} A ${R},${R} 0 0 1 ${BX-60},${BY-33}`,
    `M ${BX-64},${BY-20} A ${R},${R} 0 0 1 ${BX-64},${BY+20}`,
    `M ${BX-60},${BY+33} A ${R},${R} 0 0 1 ${BX-23},${BY+63}`,
    `M ${BX-14},${BY+66} A ${R},${R} 0 0 1 ${BX+41},${BY+55}`,
    `M ${BX+48},${BY+49} A ${R},${R} 0 0 1 ${BX+R},${BY}`,
  ];
  return (
    /* Fix #2 + #6: no filter wrapper here; dark fill added inside */
    <g style={{opacity:show?1:0}}>
      {/* Fix #2: visible dark fill — cooler blue tint distinguishable from the navy background */}
      <circle cx={BX} cy={BY} r={R} fill="rgba(5,30,68,0.62)" stroke="none"/>
      {segs.map((d,i)=>(
        <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth={3}
          strokeLinecap="round" strokeDasharray={65} strokeDashoffset={on?0:65}
          style={{transition:on?`stroke-dashoffset .45s cubic-bezier(.4,0,.2,1) ${i*60}ms`:undefined}}/>
      ))}
      {/* Jagged lightning marks radiating from brokenness */}
      {on && <>
        <path d={`M ${BX+74},${BY-46} l 12,-8 l -6,12 l 10,-4`} stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d={`M ${BX+74},${BY+46} l 10,8 l -4,-12 l 8,6`}   stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d={`M ${BX+20},${BY-76} l 6,-12 l 6,10 l 8,-6`}   stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </>}
    </g>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function ThreeCircles() {
  const [idx, setIdx] = useState(0);
  const step   = STEPS[idx];
  const v      = step.id;
  const canNext = idx < STEPS.length-1;
  const canPrev = idx > 0;

  const TEAL  = "#00abc9";
  const RED   = "rgba(255,90,50,0.92)";
  const WHITE = "rgba(255,255,255,0.90)";

  const viewBox = useAnimVB(VIEWBOXES[v]);

  // Swipe
  const tx = useRef<number|null>(null), ty = useRef<number|null>(null);
  const onTS = (e:React.TouchEvent)=>{ tx.current=e.touches[0].clientX; ty.current=e.touches[0].clientY; };
  const onTE = (e:React.TouchEvent)=>{
    if(tx.current===null||ty.current===null) return;
    const dx=e.changedTouches[0].clientX-tx.current, dy=e.changedTouches[0].clientY-ty.current;
    if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>36){
      if(dx<0&&canNext) setIdx(i=>i+1);
      if(dx>0&&canPrev) setIdx(i=>i-1);
    }
    tx.current=null; ty.current=null;
  };

  // Arrow geometry
  // SIN: GD upper-right → B upper-left, arc over top
  const sinStart = {x: GDX+50, y: GDY-52};
  const sinCtrl  = {x: 209, y: 22};
  const sinEnd   = {x: BX-50, y: BY-52};

  // REPENT & BELIEVE: B lower-left → GP upper-right, curves down-right side
  const repStart = {x: BX-48, y: BY+54};
  const repCtrl  = {x: 292, y: 212};
  const repEnd   = {x: GPX+50, y: GPY-52};

  // RECOVER & PURSUE: GP upper-left → GD lower-right, curves up-left side
  const recStart = {x: GPX-50, y: GPY-52};
  const recCtrl  = {x: 118, y: 212};
  const recEnd   = {x: GDX+48, y: GDY+54};

  // Midpoints of arrows (t=0.5 on quadratic bezier)
  const sinMid  = { x:(sinStart.x+2*sinCtrl.x+sinEnd.x)/4,  y:(sinStart.y+2*sinCtrl.y+sinEnd.y)/4  };
  const repMid  = { x:(repStart.x+2*repCtrl.x+repEnd.x)/4,  y:(repStart.y+2*repCtrl.y+repEnd.y)/4  };
  const recMid  = { x:(recStart.x+2*recCtrl.x+recEnd.x)/4,  y:(recStart.y+2*recCtrl.y+recEnd.y)/4  };

  return (
    <div className="w-full select-none" onTouchStart={onTS} onTouchEnd={onTE}>

      {/* ── Nav (always visible above diagram on mobile) ── */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={!canPrev}
          className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full border transition-all"
          style={{ borderColor:canPrev?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.06)", color:canPrev?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.15)", background:"transparent", cursor:canPrev?"pointer":"not-allowed" }}>
          ← Back
        </button>
        <div className="flex items-center gap-2">
          {STEPS.map((s,i)=>(
            <button key={s.id} onClick={()=>setIdx(i)} aria-label={`Step ${i+1}`}
              style={{ width:i===idx?26:7, height:7, borderRadius:4, padding:0, background:i===idx?TEAL:"rgba(255,255,255,0.18)", border:"none", cursor:"pointer", transition:"all .3s ease" }}/>
          ))}
        </div>
        {canNext
          ? <button onClick={()=>setIdx(i=>Math.min(STEPS.length-1,i+1))}
              className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full transition-colors"
              style={{ background:TEAL, color:"#00142a", cursor:"pointer" }}>Next →</button>
          : <a href="/connect" className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full inline-block"
              style={{ background:TEAL, color:"#00142a" }}>Talk →</a>
        }
      </div>

      {/* ── Layout: SVG left, text right on lg; stacked on mobile ── */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">

        {/* SVG */}
        <div className="w-full max-w-sm lg:max-w-none lg:w-[420px] flex-shrink-0 mx-auto lg:mx-0">
          {idx===0 && <p className="text-center text-xs mb-2 lg:hidden" style={{color:"rgba(255,255,255,0.22)",letterSpacing:"0.08em"}}>SWIPE TO CONTINUE</p>}
          <svg viewBox={viewBox} className="w-full h-auto" style={{overflow:"visible"}}>
            <defs>
              <filter id="sk" x="-8%" y="-8%" width="116%" height="116%">
                <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="5" result="n"/>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
              </filter>
              <marker id="arh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 Z" fill="white"/>
              </marker>
              <marker id="arht" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 Z" fill={TEAL}/>
              </marker>
              <marker id="arrr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 Z" fill={RED}/>
              </marker>
            </defs>

            {/* ═══ GOD'S DESIGN (top-left) ═══ */}
            <g filter="url(#sk)">
              <AnimCircle cx={GDX} cy={GDY} r={R} stroke={TEAL} sw={3} show={vis(v,"design-circle")}/>
            </g>
                  {/* Fix #3: compact cross centered just above the label, feels integrated not floating */}
            <line x1={GDX} y1={GDY-28} x2={GDX} y2={GDY-4} stroke={TEAL} strokeWidth="2.5" strokeLinecap="round"
              style={{opacity:vis(v,"design-circle")?.5:0,transition:"opacity .5s ease 1s"}}/>
            <line x1={GDX-14} y1={GDY-18} x2={GDX+14} y2={GDY-18} stroke={TEAL} strokeWidth="2.5" strokeLinecap="round"
              style={{opacity:vis(v,"design-circle")?.5:0,transition:"opacity .5s ease 1s"}}/>
            {/* Label sits just below the cross */}
            <Fade show={vis(v,"design-inner")}>
              <MLText x={GDX} y={GDY+8} lines={["God's","Design"]} fill={TEAL} size={15}/>
            </Fade>

            {/* ═══ BROKENNESS (top-right) ═══
                Fix #2: BrokenCircle no longer wrapped in filter — the dark
                fill circle inside it anchors the label cleanly at BX,BY */}
            <BrokenCircle show={vis(v,"broken-circle")}/>
            {/* Label inside */}
            <Fade show={vis(v,"broken-inner")}>
              <MLText x={BX} y={BY+6} lines={["Brokenness"]} fill={WHITE} size={13}/>
            </Fade>
            {/* Coping labels — only shown on step 4, fade out when Gospel appears.
                Fix #1: tighter spacing so "RELIGION" stays inside viewBox */}
            <Fade show={vis(v,"cope-labels")} delay={0}>
              <MLText x={BX-62} y={BY+108} lines={["Money"]}   fill="rgba(255,255,255,0.30)" size={12} weight={500}/>
              <MLText x={BX+6}  y={BY+108} lines={["Success"]} fill="rgba(255,255,255,0.30)" size={12} weight={500}/>
              <MLText x={BX+72} y={BY+108} lines={["Religion"]}fill="rgba(255,255,255,0.30)" size={12} weight={500}/>
            </Fade>

            {/* ═══ GOSPEL (bottom-center) ═══ */}
            <g filter="url(#sk)">
              <AnimCircle cx={GPX} cy={GPY} r={R} stroke={WHITE} sw={3.2} show={vis(v,"gospel-circle")}/>
            </g>
            {/* Fix #4: cross shifted up — crossbar at GPY-20, vertical stays centered in upper half */}
            <line x1={GPX} y1={GPY-38} x2={GPX} y2={GPY-2} stroke={WHITE} strokeWidth="3" strokeLinecap="round"
              style={{opacity:vis(v,"gospel-circle")?.82:0,transition:"opacity .5s ease 1s"}}/>
            <line x1={GPX-22} y1={GPY-22} x2={GPX+22} y2={GPY-22} stroke={WHITE} strokeWidth="3" strokeLinecap="round"
              style={{opacity:vis(v,"gospel-circle")?.82:0,transition:"opacity .5s ease 1s"}}/>
            <Fade show={vis(v,"gospel-inner")}>
              <MLText x={GPX} y={GPY+16} lines={["Gospel"]} fill={WHITE} size={17}/>
            </Fade>

            {/* ═══ SIN arrow: GD → B over top ═══ */}
            <AnimPath
              d={`M ${sinStart.x},${sinStart.y} Q ${sinCtrl.x},${sinCtrl.y} ${sinEnd.x},${sinEnd.y}`}
              stroke={RED} sw={2.5} show={vis(v,"sin-arrow")} len={240}/>
            {vis(v,"sin-arrow") && (
              <path d={`M ${sinStart.x},${sinStart.y} Q ${sinCtrl.x},${sinCtrl.y} ${sinEnd.x},${sinEnd.y}`}
                fill="none" stroke="none" markerEnd="url(#arrr)" strokeWidth="2.5"
                style={{opacity:1}}/>
            )}
            {/* SIN label — horizontal, above the arc */}
            <Fade show={vis(v,"sin-arrow")}>
              <MLText x={sinMid.x} y={sinMid.y-6} lines={["Sin"]} fill={RED} size={14} weight={700} ls="0.12em"/>
            </Fade>

            {/* ═══ REPENT & BELIEVE: B → GP, right side ═══ */}
            <AnimPath
              d={`M ${repStart.x},${repStart.y} Q ${repCtrl.x},${repCtrl.y} ${repEnd.x},${repEnd.y}`}
              stroke={TEAL} sw={2.8} show={vis(v,"repent-arrow")} len={270}/>
            {vis(v,"repent-arrow") && (
              <path d={`M ${repStart.x},${repStart.y} Q ${repCtrl.x},${repCtrl.y} ${repEnd.x},${repEnd.y}`}
                fill="none" stroke="none" markerEnd="url(#arht)" strokeWidth="2.8"/>
            )}
            {/* Fix #4: nudged outward +6px from center to reduce crowding between circles */}
            <Fade show={vis(v,"repent-arrow")}>
              <g transform={`translate(${repMid.x+32},${repMid.y}) rotate(58)`}>
                <rect x={-72} y={-17} width={144} height={21} rx={3} fill="rgba(0,20,42,0.65)"/>
                <text textAnchor="middle" y={0} fill={TEAL} fontSize={13} fontWeight={700}
                  fontFamily="var(--font-barlow-condensed),sans-serif" letterSpacing="0.08em"
                  style={{textTransform:"uppercase"}}>
                  Repent &amp; Believe
                </text>
              </g>
            </Fade>

            {/* ═══ RECOVER & PURSUE: GP → GD, left side ═══ */}
            <AnimPath
              d={`M ${recStart.x},${recStart.y} Q ${recCtrl.x},${recCtrl.y} ${recEnd.x},${recEnd.y}`}
              stroke={TEAL} sw={2.8} show={vis(v,"recover-arrow")} len={270} delay={300}/>
            {vis(v,"recover-arrow") && (
              <path d={`M ${recStart.x},${recStart.y} Q ${recCtrl.x},${recCtrl.y} ${recEnd.x},${recEnd.y}`}
                fill="none" stroke="none" markerEnd="url(#arht)" strokeWidth="2.8"/>
            )}
            {/* Fix #4: nudged outward -6px from center to reduce crowding between circles */}
            <Fade show={vis(v,"recover-arrow")} delay={300}>
              <g transform={`translate(${recMid.x-32},${recMid.y}) rotate(-58)`}>
                <rect x={-76} y={-17} width={152} height={21} rx={3} fill="rgba(0,20,42,0.65)"/>
                <text textAnchor="middle" y={0} fill={TEAL} fontSize={13} fontWeight={700}
                  fontFamily="var(--font-barlow-condensed),sans-serif" letterSpacing="0.08em"
                  style={{textTransform:"uppercase"}}>
                  Recover &amp; Pursue
                </text>
              </g>
            </Fade>


          </svg>
        </div>

        {/* Text panel */}
        <div className="flex-1 flex flex-col justify-center lg:pt-6 px-1 lg:px-0">
          <p className="font-condensed font-900 mb-2" style={{fontSize:"5rem",lineHeight:1,color:TEAL,opacity:.14,letterSpacing:"-0.03em"}}>
            0{step.num}
          </p>
          <h3 className="font-condensed font-900 text-white mb-4"
            style={{fontSize:"clamp(1.9rem,4.5vw,2.6rem)",letterSpacing:"-0.02em",lineHeight:1.05}}>
            {step.title}
          </h3>
          <p className="text-white/58 leading-relaxed mb-5" style={{fontSize:"1.05rem",maxWidth:420}}>
            {step.body}
          </p>
          {step.cta && (
            <p className="font-condensed font-700 mb-8" style={{color:TEAL,fontSize:"1.05rem"}}>
              {step.cta}
            </p>
          )}
          {/* Desktop nav buttons (mobile uses top row) */}
          <div className="hidden lg:flex items-center gap-4">
            <button onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={!canPrev}
              className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full border transition-all"
              style={{borderColor:canPrev?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.06)",color:canPrev?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.15)",background:"transparent",cursor:canPrev?"pointer":"not-allowed"}}>
              ← Back
            </button>
            {canNext
              ? <button onClick={()=>setIdx(i=>Math.min(STEPS.length-1,i+1))}
                  className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-2.5 rounded-full transition-colors"
                  style={{background:TEAL,color:"#00142a",cursor:"pointer"}}>Next →</button>
              : <a href="/connect" className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-2.5 rounded-full inline-block"
                  style={{background:TEAL,color:"#00142a"}}>Talk to Someone</a>
            }
            <span className="text-white/22 text-sm font-condensed">{idx+1} / {STEPS.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
