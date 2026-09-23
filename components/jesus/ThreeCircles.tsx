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

/* ─── Geometry ───────────────────────────────────────────────────────── */
const GDX=108, GDY=120, R=72;
const BX =310, BY =120;
const GPX=209, GPY=300;

/* ─── Per-step viewBox ───────────────────────────────────────────────── */
type VB = [number,number,number,number];
const VIEWBOXES: Record<string,VB> = {
  brokenness: [206, 22, 200, 200],
  design:     [ 22, 36, 360, 178],
  sin:        [ 22,  6, 360, 190],
  coping:     [ 22,  6, 374, 240],
  gospel:     [ 22,  6, 360, 368],
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

/* ─── Animated circle ────────────────────────────────────────────────── */
function AnimCircle({cx,cy,r,stroke,sw=2.8,show,delay=0}:{cx:number;cy:number;r:number;stroke:string;sw?:number;show:boolean;delay?:number}) {
  const on = useDrawOn(show,delay);
  const c  = 2*Math.PI*r;
  return <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={sw}
    strokeDasharray={c} strokeDashoffset={on?0:c}
    style={{transition:on?`stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)`:undefined, opacity:show?1:0}}/>;
}

/* ─── Animated path ──────────────────────────────────────────────────── */
function AnimPath({d,stroke,sw=2.6,show,delay=0,len=280}:{d:string;stroke:string;sw?:number;show:boolean;delay?:number;len?:number}) {
  const on = useDrawOn(show,delay);
  return <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
    strokeDasharray={len} strokeDashoffset={on?0:len}
    style={{transition:on?`stroke-dashoffset .72s cubic-bezier(.4,0,.2,1)`:undefined, opacity:show?1:0}}/>;
}

/* ─── Fading label ───────────────────────────────────────────────────── */
function Fade({show,delay=0,children}:{show:boolean;delay?:number;children:React.ReactNode}) {
  const [op,setOp] = useState(0);
  const prev = useRef(false);
  useEffect(()=>{
    if(show && !prev.current){ setOp(0); const t=setTimeout(()=>setOp(1),delay+300); return ()=>clearTimeout(t); }
    prev.current=show;
  },[show,delay]);
  return <g style={{opacity:show?op:0,transition:`opacity .35s ease`}}>{children}</g>;
}

/* ─── Multi-line text helper ─────────────────────────────────────────── */
/* Halo: a white outline behind every label's fill, painted first via
   paint-order, so a word sitting on top of an icon or a line stays
   legible instead of dissolving into it. #fff matches --plate, which is
   a fixed light ground regardless of theme (see the palette note below),
   so this never needs to invert. */
const HALO: React.CSSProperties = { paintOrder:"stroke", stroke:"var(--plate)", strokeWidth:5, strokeLinejoin:"round" };

function MLText({x,y,lines,fill,size=15,weight=800,anchor="middle",ls="0.06em"}:{
  x:number;y:number;lines:string[];fill:string;size?:number;weight?:number;anchor?:React.SVGAttributes<SVGTextElement>["textAnchor"];ls?:string
}) {
  return (
    <text y={y} textAnchor={anchor} fill={fill} fontSize={size} fontWeight={weight}
      fontFamily="var(--font-barlow-condensed), sans-serif"
      letterSpacing={ls} style={{textTransform:"uppercase", ...HALO}}>
      {lines.map((l,i)=><tspan key={i} x={x} dy={i===0?0:size*1.3}>{l}</tspan>)}
    </text>
  );
}

/* ─── Broken circle ──────────────────────────────────────────────────── */
function BrokenCircle({show, navy}:{show:boolean; navy:string}) {
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
  /* On white: dark navy arcs, no fill needed — they read perfectly */
  return (
    <g style={{opacity:show?1:0}}>
      {segs.map((d,i)=>(
        <path key={i} d={d} fill="none" stroke={navy} strokeWidth={3} strokeOpacity={0.75}
          strokeLinecap="round" strokeDasharray={65} strokeDashoffset={on?0:65}
          style={{transition:on?`stroke-dashoffset .45s cubic-bezier(.4,0,.2,1) ${i*60}ms`:undefined}}/>
      ))}
      {on && <>
        <path d={`M ${BX+74},${BY-46} l 12,-8 l -6,12 l 10,-4`} stroke={navy} strokeOpacity={0.38} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d={`M ${BX+74},${BY+46} l 10,8 l -4,-12 l 8,6`}   stroke={navy} strokeOpacity={0.38} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d={`M ${BX+20},${BY-76} l 6,-12 l 6,10 l 8,-6`}   stroke={navy} strokeOpacity={0.38} strokeWidth="2" fill="none" strokeLinecap="round"/>
      </>}
    </g>
  );
}

/* ─── Pencil pop: a small spring-scale after a stroke finishes drawing ──
   Shared by every hand-drawn icon below via SMIL (not CSS) so the pivot
   is exact SVG user-space, with no cross-browser transform-origin
   ambiguity on plain shapes. ─────────────────────────────────────────── */
function popTransform(popDelayMs: number) {
  return (
    <animateTransform attributeName="transform" type="scale" values="1;1;1.14;1" keyTimes="0;0.7;0.85;1"
      dur="1s" begin={`${popDelayMs}ms`} fill="freeze" calcMode="spline"
      keySplines="0 0 1 1;.34 1.56 .64 1;.34 1.56 .64 1"/>
  );
}

/* ─── Drawn icon: a stroked shape (optionally filled) that draws on like
   pencil, then pops. `d`/`len` are in LOCAL coordinates centered on 0,0;
   the icon is positioned by translating the whole group to (cx,cy). ─── */
function DrawIcon({cx,cy,d,len,stroke,sw=2.6,fill,show,delay=0,popDelay}:{
  cx:number;cy:number;d:string;len:number;stroke:string;sw?:number;fill?:string;
  show:boolean;delay?:number;popDelay?:number;
}) {
  const on = useDrawOn(show, delay);
  const pd = popDelay ?? delay + 950;
  return (
    <g transform={`translate(${cx},${cy})`} filter="url(#sk)" style={{opacity:show?1:0,transition:"opacity .3s ease"}}>
      {show && (
        <g>
          {popTransform(pd)}
          {fill && <path d={d} fill={fill} fillOpacity={on?0.14:0} stroke="none" style={{transition:"fill-opacity .5s ease .9s"}}/>}
          <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={len} strokeDashoffset={on?0:len}
            style={{transition:on?`stroke-dashoffset .85s cubic-bezier(.4,0,.2,1)`:undefined}}/>
        </g>
      )}
    </g>
  );
}

/* ─── Cross icon: two strokes drawn in sequence (down the shaft, then the
   crossbar) so it reads as a hand actually drawing a cross. ─────────── */
function CrossIcon({cx,cy,stroke,show,delay=0,popDelay}:{
  cx:number;cy:number;stroke:string;show:boolean;delay?:number;popDelay?:number;
}) {
  const onV = useDrawOn(show, delay);
  const onH = useDrawOn(show, delay+380);
  const pd = popDelay ?? delay + 1000;
  return (
    <g transform={`translate(${cx},${cy})`} filter="url(#sk)" style={{opacity:show?1:0,transition:"opacity .3s ease"}}>
      {show && (
        <g>
          {popTransform(pd)}
          <path d="M 0,-34 L 0,10" fill="none" stroke={stroke} strokeWidth={3.2} strokeLinecap="round"
            strokeDasharray={44} strokeDashoffset={onV?0:44}
            style={{transition:onV?`stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)`:undefined}}/>
          <path d="M -16,-16 L 16,-16" fill="none" stroke={stroke} strokeWidth={3.2} strokeLinecap="round"
            strokeDasharray={32} strokeDashoffset={onH?0:32}
            style={{transition:onH?`stroke-dashoffset .4s cubic-bezier(.4,0,.2,1)`:undefined}}/>
        </g>
      )}
    </g>
  );
}

/* ─── Running stick figure: travels along `path` (SMIL animateMotion)
   with a looping leg/arm swing (SMIL animateTransform), so it reads as
   running rather than sliding. Mounted only while `show`, so nothing
   animates off-screen. ───────────────────────────────────────────────── */
function RunningMan({path,color,show}:{path:string;color:string;show:boolean}) {
  const [key,setKey] = useState(0);
  const prev = useRef(false);
  useEffect(()=>{ if(show && !prev.current) setKey(k=>k+1); prev.current = show; },[show]);

  // These are finite (non-looping) SMIL animations. A default begin="0s" is
  // relative to when the SVG document itself loaded, not to when this
  // figure actually mounts — so by the time you've clicked through a few
  // steps, the browser considers the animation's time window already
  // elapsed and jumps straight to the frozen end pose without ever
  // playing it. begin="indefinite" + an explicit beginElement() call, run
  // right when the figure mounts, starts the clock at the real moment it
  // becomes visible instead.
  const motionRef = useRef<SVGAnimateMotionElement>(null);
  const leg1Ref = useRef<SVGAnimateTransformElement>(null);
  const leg2Ref = useRef<SVGAnimateTransformElement>(null);
  const arm1Ref = useRef<SVGAnimateTransformElement>(null);
  const arm2Ref = useRef<SVGAnimateTransformElement>(null);
  useEffect(() => {
    if (!show) return;
    const els: (SVGAnimationElement|null)[] = [motionRef.current, leg1Ref.current, leg2Ref.current, arm1Ref.current, arm2Ref.current];
    els.forEach(el => { try { el?.beginElement(); } catch {} });
  }, [show, key]);

  if (!show) return null;
  return (
    <g key={key} filter="url(#sk)">
      <g>
        {/* Runs the crossing twice, then stops (freezes) at Brokenness — not an endless loop */}
        <animateMotion ref={motionRef} dur="1.4s" begin="indefinite" repeatCount="2" fill="freeze" path={path}/>
        <circle cx="0" cy="-10" r="4" fill={color}/>
        <line x1="0" y1="-6" x2="0" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <g>
          <animateTransform ref={leg1Ref} attributeName="transform" type="rotate" values="34 0 4;-34 0 4;34 0 4" dur="0.3s" begin="indefinite" repeatCount="9" fill="freeze"/>
          <line x1="0" y1="4" x2="-7" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g>
          <animateTransform ref={leg2Ref} attributeName="transform" type="rotate" values="-34 0 4;34 0 4;-34 0 4" dur="0.3s" begin="indefinite" repeatCount="9" fill="freeze"/>
          <line x1="0" y1="4" x2="7" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g>
          <animateTransform ref={arm1Ref} attributeName="transform" type="rotate" values="-32 0 -5;32 0 -5;-32 0 -5" dur="0.3s" begin="indefinite" repeatCount="9" fill="freeze"/>
          <line x1="0" y1="-5" x2="-7" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g>
          <animateTransform ref={arm2Ref} attributeName="transform" type="rotate" values="32 0 -5;-32 0 -5;32 0 -5" dur="0.3s" begin="indefinite" repeatCount="9" fill="freeze"/>
          <line x1="0" y1="-5" x2="7" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </g>
      </g>
    </g>
  );
}

/* ─── Praying stick figure: falls to its knees and brings its hands
   together, once, each time it comes into view (remounted via a key
   bump so the fall replays on every visit to this step). ──────────────── */
function PrayingMan({x,y,color,show}:{x:number;y:number;color:string;show:boolean}) {
  const [key,setKey] = useState(0);
  const prev = useRef(false);
  useEffect(()=>{ if(show && !prev.current) setKey(k=>k+1); prev.current = show; },[show]);

  // Same begin="indefinite" + beginElement() fix as RunningMan — see the
  // note there. Without it this kneel simply never plays once the page has
  // been open a few seconds.
  const leg1Ref = useRef<SVGAnimateTransformElement>(null);
  const leg2Ref = useRef<SVGAnimateTransformElement>(null);
  const arm1Ref = useRef<SVGAnimateTransformElement>(null);
  const arm2Ref = useRef<SVGAnimateTransformElement>(null);
  useEffect(() => {
    if (!show) return;
    [leg1Ref, leg2Ref].forEach(r => { try { r.current?.beginElement(); } catch {} });
    const t = setTimeout(() => {
      [arm1Ref, arm2Ref].forEach(r => { try { r.current?.beginElement(); } catch {} });
    }, 450);
    return () => clearTimeout(t);
  }, [show, key]);

  return (
    <g transform={`translate(${x},${y})`} filter="url(#sk)" style={{opacity:show?1:0,transition:"opacity .3s ease"}}>
      {show && (
        <g key={key}>
          <circle cx="0" cy="-14" r="4" fill={color}/>
          <line x1="0" y1="-10" x2="0" y2="0" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          {/* Legs start straight and together (standing), then splay into a kneel */}
          <g>
            <animateTransform ref={leg1Ref} attributeName="transform" type="rotate" values="0 0 0;38 0 0" dur=".55s" begin="indefinite" fill="freeze"/>
            <line x1="0" y1="0" x2="-2" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </g>
          <g>
            <animateTransform ref={leg2Ref} attributeName="transform" type="rotate" values="0 0 0;-14 0 0" dur=".55s" begin="indefinite" fill="freeze"/>
            <line x1="0" y1="0" x2="2" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </g>
          <g>
            <animateTransform ref={arm1Ref} attributeName="transform" type="rotate" values="0 0 -8;52 0 -8" dur=".45s" begin="indefinite" fill="freeze"/>
            <line x1="0" y1="-8" x2="-7" y2="0" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </g>
          <g>
            <animateTransform ref={arm2Ref} attributeName="transform" type="rotate" values="0 0 -8;-52 0 -8" dur=".45s" begin="indefinite" fill="freeze"/>
            <line x1="0" y1="-8" x2="7" y2="0" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </g>
        </g>
      )}
    </g>
  );
}

/* ─── Redeemed stick figure: a gentle standing bounce, with dashes
   radiating off it that blink in a staggered loop. ────────────────────── */
function RedeemedMan({x,y,color,show}:{x:number;y:number;color:string;show:boolean}) {
  if (!show) return null;
  const rays: [number,number,number,number][] = [
    [-12,-14,-19,-14], [12,-14,19,-14], [-9,-24,-13,-30], [9,-24,13,-30],
  ];
  return (
    <g transform={`translate(${x},${y})`} filter="url(#sk)">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="1.5s" repeatCount="indefinite"/>
        <circle cx="0" cy="-14" r="4" fill={color}/>
        <line x1="0" y1="-10" x2="0" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="0" y1="4" x2="-6" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="0" y1="4" x2="6" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="0" y1="-6" x2="-7" y2="-1" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="0" y1="-6" x2="7" y2="-1" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        {rays.map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeLinecap="round">
            <animate attributeName="opacity" values="0.15;1;0.15" dur="1.3s" begin={`${i*0.18}s`} repeatCount="indefinite"/>
          </line>
        ))}
      </g>
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

  /* The diagram's palette.
     It sits on --plate, a FIXED light ground (the artwork is drawn for white
     and inverting it does not work), so its ink is fixed too — none of these
     invert. Measured on the plate: brand cyan #00abc9 is 2.74:1, below the
     4.5:1 its text labels need AND below the 3:1 a meaningful stroke needs,
     and #e04428 is 4.18:1. So the plate uses darkened versions of the same
     hues. The navy label alpha went 0.35 -> 0.65 for the same reason (2.16:1
     -> 5.13:1).

     BAND_TEAL is separate and must stay brand cyan: the step text and the
     ghost numeral sit on the navy band, where #00abc9 is 4.75:1 and the
     darkened #007b91 would be 2.63:1 — darkening there is a regression. Same
     split the rest of the site makes between --accent and --accent-text. */
  const TEAL  = "#007b91";          // 4.95:1 on the plate
  const NAVY  = "#00205B";          // 15.47:1 on the plate
  const RED   = "#d83b1f";          // 4.60:1 on the plate (was #e04428, 4.18)
  const LABEL = "rgba(0,32,91,0.65)"; // 5.13:1 on the plate (was 0.35, 2.16)
  const BAND_TEAL = "#00abc9";      // on the navy band, NOT the plate

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
  const sinStart = {x: GDX+50, y: GDY-52};
  const sinCtrl  = {x: 209, y: 22};
  const sinEnd   = {x: BX-50, y: BY-52};

  const repStart = {x: BX-48, y: BY+54};
  const repCtrl  = {x: 292, y: 212};
  const repEnd   = {x: GPX+50, y: GPY-52};

  const recStart = {x: GPX-50, y: GPY-52};
  const recCtrl  = {x: 118, y: 212};
  const recEnd   = {x: GDX+48, y: GDY+54};

  const sinMid  = { x:(sinStart.x+2*sinCtrl.x+sinEnd.x)/4,  y:(sinStart.y+2*sinCtrl.y+sinEnd.y)/4  };
  const repMid  = { x:(repStart.x+2*repCtrl.x+repEnd.x)/4,  y:(repStart.y+2*repCtrl.y+repEnd.y)/4  };
  const recMid  = { x:(recStart.x+2*recCtrl.x+recEnd.x)/4,  y:(recStart.y+2*recCtrl.y+recEnd.y)/4  };

  // Runner travels a copy of the sin arrow, lifted above it so he isn't
  // stepping on the line itself.
  const sinRunPath = `M ${sinStart.x},${sinStart.y-16} Q ${sinCtrl.x},${sinCtrl.y-16} ${sinEnd.x},${sinEnd.y-16}`;

  // A point (and outward normal) on a quadratic bezier at parameter t — used
  // to plant the praying/redeemed figures directly on their arrows, at a
  // point along the curve clear of the rotated label, the way the runner
  // already sits right on the sin arrow.
  type Pt = {x:number;y:number};
  const bez = (p0:Pt,p1:Pt,p2:Pt,t:number): Pt => {
    const mt=1-t;
    return { x: mt*mt*p0.x+2*mt*t*p1.x+t*t*p2.x, y: mt*mt*p0.y+2*mt*t*p1.y+t*t*p2.y };
  };
  const bezOffset = (p0:Pt,p1:Pt,p2:Pt,t:number,dist:number,side:1|-1): Pt => {
    const mt=1-t;
    const dx = 2*mt*(p1.x-p0.x)+2*t*(p2.x-p1.x);
    const dy = 2*mt*(p1.y-p0.y)+2*t*(p2.y-p1.y);
    const len = Math.hypot(dx,dy) || 1;
    const p = bez(p0,p1,p2,t);
    return { x: p.x + side*(-dy/len)*dist, y: p.y + side*(dx/len)*dist };
  };
  // Near where the repent arrow arrives at the Gospel circle — offset to
  // the outside of the curve, clear of the "Repent & Believe" label.
  const prayPos = bezOffset(repStart, repCtrl, repEnd, 0.82, 16, -1);
  // Near where the recover arrow arrives back at Design — offset outward,
  // clear of the "Recover & Pursue" label, and a touch lower per feedback.
  const redeemPosRaw = bezOffset(recStart, recCtrl, recEnd, 0.82, 16, 1);
  const redeemPos = { x: redeemPosRaw.x, y: redeemPosRaw.y + 10 };

  return (
    <div className="w-full select-none" onTouchStart={onTS} onTouchEnd={onTE}>

      {/* ── Nav — stays dark, floats above the white card ── */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={!canPrev}
          className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full border transition"
          style={{ borderColor:canPrev?"var(--border-on-dark-strong)":"var(--border-on-dark)", color:canPrev?"var(--fg-on-dark-muted)":"var(--fg-on-dark-muted)", background:"transparent", cursor:canPrev?"pointer":"not-allowed" }}>
          ← Back
        </button>
        <div className="flex items-center gap-2">
          {STEPS.map((s,i)=>(
            <button key={s.id} onClick={()=>setIdx(i)} aria-label={`Step ${i+1}`}
              style={{ width:i===idx?26:7, height:7, borderRadius:4, padding:0, background:i===idx?"var(--accent)":"var(--border-on-dark-strong)", border:"none", cursor:"pointer",
                  /* Not `all`: that animates outline-width too, so the focus
                     ring fades in from zero and the dot reads as having no
                     indicator at the moment focus lands. Only the two
                     properties that actually move are animated. */
                  transition:"width .3s ease, background-color .3s ease" }}/>
          ))}
        </div>
        {canNext
          ? <button onClick={()=>setIdx(i=>Math.min(STEPS.length-1,i+1))}
              className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full transition-colors"
              style={{ background:"var(--accent-solid)", color:"var(--fg-on-accent)", border:"1px solid var(--border-on-dark)", cursor:"pointer" }}>Next →</button>
          : <a href="/connect" className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full inline-block"
              style={{ background:"var(--accent-solid)", color:"var(--fg-on-accent)", border:"1px solid var(--border-on-dark)" }}>Talk →</a>
        }
      </div>

      {/* ── Layout: white card left, dark text right on lg; stacked on mobile ── */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">

        {/* White card wrapping the SVG */}
        <div
          className="w-full max-w-sm lg:max-w-none lg:w-[420px] flex-shrink-0 mx-auto lg:mx-0 rounded-2xl"
          style={{ background: "var(--plate)", padding:"20px 16px 16px", boxShadow:"var(--shadow-lg)", border:"1px solid var(--border-on-dark)" }}
        >
          {idx===0 && (
            <p className="text-center text-xs mb-3 lg:hidden font-condensed tracking-widest"
              style={{color: "var(--fg-subtle)"}}>SWIPE TO CONTINUE</p>
          )}
          <svg viewBox={viewBox} className="w-full h-auto" style={{overflow:"visible"}}>
            <defs>
              <filter id="sk" x="-8%" y="-8%" width="116%" height="116%">
                <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="5" result="n"/>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
              </filter>
              {/* Arrowheads — teal for flow arrows, red for sin */}
              <marker id="arht" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 Z" fill={TEAL}/>
              </marker>
              <marker id="arrr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 Z" fill={RED}/>
              </marker>
              <marker id="argn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 Z" fill={NAVY}/>
              </marker>
            </defs>

            {/* ═══ GOD'S DESIGN (top-left) — teal on white — heart icon ═══ */}
            <g filter="url(#sk)">
              <AnimCircle cx={GDX} cy={GDY} r={R} stroke={TEAL} sw={3} show={vis(v,"design-circle")}/>
            </g>
            <DrawIcon cx={GDX} cy={GDY-14} show={vis(v,"design-circle")} delay={300} stroke={TEAL} fill={TEAL} sw={2.6}
              d="M 0,25.2 C -36.4,4.2 -19.6,-29.4 0,-12.6 C 19.6,-29.4 36.4,4.2 0,25.2 Z" len={170}/>
            <Fade show={vis(v,"design-inner")}>
              <MLText x={GDX} y={GDY+8} lines={["God's","Design"]} fill={TEAL} size={15}/>
            </Fade>

            {/* ═══ BROKENNESS (top-right) — navy arcs on white, no fill needed — squiggle icon ═══ */}
            <BrokenCircle show={vis(v,"broken-circle")} navy={NAVY}/>
            {/* Sized and lifted so its bottom trough clears the "Brokenness" label below it */}
            <DrawIcon cx={BX} cy={BY-16} show={vis(v,"broken-circle")} delay={300} stroke={NAVY} sw={2.6}
              d="M -31,0 Q -23,-16 -15,0 Q -7,16 0,0 Q 7,-16 15,0 Q 23,16 31,0" len={150}/>
            <Fade show={vis(v,"broken-inner")}>
              <MLText x={BX} y={BY+6} lines={["Brokenness"]} fill={NAVY} size={13}/>
            </Fade>
            {/* Coping labels — only step 4 */}
            <Fade show={vis(v,"cope-labels")}>
              <MLText x={BX-62} y={BY+108} lines={["Money"]}   fill={LABEL} size={12} weight={500}/>
              <MLText x={BX+6}  y={BY+108} lines={["Success"]} fill={LABEL} size={12} weight={500}/>
              <MLText x={BX+72} y={BY+108} lines={["Religion"]}fill={LABEL} size={12} weight={500}/>
            </Fade>

            {/* ═══ GOSPEL (bottom-center) — navy on white — cross + crown ═══ */}
            <g filter="url(#sk)">
              <AnimCircle cx={GPX} cy={GPY} r={R} stroke={NAVY} sw={3.2} show={vis(v,"gospel-circle")}/>
            </g>
            {/* Down: heaven to earth (incarnation) — left of the cross. Same
                stroke weight and length as the outer flow arrows so it reads
                as a drawn line, not just a small marker glyph. */}
            <g filter="url(#sk)">
              <AnimPath d={`M ${GPX-30},${GPY-46} L ${GPX-30},${GPY-4}`} stroke={NAVY} sw={2.8} show={vis(v,"gospel-circle")} delay={300} len={46}/>
            </g>
            {vis(v,"gospel-circle") && (
              <path d={`M ${GPX-30},${GPY-46} L ${GPX-30},${GPY-4}`} fill="none" stroke="none" markerEnd="url(#argn)" strokeWidth="2.8"/>
            )}
            <CrossIcon cx={GPX} cy={GPY-6} show={vis(v,"gospel-circle")} delay={600} stroke={NAVY}/>
            {/* The tomb, empty — the stone rolled to the side. Sits below the
                cross, with clear space kept below it for the "Gospel" label
                so the two never overlap. */}
            <g filter="url(#sk)">
              <AnimPath d={`M ${GPX-9},${GPY+26} L ${GPX-9},${GPY+13} A 9,9 0 0 1 ${GPX+9},${GPY+13} L ${GPX+9},${GPY+26}`}
                stroke={NAVY} sw={2.2} show={vis(v,"gospel-circle")} delay={1000} len={44}/>
            </g>
            <AnimCircle cx={GPX+16} cy={GPY+24} r={5} stroke={NAVY} sw={2} show={vis(v,"gospel-circle")} delay={1250}/>
            {/* Up: the ascension — right of the cross */}
            <g filter="url(#sk)">
              <AnimPath d={`M ${GPX+30},${GPY-4} L ${GPX+30},${GPY-46}`} stroke={NAVY} sw={2.8} show={vis(v,"gospel-circle")} delay={1450} len={46}/>
            </g>
            {vis(v,"gospel-circle") && (
              <path d={`M ${GPX+30},${GPY-4} L ${GPX+30},${GPY-46}`} fill="none" stroke="none" markerEnd="url(#argn)" strokeWidth="2.8"/>
            )}
            {/* Crown sits on top of the circle, partly outside it — same read as the reference art */}
            <DrawIcon cx={GPX} cy={GPY-76} show={vis(v,"gospel-circle")} delay={1700} stroke={NAVY} sw={2.6}
              d="M -20,0 L -20,-15 L -10,-4 L 0,-30 L 10,-4 L 20,-15 L 20,0 Z" len={170}/>
            <Fade show={vis(v,"gospel-inner")}>
              <MLText x={GPX} y={GPY+42} lines={["Gospel"]} fill={NAVY} size={17}/>
            </Fade>

            {/* ═══ SIN arrow ═══ */}
            <g filter="url(#sk)">
              <AnimPath
                d={`M ${sinStart.x},${sinStart.y} Q ${sinCtrl.x},${sinCtrl.y} ${sinEnd.x},${sinEnd.y}`}
                stroke={RED} sw={2.5} show={vis(v,"sin-arrow")} len={240}/>
            </g>
            {vis(v,"sin-arrow") && (
              <path d={`M ${sinStart.x},${sinStart.y} Q ${sinCtrl.x},${sinCtrl.y} ${sinEnd.x},${sinEnd.y}`}
                fill="none" stroke="none" markerEnd="url(#arrr)" strokeWidth="2.5"/>
            )}
            <Fade show={vis(v,"sin-arrow")}>
              <MLText x={sinMid.x} y={sinMid.y-6} lines={["Sin"]} fill={RED} size={14} weight={700} ls="0.12em"/>
            </Fade>
            <RunningMan path={sinRunPath} color={RED} show={vis(v,"sin-arrow")}/>

            {/* ═══ REPENT & BELIEVE: B → GP ═══ */}
            <g filter="url(#sk)">
              <AnimPath
                d={`M ${repStart.x},${repStart.y} Q ${repCtrl.x},${repCtrl.y} ${repEnd.x},${repEnd.y}`}
                stroke={TEAL} sw={2.8} show={vis(v,"repent-arrow")} len={270}/>
            </g>
            {vis(v,"repent-arrow") && (
              <path d={`M ${repStart.x},${repStart.y} Q ${repCtrl.x},${repCtrl.y} ${repEnd.x},${repEnd.y}`}
                fill="none" stroke="none" markerEnd="url(#arht)" strokeWidth="2.8"/>
            )}
            <Fade show={vis(v,"repent-arrow")}>
              <text textAnchor="middle" fill={TEAL} fontSize={13} fontWeight={700}
                fontFamily="var(--font-barlow-condensed),sans-serif" letterSpacing="0.08em"
                transform={`translate(${repMid.x+32},${repMid.y}) rotate(58)`}
                style={{textTransform:"uppercase", ...HALO}}>
                Repent &amp; Believe
              </text>
            </Fade>
            <PrayingMan x={prayPos.x} y={prayPos.y} color={TEAL} show={vis(v,"repent-arrow")}/>

            {/* ═══ RECOVER & PURSUE: GP → GD ═══ */}
            <g filter="url(#sk)">
              <AnimPath
                d={`M ${recStart.x},${recStart.y} Q ${recCtrl.x},${recCtrl.y} ${recEnd.x},${recEnd.y}`}
                stroke={TEAL} sw={2.8} show={vis(v,"recover-arrow")} len={270} delay={300}/>
            </g>
            {vis(v,"recover-arrow") && (
              <path d={`M ${recStart.x},${recStart.y} Q ${recCtrl.x},${recCtrl.y} ${recEnd.x},${recEnd.y}`}
                fill="none" stroke="none" markerEnd="url(#arht)" strokeWidth="2.8"/>
            )}
            <Fade show={vis(v,"recover-arrow")} delay={300}>
              <text textAnchor="middle" fill={TEAL} fontSize={13} fontWeight={700}
                fontFamily="var(--font-barlow-condensed),sans-serif" letterSpacing="0.08em"
                transform={`translate(${recMid.x-32},${recMid.y}) rotate(-58)`}
                style={{textTransform:"uppercase", ...HALO}}>
                Recover &amp; Pursue
              </text>
            </Fade>
            <RedeemedMan x={redeemPos.x} y={redeemPos.y} color={TEAL} show={vis(v,"recover-arrow")}/>

          </svg>
        </div>

        {/* Text panel — stays dark */}
        <div className="flex-1 flex flex-col justify-center lg:pt-6 px-1 lg:px-0">
          <p className="font-condensed font-900 mb-2" style={{fontSize:"5rem",lineHeight:1,color:BAND_TEAL,opacity:.14,letterSpacing:"-0.03em"}}>
            0{step.num}
          </p>
          <h3 className="font-condensed font-900 text-fg-on-dark mb-4"
            style={{fontSize:"clamp(1.9rem,4.5vw,2.6rem)",letterSpacing:"-0.02em",lineHeight:1.05}}>
            {step.title}
          </h3>
          <p className="text-fg-on-dark-body leading-relaxed mb-5" style={{fontSize:"1.05rem",maxWidth:420}}>
            {step.body}
          </p>
          {step.cta && (
            <p className="font-condensed font-700 mb-8" style={{color:BAND_TEAL,fontSize:"1.05rem"}}>
              {step.cta}
            </p>
          )}
          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-4">
            <button onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={!canPrev}
              className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full border transition"
              style={{borderColor:canPrev?"var(--border-on-dark-strong)":"var(--border-on-dark)",color:canPrev?"var(--fg-on-dark-muted)":"var(--fg-on-dark-muted)",background:"transparent",cursor:canPrev?"pointer":"not-allowed"}}>
              ← Back
            </button>
            {canNext
              ? <button onClick={()=>setIdx(i=>Math.min(STEPS.length-1,i+1))}
                  className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-2.5 rounded-full transition-colors"
                  style={{background:"var(--accent-solid)",color:"var(--fg-on-accent)",border:"1px solid var(--border-on-dark)",cursor:"pointer"}}>Next →</button>
              : <a href="/connect" className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-2.5 rounded-full inline-block"
                  style={{background:"var(--accent-solid)",color:"var(--fg-on-accent)"}}>Talk to Someone</a>
            }
            <span className="text-fg-on-dark-muted text-sm font-condensed">{idx+1} / {STEPS.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
