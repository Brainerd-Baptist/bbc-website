"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  description: string;
}

const STATS: Stat[] = [
  {
    value: 1921,
    suffix: "",
    prefix: "Est. ",
    label: "Years of faithful ministry",
    description: "in Chattanooga",
  },
  {
    value: 800,
    suffix: "+",
    label: "Members",
    description: "in our church family",
  },
  {
    value: 12,
    suffix: "",
    label: "Life Groups",
    description: "meeting every week",
  },
  {
    value: 6,
    suffix: "",
    label: "Mission Partners",
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
        className="font-condensed font-900 text-accent-text tabular-nums leading-none mb-1"
        style={{ fontSize: "clamp(2.4rem, 5vw, 3.5rem)" }}
      >
        {stat.prefix ?? ""}
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div
        className="font-condensed font-700 text-white text-base tracking-wide mb-0.5"
      >
        {stat.label}
      </div>
      <div className="text-white/40 text-xs tracking-wide">{stat.description}</div>
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
      style={{ background: "linear-gradient(135deg, #00142a 0%, #001840 100%)" }}
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, #00abc9 39px, #00abc9 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #00abc9 39px, #00abc9 40px)",
        }}
      />

      {/* Teal accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#00abc9]/40 to-transparent mb-12" />

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
            className="absolute top-0 bottom-0 w-px bg-white/8"
            style={{ left: `${(i / 4) * 100}%` }}
          />
        ))}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#00abc9]/40 to-transparent mt-12" />
    </section>
  );
}
