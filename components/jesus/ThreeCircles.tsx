"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";

/* Respect the visitor's "reduce motion" setting. CSS transitions are switched
   off by a scoped rule on the root element; this hook covers the things CSS
   can't reach — the SMIL animations (runner, pop, looping rays) and the
   JS-driven draw-on / viewBox tween. */
const RM_QUERY = "(prefers-reduced-motion: reduce)";
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia(RM_QUERY); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => window.matchMedia(RM_QUERY).matches,
    () => false,
  );
}

/* ─── Steps ──────────────────────────────────────────────────────────── */
/* Scripture for each step — Christian Standard Bible (CSB), the translation
   used in the NAMB 3 Circles Life Conversation Guide. Every reference on this
   guide must stay CSB. */
const SCRIPTURE: Record<string, { ref: string; text: string }[]> = {
  design: [
    { ref: "Genesis 1:31", text: "God saw all that he had made, and it was very good indeed." },
    { ref: "Psalm 19:1", text: "The heavens declare the glory of God, and the expanse proclaims the work of his hands." },
  ],
  sin: [
    { ref: "Romans 3:23", text: "For all have sinned and fall short of the glory of God." },
    { ref: "Romans 6:23a", text: "For the wages of sin is death …" },
  ],
  coping: [
    { ref: "Romans 1:25", text: "They exchanged the truth of God for a lie, and worshiped and served what has been created instead of the Creator." },
    { ref: "Proverbs 14:12", text: "There is a way that seems right to a person, but its end is the way to death." },
  ],
  gospel: [
    { ref: "John 3:16a", text: "For God loved the world in this way: He gave his one and only Son." },
    { ref: "Colossians 2:14", text: "He erased the certificate of debt … and has taken it away by nailing it to the cross." },
    { ref: "1 Corinthians 15:3\u20134", text: "Christ died for our sins according to the Scriptures … he was buried, that he was raised on the third day according to the Scriptures." },
  ],
  repent: [
    { ref: "Mark 1:15", text: "Repent and believe the good news." },
    { ref: "Ephesians 2:8\u20139", text: "For you are saved by grace through faith, and this is not from yourselves; it is God’s gift—not from works, so that no one can boast." },
    { ref: "Romans 10:9", text: "If you confess with your mouth, ‘Jesus is Lord,’ and believe in your heart that God raised him from the dead, you will be saved." },
  ],
  recover: [
    { ref: "Philippians 2:13", text: "For it is God who is working in you both to will and to work according to his good purpose." },
    { ref: "Ephesians 2:10", text: "For we are his workmanship, created in Christ Jesus for good works, which God prepared ahead of time for us to do." },
  ],
};

