"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A short bead of light that runs along ONE line of the A mark at a time.
 * After each run it rests briefly, then picks a different line at random, so
 * the movement never settles into a pattern.
 *
 * Coordinates are in the artwork's own 444x458 space (public/logo-a-mark-mask.png),
 * traced from the three outlined shapes. Only transform and opacity animate
 * (see @keyframes a-mark-run), and nothing runs under reduced motion.
 */
type P = [number, number];
const SHAPES: P[][] = [
  [[223, 3], [283, 125], [172, 359], [49, 359]],
  [[288, 135], [442, 456], [305, 456], [225, 263]],
  [[45, 368], [259, 368], [296, 456], [3, 456]],
];

const SEGMENTS = SHAPES.flatMap((pts) =>
  pts.map((a, i) => {
    const b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    return {
      x: a[0],
      y: a[1],
      len: Math.hypot(dx, dy),
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    };
  }),
);

const TAIL = 64; // length of the bead
const SPEED = 170; // artwork units per second

export default function AMarkLight() {
  const [run, setRun] = useState<{ seg: number; n: number } | null>(null);
  const last = useRef(-1);
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedule = (delay: number) => {
    timer.current = setTimeout(() => {
      let next = Math.floor(Math.random() * SEGMENTS.length);
      if (next === last.current) next = (next + 1) % SEGMENTS.length;
      last.current = next;
      count.current += 1;
      setRun({ seg: next, n: count.current });
    }, delay);
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    schedule(900);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const s = run ? SEGMENTS[run.seg] : null;

  return (
    <svg
      viewBox="0 0 444 458"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="a-mark-bead" gradientUnits="userSpaceOnUse" x1={-TAIL} y1="0" x2="0" y2="0">
          <stop offset="0" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
          <stop offset="1" style={{ stopColor: "var(--accent)", stopOpacity: 1 }} />
        </linearGradient>
        {s && (
          <clipPath id="a-mark-clip" clipPathUnits="userSpaceOnUse">
            <rect x="0" y="-8" width={s.len} height="16" />
          </clipPath>
        )}
      </defs>
      {s && run && (
        <g transform={`translate(${s.x} ${s.y}) rotate(${s.angle})`} clipPath="url(#a-mark-clip)">
          <g
            key={run.n}
            className="a-mark-run"
            style={{
              ["--run" as string]: `${s.len + TAIL}px`,
              animationDuration: `${Math.max(0.7, (s.len + TAIL) / SPEED)}s`,
            }}
            onAnimationEnd={() => schedule(500 + Math.random() * 1700)}
          >
            <line x1={-TAIL} y1="0" x2="0" y2="0" stroke="url(#a-mark-bead)" strokeWidth="7" strokeLinecap="round" opacity="0.25" />
            <line x1={-TAIL} y1="0" x2="0" y2="0" stroke="url(#a-mark-bead)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </g>
      )}
    </svg>
  );
}
