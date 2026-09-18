"use client";

import { useState, useEffect } from "react";

function getNextSunday830(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(8, 30, 0, 0);
  return next;
}

interface TimeUnit {
  value: number;
  label: string;
}

export default function Countdown() {
  const [units, setUnits] = useState<TimeUnit[]>([
    { value: 0, label: "Days" },
    { value: 0, label: "Hours" },
    { value: 0, label: "Min" },
    { value: 0, label: "Sec" },
  ]);

  useEffect(() => {
    const tick = () => {
      const diff = getNextSunday830().getTime() - Date.now();
      if (diff <= 0) return;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setUnits([
        { value: d, label: "Days" },
        { value: h, label: "Hours" },
        { value: m, label: "Min" },
        { value: s, label: "Sec" },
      ]);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex gap-4 md:gap-6">
      {units.map(({ value, label }) => (
        <div
          key={label}
          className="flex flex-col items-center glass rounded-xl px-4 py-3 min-w-[56px]"
        >
          <span
            className="font-condensed font-900 text-white tabular-nums"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", lineHeight: 1 }}
          >
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-white/50 text-[10px] tracking-widest uppercase mt-1">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