const STEPS = [
  { id:"brokenness", num:1, title:"We Live in Brokenness",         body:"We live in a broken world, surrounded by broken lives, broken relationships, and broken systems. We see it in suffering, violence, poverty, pain, and death. And brokenness leads us to search for a way to make life work.",                                              cta:"But how did we get here?" },
  { id:"design",     num:2, title:"God's Original Design",          body:"In contrast to all this brokenness, we also see beauty, purpose, and evidence of design around us. The Bible tells us God originally planned a world that worked perfectly, where everything and everyone fit together in harmony. He made each of us with a purpose: to worship him and walk with him.",                                                    cta:"So what went wrong?" },
  { id:"sin",        num:3, title:"Sin Broke Everything",           body:"Life doesn’t work when we ignore God and his original design. We selfishly insist on doing things our own way. The Bible calls this sin, and we all sin and distort that design. The consequence is separation from God, in this life and for all eternity.",                       cta:"Can't we fix it ourselves?" },
  { id:"coping",     num:4, title:"We Keep Trying to Escape",       body:"Sin leads to brokenness. We see it all around us and in our own lives. When we realize life isn’t working, we look for a way out, going in many directions and trying different things to figure it out on our own. Brokenness leads us to realize we need something greater.",                                                      cta:"Is there a way out?" },
  { id:"gospel",     num:5, title:"God Had a Plan",                 body:"At this point we need a remedy, some good news. Because of his love, God didn’t leave us in our brokenness. Jesus, God in human flesh, came and lived perfectly according to God’s design. He came to rescue us, taking our sin and shame to the cross and paying the penalty with his death. Then God raised him from the dead, the only way for us to be restored to a relationship with God.",                          cta:"How do I get there?" },
  { id:"repent",     num:6, title:"Repent and Believe",             body:"Simply hearing this good news isn’t enough. We must admit our sinful brokenness and stop trusting ourselves, because we can’t escape on our own. We ask God to forgive us, turning from sin to trust only in Jesus. This is what it means to repent and believe. Believing, we receive new life, and God turns our lives in a new direction.",                             cta:"What if I fall back?" },
  { id:"recover",    num:7, title:"The Way Back Is Always the Same",body:"When God restores our relationship with him, we begin to find meaning and purpose in a broken world, and we can pursue his design in every area of life. Even when we fail, we know the way back: the same good news of Jesus. God’s Spirit empowers us to recover his design and assures us of his presence, now and forever.",                        cta:null },
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
const GDX=100, GDY=120, R=72;
const BX =347, BY =120;
const GPX=233, GPY=310;

/* ─── Per-step viewBox ───────────────────────────────────────────────── */
type VB = [number,number,number,number];
// Extra headroom above the Design/Brokenness circles and extra room below
// the Gospel circle so their labels can sit outside the circle (like the
// reference art) instead of stacked on top of the icon inside it.
const VIEWBOXES: Record<string,VB> = {
  brokenness: [243, 14, 208, 208],
  design:     [ 14, 14, 430, 200],
  sin:        [ 14,  6, 430, 190],
  coping:     [ 14,  6, 516, 206],
  gospel:     [  4,  6, 446, 412],
  repent:     [  4,  6, 446, 412],
  recover:    [  4,  6, 446, 412],
};

/* ─── Animated viewBox ───────────────────────────────────────────────── */
function useAnimVB(target: VB): string {
  const prm = usePrefersReducedMotion();
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
  return prm ? target.join(" ") : vb.join(" ");
}

/* ─── Draw-on helper ─────────────────────────────────────────────────── */
function useDrawOn(show: boolean, delay=0) {
  const prm = usePrefersReducedMotion();
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
  return prm ? show : on;
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
  const prm = usePrefersReducedMotion();
  const [op,setOp] = useState(0);
  const prev = useRef(false);
  useEffect(()=>{
    if(show && !prev.current){ setOp(0); const t=setTimeout(()=>setOp(1),delay+300); return ()=>clearTimeout(t); }
    prev.current=show;
  },[show,delay]);
  return <g style={{opacity:show?(prm?1:op):0,transition:`opacity .35s ease`}}>{children}</g>;
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
/* Round 11: "This brokenness is not even a circle. So we need to make
   that a circle. So this is actually three circles." The gapped-arc
   rendering below used to draw the ring itself as broken; now the ring
   is a normal complete circle (matching Design and Gospel exactly), and
   only the crack/shrapnel marks — already outside the ring, already the
   thing that reads as "broken" — carry that idea. */
function BrokenCircle({show, navy}:{show:boolean; navy:string}) {
  const on = useDrawOn(show,0);
  return (
    <g style={{opacity:show?1:0}}>
      <AnimCircle cx={BX} cy={BY} r={R} stroke={navy} sw={3} show={show}/>
      {on && <>
        <path d={`M ${BX+74},${BY-46} l 12,-8 l -6,12 l 10,-4`} stroke={navy} strokeOpacity={0.38} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d={`M ${BX+74},${BY+46} l 10,8 l -4,-12 l 8,6`}   stroke={navy} strokeOpacity={0.38} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d={`M ${BX+78},${BY-2} l 12,-8 l -6,12 l 10,-4`}   stroke={navy} strokeOpacity={0.38} strokeWidth="2" fill="none" strokeLinecap="round"/>
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
  const prm = usePrefersReducedMotion();
  const on = useDrawOn(show, delay);
  const pd = popDelay ?? delay + 950;
  return (
    <g transform={`translate(${cx},${cy})`} filter="url(#sk)" style={{opacity:show?1:0,transition:"opacity .3s ease"}}>
      {show && (
        <g>
          {!prm && popTransform(pd)}
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
  const prm = usePrefersReducedMotion();
  const onV = useDrawOn(show, delay);
  const onH = useDrawOn(show, delay+380);
  const pd = popDelay ?? delay + 1000;
  return (
    <g transform={`translate(${cx},${cy})`} filter="url(#sk)" style={{opacity:show?1:0,transition:"opacity .3s ease"}}>
      {show && (
        <g>
          {!prm && popTransform(pd)}
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
function RunningMan({path,color,show,rest}:{path:string;color:string;show:boolean;rest:{x:number;y:number}}) {
  const prm = usePrefersReducedMotion();
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
  if (prm) {
    // Reduced motion: no run, no leg swing — just the figure standing where
    // the run would have ended.
    return (
      <g transform={`translate(${rest.x},${rest.y})`} filter="url(#sk)">
        <circle cx="0" cy="-10" r="4" fill={color}/>
        <line x1="0" y1="-6" x2="0" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="0" y1="4" x2="-7" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="0" y1="4" x2="7" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="0" y1="-5" x2="-7" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="0" y1="-5" x2="7" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </g>
    );
  }
  return (
    <g key={key} filter="url(#sk)">
      <g>
        {/* Runs the crossing once, then stops (freezes) at Brokenness — not a loop */}
        <animateMotion ref={motionRef} dur="1.4s" begin="indefinite" repeatCount="1" fill="freeze" path={path}/>
        {/* Wind lines trailing behind him, like the reference art — the
            figure only translates (no rotate="auto"), so "behind" is a
            fixed local -x regardless of which way the path curves. */}
        <line x1="-14" y1="-10" x2="-25" y2="-6" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.55"/>
        <line x1="-15" y1="0"   x2="-27" y2="0"  stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.55"/>
        <line x1="-14" y1="9"   x2="-25" y2="13" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.55"/>
        <circle cx="0" cy="-10" r="4" fill={color}/>
        <line x1="0" y1="-6" x2="0" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <g>
          <animateTransform ref={leg1Ref} attributeName="transform" type="rotate" values="34 0 4;-34 0 4;34 0 4" dur="0.3s" begin="indefinite" repeatCount="5" fill="freeze"/>
          <line x1="0" y1="4" x2="-7" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g>
          <animateTransform ref={leg2Ref} attributeName="transform" type="rotate" values="-34 0 4;34 0 4;-34 0 4" dur="0.3s" begin="indefinite" repeatCount="5" fill="freeze"/>
          <line x1="0" y1="4" x2="7" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g>
          <animateTransform ref={arm1Ref} attributeName="transform" type="rotate" values="-32 0 -5;32 0 -5;-32 0 -5" dur="0.3s" begin="indefinite" repeatCount="5" fill="freeze"/>
          <line x1="0" y1="-5" x2="-7" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g>
          <animateTransform ref={arm2Ref} attributeName="transform" type="rotate" values="32 0 -5;-32 0 -5;32 0 -5" dur="0.3s" begin="indefinite" repeatCount="5" fill="freeze"/>
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

  // Earlier versions rotated individual leg lines by SMIL transforms to
  // approximate a kneel. That's hard to get right without ever seeing it
  // rendered — small pivot/angle mistakes read as splayed or airborne legs
  // instead of a kneel. This version sidesteps the geometry guesswork
  // entirely: it draws two complete, fixed poses (standing and kneeling)
  // and crossfades between them with plain CSS opacity, so the kneeling
  // pose is exactly the coordinates below, not a rotation applied to the
  // standing one.
  const [kneel, setKneel] = useState(false);
  useEffect(() => {
    // Both transitions run from timer callbacks rather than synchronously
    // in the effect body, so this never triggers a same-render cascade.
    if (!show) {
      const t = setTimeout(() => setKneel(false), 0);
      return () => clearTimeout(t);
    }
    const reset = setTimeout(() => setKneel(false), 0);
    const fall = setTimeout(() => setKneel(true), 250);
    return () => { clearTimeout(reset); clearTimeout(fall); };
  }, [show, key]);

  return (
    <g transform={`translate(${x},${y}) scale(2)`} filter="url(#sk)" style={{opacity:show?1:0,transition:"opacity .3s ease"}}>
      {show && (
        <g key={key} style={{transform:kneel?"translate(0px,2px)":"translate(0px,0px)", transition:"transform .5s cubic-bezier(.4,0,.2,1)"}}>
          {/* Standing */}
          <g style={{opacity:kneel?0:1, transition:"opacity .35s ease"}}>
            <circle cx="0" cy="-14" r="4" fill={color}/>
            <line x1="0" y1="-10" x2="0" y2="0" stroke={color} strokeWidth="2" strokeLinecap="round"/>
            <line x1="0" y1="0" x2="-2" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
            <line x1="0" y1="0" x2="2" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
            <line x1="0" y1="-8" x2="-7" y2="0" stroke={color} strokeWidth="2" strokeLinecap="round"/>
            <line x1="0" y1="-8" x2="7" y2="0" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </g>
          {/* Kneeling — traced from the pose in Josiah's reference drawing:
              side view, facing left toward the Gospel circle. Torso comes
              down and folds at the knee (the low point), the shin and foot
              trail back to the right as two short lines, and one arm is
              bent at the elbow and reaches out toward the cross. The group
              is offset so the knee sits on the standing figure's ground
              line (feet at y = 11) and the torso stays under the head. */}
          <g transform="translate(-4,11)" style={{opacity:kneel?1:0, transition:"opacity .4s ease .12s"}}>
            <circle cx="4.2" cy="-22" r="5" fill={color}/>
            <path d="M 5.4,-16.8 L 6.3,-9.5 Q 6.3,-6 2.5,-3.5 L 0,0" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 2.5,-3.5 L 8.8,-5.2 M 0,0 L 9.1,-2.2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
            <path d="M 5.4,-15.4 L 1.2,-11.6 L -4.5,-16.5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        </g>
      )}
    </g>
  );
}

/* ─── Redeemed stick figure: a gentle standing bounce, with dashes
   radiating off it that blink in a staggered loop. ────────────────────── */
function RedeemedMan({x,y,color,show}:{x:number;y:number;color:string;show:boolean}) {
  const prm = usePrefersReducedMotion();
  if (!show) return null;
  // A full ring of rays around the figure, like the sunburst in the
  // reference art, rather than a partial cluster on one side.
  const rays: [number,number,number,number][] = Array.from({length:8}, (_,i) => {
    const a = (i*45) * Math.PI/180;
    const cx=0, cy=-8;
    return [
      +(cx+10*Math.cos(a)).toFixed(1), +(cy+10*Math.sin(a)).toFixed(1),
      +(cx+19*Math.cos(a)).toFixed(1), +(cy+19*Math.sin(a)).toFixed(1),
    ] as [number,number,number,number];
  });
  return (
    <g transform={`translate(${x},${y}) scale(1.6)`} filter="url(#sk)">
      <g>
        {!prm && <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="1.5s" repeatCount="indefinite"/>}
        <circle cx="0" cy="-14" r="4" fill={color}/>
        <line x1="0" y1="-10" x2="0" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="0" y1="4" x2="-6" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="0" y1="4" x2="6" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="0" y1="-6" x2="-7" y2="-1" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="0" y1="-6" x2="7" y2="-1" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        {rays.map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeLinecap="round" strokeOpacity={prm ? 0.7 : undefined}>
            {!prm && <animate attributeName="opacity" values="0.15;1;0.15" dur="1.3s" begin={`${i*0.18}s`} repeatCount="indefinite"/>}
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

  // Keyboard: ← / → move between steps while focus is inside the guide.
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" && canNext) { e.preventDefault(); setIdx(i=>Math.min(STEPS.length-1,i+1)); }
    if (e.key === "ArrowLeft"  && canPrev) { e.preventDefault(); setIdx(i=>Math.max(0,i-1)); }
  };

  // The step lives in the URL (?step=4) so a refresh keeps your place and a
  // pastor can send someone straight to a step. Step 1 keeps the URL clean.
  useEffect(() => {
    const n = parseInt(new URLSearchParams(window.location.search).get("step") ?? "", 10);
    if (n >= 2 && n <= STEPS.length) { const t = setTimeout(() => setIdx(n-1), 0); return () => clearTimeout(t); }
  }, []);
  const urlReady = useRef(false);
  useEffect(() => {
    if (!urlReady.current) { urlReady.current = true; return; }
    const url = new URL(window.location.href);
    if (idx === 0) url.searchParams.delete("step"); else url.searchParams.set("step", String(idx+1));
    window.history.replaceState(window.history.state, "", url);
  }, [idx]);

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
  // Re-traced from the actual stroke in the reference (skeletonised, then a
  // cubic fitted to it — RMS error ~3 reference px), not eyeballed.
  const sinStart = {x: 172.5, y: 65.3};
  const sinC1    = {x: 210,   y: 30};     // eased: lower, so the start no longer lifts steeply
  const sinC2    = {x: 250,   y: 29};
  const sinEnd   = {x: 281.2, y: 56};

  // Round 11: rounds 8-10 kept making these arrows bigger, further out,
  // structurally fancier — and each round Josiah said it was getting
  // further from what he wanted, not closer. He sent an exact hand-drawn
  // reference ("just match this picture") showing simple single-curve
  // arcs directly connecting adjacent circles, nothing more. Back to
  // that: one control point, modest bow, no hooks, no corner sweeps —
  // this is close to the diagram's very first version.
  // Repent & Believe floats free of both circles, but pulled in to about
  // half its previous length — it now sits in the gap between them
  // rather than reaching all the way to either circle's edge.
  // Round 15: layout and arrows traced from Josiah's reference drawing.
  // The reference ellipses were measured (centres, radii, gaps), and every
  // arrow point was read off it and mapped through x*0.4645, y*0.6667 — the
  // exact squash that turns the reference's ellipses into this file's
  // circles — so arrows keep the same relationship to the circles. Both teal
  // arrows start/end at the Gospel circle's middle (right side / left side),
  // as cubic curves that bow out into open space.
  // Same traced curve as the reference's Turn & Believe arrow, trimmed at
  // the top so its length matches Restored & Forgiven and its label can sit
  // above it (mirroring Restored & Forgiven) instead of leaving a gap.
  const repStart = {x: 372, y: 250};
  const repC1    = {x: 365.5,y: 279};
  const repC2    = {x: 343.7,y: 300.9};
  const repEnd   = {x: 320, y: 320};   // Gospel's right-middle, pointing in

  const recStart = {x: 145, y: 317};   // Gospel's left-middle
  const recC1    = {x: 110, y: 313};
  const recC2    = {x: 89.5,y: 279};
  const recEnd   = {x: 82,  y: 249};   // below God's Design, pointing up

  // Point on the Sin curve at parameter t, and its first-half sub-curve.
  const sinPts = [sinStart, sinC1, sinC2, sinEnd];
  const lerp2 = (a:{x:number;y:number}, b:{x:number;y:number}, t:number) => ({x:a.x+(b.x-a.x)*t, y:a.y+(b.y-a.y)*t});
  const sinAt = (t:number) => {
    const [p0,p1,p2,p3] = sinPts;
    const a = lerp2(p0,p1,t), b = lerp2(p1,p2,t), c = lerp2(p2,p3,t);
    const d = lerp2(a,b,t), e = lerp2(b,c,t);
    return lerp2(d,e,t);
  };
  // "Sin" label rides above the right-hand part of the arc, clear of the runner.
  const sinMid = { x: sinAt(0.74).x, y: sinAt(0.74).y - 4 };

  // Runner travels a copy of the sin arrow, lifted above it so he isn't
  // stepping on the line itself.
  // The runner only crosses the first ~40% of the arrow and stops above its
  // start (as in the reference), so he never sits on top of the arrowhead.
  const runT = 0.4;
  const runSub = (() => {
    const [p0,p1,p2,p3] = sinPts.map(q => ({x:q.x, y:q.y-16}));
    const a = lerp2(p0,p1,runT), b = lerp2(p1,p2,runT), c = lerp2(p2,p3,runT);
    const d = lerp2(a,b,runT), e = lerp2(b,c,runT), f = lerp2(d,e,runT);
    return { d: `M ${p0.x},${p0.y} C ${a.x},${a.y} ${d.x},${d.y} ${f.x},${f.y}`, end: f };
  })();
  const sinRunPath = runSub.d;
  const runEnd = runSub.end;

  // Figures sit near the Gospel-circle end of each arrow, just off the
  // curve — "Believe" happens on arrival at Gospel, "Restored" happens
  // on leaving it, matching where the reference places its two figures.
  const prayPos = { x: 392, y: 330 };
  const redeemPos = { x: 56, y: 345 };

  return (
    <div className="tc-root w-full select-none" onTouchStart={onTS} onTouchEnd={onTE} onKeyDown={onKey}
      role="group" aria-label={`The Three Circles guide, step ${idx+1} of ${STEPS.length}`}>
      <style>{`@media (prefers-reduced-motion: reduce){.tc-root *{transition:none !important}}`}</style>

      {/* ── Nav — stays dark, floats above the white card ── */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 mb-5">
        <button onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={!canPrev}
          className="order-1 font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full border transition"
          style={{ borderColor:canPrev?"var(--border-on-dark-strong)":"var(--border-on-dark)", color:"var(--fg-on-dark-muted)", background:"transparent", cursor:canPrev?"pointer":"not-allowed", opacity:canPrev?1:0.4 }}>
          ← Back
        </button>
        {/* Step dots. Each button is a 24px-tall tap target around the small
            visible dot (WCAG 2.5.8); on phones the row drops under the
            Back/Next pair so seven targets fit without crowding. */}
        <div className="order-3 sm:order-2 w-full sm:w-auto flex items-center justify-center" role="group" aria-label="Choose a step">
          {STEPS.map((s,i)=>(
            <button key={s.id} onClick={()=>setIdx(i)} aria-label={`Step ${i+1}: ${s.title}`} aria-current={i===idx?"step":undefined}
              style={{ width:i===idx?38:24, height:24, padding:0, background:"transparent", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span aria-hidden="true" style={{ display:"block", width:i===idx?26:7, height:7, borderRadius:4, background:i===idx?"var(--accent)":"var(--border-on-dark-strong)",
                  /* Not `all`: that animates outline-width too, so the focus
                     ring fades in from zero and the dot reads as having no
                     indicator at the moment focus lands. Only the two
                     properties that actually move are animated. */
                  transition:"width .3s ease, background-color .3s ease" }}/>
            </button>
          ))}
        </div>
        {canNext
          ? <button onClick={()=>setIdx(i=>Math.min(STEPS.length-1,i+1))}
              className="order-2 sm:order-3 font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full transition-colors"
              style={{ background:"var(--accent-solid)", color:"var(--fg-on-accent)", border:"1px solid var(--border-on-dark)", cursor:"pointer" }}>Next →</button>
          : <a href="/connect" className="order-2 sm:order-3 font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full inline-block"
              style={{ background:"var(--accent-solid)", color:"var(--fg-on-accent)", border:"1px solid var(--border-on-dark)" }}>Talk →</a>
        }
      </div>

      {/* ── Layout: white card left, dark text right on lg; stacked on mobile ── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-12 items-center lg:items-start">

        {/* White card wrapping the SVG */}
        <div
          className="order-2 lg:order-1 w-full max-w-sm lg:max-w-none lg:w-[420px] flex-shrink-0 mx-auto lg:mx-0 rounded-2xl"
          style={{ background: "var(--plate)", padding:"20px 16px 16px", boxShadow:"var(--shadow-lg)", border:"1px solid var(--border-on-dark)" }}
        >
          {idx===0 && (
            <p className="text-center text-xs mb-3 lg:hidden font-condensed tracking-widest"
              style={{color: "var(--fg-subtle)"}}>SWIPE TO CONTINUE</p>
          )}
          <svg viewBox={viewBox} className="w-full h-auto" style={{overflow:"visible"}} role="img" aria-label={`Diagram for step ${idx+1}: ${step.title}`}>
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

            {/* ═══ GOD'S DESIGN (top-left) — teal on white — heart icon ═══
                Label sits above the circle, outside it, like the reference —
                so the icon can be centered and full-size with nothing
                competing for space inside the ring. */}
            <g filter="url(#sk)">
              <AnimCircle cx={GDX} cy={GDY} r={R} stroke={TEAL} sw={3} show={vis(v,"design-circle")}/>
            </g>
            <DrawIcon cx={GDX} cy={GDY} show={vis(v,"design-circle")} delay={300} stroke={TEAL} fill={TEAL} sw={2.6}
              d="M 0,25.2 C -36.4,4.2 -19.6,-29.4 0,-12.6 C 19.6,-29.4 36.4,4.2 0,25.2 Z" len={170}/>
            <Fade show={vis(v,"design-inner")}>
              <MLText x={GDX} y={GDY-R-12} lines={["God's Design"]} fill={TEAL} size={16}/>
            </Fade>

            {/* ═══ BROKENNESS (top-right) — navy arcs on white, no fill needed — squiggle icon ═══ */}
            <BrokenCircle show={vis(v,"broken-circle")} navy={NAVY}/>
            <DrawIcon cx={BX} cy={BY} show={vis(v,"broken-circle")} delay={300} stroke={NAVY} sw={2.6}
              d="M -33,0 Q -24.75,-20 -16.5,0 Q -8.25,20 0,0 Q 8.25,-20 16.5,0 Q 24.75,20 33,0" len={190}/>
            {/* A small open door beneath the crack — the reference art's
                detail. A closed rectangle (top included) plus a knob, not
                the open-topped, knob-less notch from before. */}
            <DrawIcon cx={BX} cy={BY+30} show={vis(v,"broken-circle")} delay={900} stroke={NAVY} sw={2}
              d="M -5,-6 L -5,6 L 5,6 L 5,-6 L -5,-6" len={44}/>
            <AnimCircle cx={BX+2} cy={BY+30} r={1.3} stroke={NAVY} sw={1.4} show={vis(v,"broken-circle")} delay={1700}/>
            <Fade show={vis(v,"broken-inner")}>
              {/* Nudged right only while the Sin runner is on screen, so it clears the arrowhead;
                  otherwise (step 1, step 2) it centres over its circle. */}
              <MLText x={BX+(vis(v,"sin-arrow")?26:0)} y={BY-R-(vis(v,"sin-arrow")?14:12)} lines={["Brokenness"]} fill={NAVY} size={16}/>
            </Fade>
            {/* Coping labels — only step 4. Each word sits level with one of
                the three jagged marks fanning off the right of Brokenness,
                horizontal and left-aligned in a column so none of them
                touches the ring, the Brokenness label, or each other. */}
            <Fade show={vis(v,"cope-labels")}>
              <MLText x={BX+100} y={BY-50} lines={["Money"]}     fill={LABEL} size={13} weight={600} anchor="start"/>
              <MLText x={BX+104} y={BY+3}  lines={["Addiction"]} fill={LABEL} size={13} weight={600} anchor="start"/>
              <MLText x={BX+100} y={BY+56} lines={["Religion"]}  fill={LABEL} size={13} weight={600} anchor="start"/>
            </Fade>

            {/* ═══ GOSPEL (bottom-center) — navy on white — cross + crown ═══
                Label now sits below the circle, outside it, so the cross,
                arrows, and tomb have the whole ring to themselves. */}
            <g filter="url(#sk)">
              <AnimCircle cx={GPX} cy={GPY} r={R} stroke={NAVY} sw={3.2} show={vis(v,"gospel-circle")}/>
            </g>
            {/* Round 13: measured pixel-for-pixel off the reference image
                itself (cropped, gridded, and read off in a python pass),
                not eyeballed — each point taken as a fraction of the
                reference oval's own radius, then applied to this circle's
                GPX/GPY/R so the angles and proportions carry over exactly.
                Down-arrow: starts near the top-right where Repent & Believe
                arrives, leans down-left, stays short. Up-arrow: starts low
                and just left of center, stays low the whole way (its tip
                never reaches crossbar height) and points up-left, ending
                well short of the edge — NOT swept up to flank the top the
                way every earlier round had it. Both verified clear of the
                crossbar (y=278, x 193-225) and the tomb (y>=313, x 200-218). */}
            <g filter="url(#sk)">
              <AnimPath d={`M ${GPX+48},${GPY-24} L ${GPX+38},${GPY+40}`} stroke={NAVY} sw={4} show={vis(v,"gospel-circle")} delay={300} len={65}/>
            </g>
            {vis(v,"gospel-circle") && (
              <path d={`M ${GPX+48},${GPY-24} L ${GPX+38},${GPY+40}`} fill="none" stroke="none" markerEnd="url(#argn)" strokeWidth="4"/>
            )}
            <g filter="url(#sk)">
              <AnimPath d={`M ${GPX-17},${GPY+39} L ${GPX-48},${GPY-9}`} stroke={NAVY} sw={4} show={vis(v,"gospel-circle")} delay={500} len={58}/>
            </g>
            {vis(v,"gospel-circle") && (
              <path d={`M ${GPX-17},${GPY+39} L ${GPX-48},${GPY-9}`} fill="none" stroke="none" markerEnd="url(#argn)" strokeWidth="4"/>
            )}
            <CrossIcon cx={GPX} cy={GPY-6} show={vis(v,"gospel-circle")} delay={900} stroke={NAVY}/>
            {/* The tomb, empty — the stone rolled to the side */}
            <g filter="url(#sk)">
              <AnimPath d={`M ${GPX-9},${GPY+26} L ${GPX-9},${GPY+13} A 9,9 0 0 1 ${GPX+9},${GPY+13} L ${GPX+9},${GPY+26}`}
                stroke={NAVY} sw={2.2} show={vis(v,"gospel-circle")} delay={1300} len={44}/>
            </g>
            <AnimCircle cx={GPX+16} cy={GPY+24} r={5} stroke={NAVY} sw={2} show={vis(v,"gospel-circle")} delay={1550}/>
            {/* Crown sits on top of the circle, partly outside it — same read as the reference art */}
            <DrawIcon cx={GPX} cy={GPY-76} show={vis(v,"gospel-circle")} delay={1700} stroke={NAVY} sw={2.6}
              d="M -20,0 L -20,-15 L -10,-4 L 0,-30 L 10,-4 L 20,-15 L 20,0 Z" len={170}/>
            <Fade show={vis(v,"gospel-inner")}>
              <MLText x={GPX} y={GPY+R+22} lines={["Gospel"]} fill={NAVY} size={18}/>
            </Fade>

            {/* ═══ SIN arrow ═══ */}
            <g filter="url(#sk)">
              <AnimPath
                d={`M ${sinStart.x},${sinStart.y} C ${sinC1.x},${sinC1.y} ${sinC2.x},${sinC2.y} ${sinEnd.x},${sinEnd.y}`}
                stroke={RED} sw={3.5} show={vis(v,"sin-arrow")} len={125}/>
            </g>
            {vis(v,"sin-arrow") && (
              <path d={`M ${sinStart.x},${sinStart.y} C ${sinC1.x},${sinC1.y} ${sinC2.x},${sinC2.y} ${sinEnd.x},${sinEnd.y}`}
                fill="none" stroke="none" markerEnd="url(#arrr)" strokeWidth="4"/>
            )}
            <Fade show={vis(v,"sin-arrow")}>
              <MLText x={sinMid.x} y={sinMid.y-6} lines={["Sin"]} fill={RED} size={16} weight={700} ls="0.12em"/>
            </Fade>
            <RunningMan path={sinRunPath} color={RED} show={vis(v,"sin-arrow")} rest={runEnd}/>

            {/* ═══ REPENT & BELIEVE: B → GP ═══ Floats free of both circles —
                leaves Brokenness's bottom-right, bows out toward the
                bottom-right of the page, comes back into Gospel's
                bottom-right, never touching either circle. */}
            <g filter="url(#sk)">
              <AnimPath
                d={`M ${repStart.x},${repStart.y} C ${repC1.x},${repC1.y} ${repC2.x},${repC2.y} ${repEnd.x},${repEnd.y}`}
                stroke={TEAL} sw={3.5} show={vis(v,"repent-arrow")} len={92}/>
            </g>
            {vis(v,"repent-arrow") && (
              <path d={`M ${repStart.x},${repStart.y} C ${repC1.x},${repC1.y} ${repC2.x},${repC2.y} ${repEnd.x},${repEnd.y}`}
                fill="none" stroke="none" markerEnd="url(#arht)" strokeWidth="4"/>
            )}
            {/* The arrow is short enough now that the label used to sit
                right on top of the stroke and hide almost all of it —
                offset to the side instead, so the arrow itself stays
                visible. */}
            <Fade show={vis(v,"repent-arrow")}>
              <MLText x={350} y={219} lines={["Repent &","Believe"]} fill={TEAL} size={14} weight={700} anchor="start"/>
            </Fade>
            <PrayingMan x={prayPos.x} y={prayPos.y} color={TEAL} show={vis(v,"repent-arrow")}/>

            {/* ═══ RESTORED & FORGIVEN: GP → GD ═══ Mirror of the curve
                above. Renamed from "Recover & Pursue" per Josiah's request. */}
            <g filter="url(#sk)">
              <AnimPath
                d={`M ${recStart.x},${recStart.y} C ${recC1.x},${recC1.y} ${recC2.x},${recC2.y} ${recEnd.x},${recEnd.y}`}
                stroke={TEAL} sw={3.5} show={vis(v,"recover-arrow")} len={102} delay={300}/>
            </g>
            {vis(v,"recover-arrow") && (
              <path d={`M ${recStart.x},${recStart.y} C ${recC1.x},${recC1.y} ${recC2.x},${recC2.y} ${recEnd.x},${recEnd.y}`}
                fill="none" stroke="none" markerEnd="url(#arht)" strokeWidth="4"/>
            )}
            <Fade show={vis(v,"recover-arrow")} delay={300}>
              <MLText x={106} y={222} lines={["Restored &","Forgiven"]} fill={TEAL} size={14} weight={700} anchor="end"/>
            </Fade>
            <RedeemedMan x={redeemPos.x} y={redeemPos.y} color={TEAL} show={vis(v,"recover-arrow")}/>

          </svg>
        </div>

        {/* Text panel — stays dark */}
        <div className="order-1 lg:order-2 w-full flex-1 flex flex-col justify-center lg:pt-6 px-1 lg:px-0">
          <div aria-live="polite" aria-atomic="true">
          <p aria-hidden="true" className="font-condensed font-900 mb-2" style={{fontSize:"clamp(2.75rem,11vw,5rem)",lineHeight:1,color:BAND_TEAL,opacity:.14,letterSpacing:"-0.03em"}}>
            0{step.num}
          </p>
          <h3 className="font-condensed font-900 text-fg-on-dark mb-4"
            style={{fontSize:"clamp(1.9rem,4.5vw,2.6rem)",letterSpacing:"-0.02em",lineHeight:1.05}}>
            {step.title}
          </h3>
          <p className="text-fg-on-dark-body leading-relaxed mb-5" style={{fontSize:"1.05rem",maxWidth:420}}>
            {step.body}
          </p>
          {SCRIPTURE[step.id] && (
            <figure className="mb-5 pl-4 border-l-2" style={{borderColor:BAND_TEAL,maxWidth:420}}>
              <figcaption className="font-condensed font-700 uppercase tracking-wide text-xs mb-2" style={{color:BAND_TEAL}}>The Bible says · CSB</figcaption>
              {SCRIPTURE[step.id].map(v=>(
                <blockquote key={v.ref} className="text-fg-on-dark-muted mb-2 last:mb-0" style={{fontSize:"0.9rem",lineHeight:1.5}}>
                  “{v.text}” <cite className="not-italic font-700 whitespace-nowrap">({v.ref})</cite>
                </blockquote>
              ))}
            </figure>
          )}
          {step.cta && (
            <p className="font-condensed font-700 mb-8" style={{color:BAND_TEAL,fontSize:"1.05rem"}}>
              {step.cta}
            </p>
          )}
          </div>
          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-4">
            <button onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={!canPrev}
              className="font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full border transition"
              style={{borderColor:canPrev?"var(--border-on-dark-strong)":"var(--border-on-dark)",color:"var(--fg-on-dark-muted)",background:"transparent",cursor:canPrev?"pointer":"not-allowed",opacity:canPrev?1:0.4}}>
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
