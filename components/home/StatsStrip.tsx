"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  description: string;
}

// Pulled from Planning Center 2026-10-01 — see claude/bbc-website-stats-audit-2026-10-01.md
// for how each number was checked and what still needs a source. Re-verify
// periodically rather than letting these go stale the way the originals did
// (800 members / 12 Life Groups, both roughly half the real count).
const STATS: Stat[] = [
  {
    value: 1921,
    suffix: "",
    prefix: "Est. ",
    // Was mislabeled "Years of faithful ministry" over a count-up TO the
    // founding year itself (reading as "Est. 1,921 years"). This is a
    // founding year, not a duration — label it as one.
    label: "Founded in Chattanooga",
    description: "still here, still preaching the Word",
  },
  {
    value: 1500,
    suffix: "+",
    label: "Members",
    // PCO People: 1,503 active people with membership status "Member" —
    // rounded down so this doesn't need updating every time one person's
    // status changes.
    description: "in our church family",
  },
  {
    value: 36,
    suffix: "",
    label: "Life Groups",
    // PCO Groups: 36 active (non-archived) groups under "Adult Life Groups" —
    // doesn't include Student Life Groups, Bible Studies, or other group types.
    description: "meeting every week",
  },
  {
    value: 6,
    suffix: "",
    label: "Mission Partners",
    // Unverified — no mission-partner count exists in Planning Center or
    // in this codebase (components/missions/WorldReachMap.tsx is still
    // placeholder data). Left as-is rather than guessing; confirm the
    // real number with the missions office and update here.
    description: "local and international",
  },
];

function useCountUp(target: number, duration = 1400, started: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const from = 0;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(from + (target - from) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return count;
}

function StatCard({ stat, delay, started }: { stat: Stat; delay: number; started: boolean }) {
  const [innerStarted, setInnerStarted] = useState(false);
  useEffect(() => {
    if (started) {
      const t = setTimeout(() => setInnerStarted(true), delay);
      return () => clearTimeout(t);
    }
  }, [started, delay]);

  const count = useCountUp(stat.value, 1600, innerStarted);

  return (
    <div className="flex flex-col items-center text-center px-4">
      <div
        className="font-condensed font-900 text-accent tabular-nums leading-none mb-1"
        style={{ fontSize: "clamp(2.4rem, 5vw, 3.5rem)" }}
      >
        {stat.prefix ?? ""}
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div
        className="font-condensed font-700 text-fg-on-dark text-base tracking-wide mb-0.5"
      >
        {stat.label}
      </div>
      <div className="text-fg-on-dark-muted text-xs tracking-wide">{stat.description}</div>
    </div>
  );
}

export default function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-16 px-6"
      /* A branded navy band, not a page surface: it stays navy in both themes,
         so everything inside it uses the on-dark ink family. */
      style={{ background: "var(--brand-ink)" }}
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, var(--accent) 39px, var(--accent) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, var(--accent) 39px, var(--accent) 40px)",
        }}
      />

      {/* Teal accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent mb-12" />

      <div className="relative max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} delay={i * 120} started={started} />
          ))}
        </div>
      </div>

      {/* Dividers between cells on desktop */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl pointer-events-none">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-border-on-dark"
            style={{ left: `${(i / 4) * 100}%` }}
          />
        ))}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent mt-12" />
    </section>
  );
}
