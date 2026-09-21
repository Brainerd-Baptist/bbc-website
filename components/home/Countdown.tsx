"use client";

import { useState, useEffect } from "react";

// Returns the UTC timestamp for the next Sunday 8:30 AM Eastern time.
// Uses Intl to find what "Sunday 8:30 AM America/New_York" means in UTC,
// so DST transitions (March and November) are handled automatically.
function getNextSunday830ET(): number {
  const now = new Date();

  // Get today's date parts in Eastern time
  const etFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = Object.fromEntries(etFmt.formatToParts(now).map((p) => [p.type, p.value]));
  const etDay = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(parts.weekday);
  const daysUntilSunday = etDay === 0 ? 7 : 7 - etDay;

  // Build the target date string: next Sunday in ET, at 08:30:00
  const [month, day, year] = [parts.month, parts.day, parts.year];
  const targetDate = new Date(`${year}-${month}-${day}`);
  targetDate.setDate(targetDate.getDate() + daysUntilSunday);

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
  const dd = String(targetDate.getDate()).padStart(2, "0");

  // "2026-09-21T08:30:00" interpreted as Eastern by converting via Intl
  // Trick: parse the wall-clock string as if it were UTC, then correct for
  // the ET offset at that moment using a known-good offset calculation.
  const wallClockStr = `${yyyy}-${mm}-${dd}T08:30:00`;

  // Find the UTC offset for that ET wall-clock moment by formatting a UTC
  // date and comparing. We iterate: start with a UTC guess, measure the
  // ET representation of that guess, adjust.
  let utcGuess = new Date(wallClockStr + "Z"); // treat as UTC first
  for (let i = 0; i < 3; i++) {
    const etRepr = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    }).format(utcGuess);
    // etRepr looks like "09/21/2026, 04:30:00" — parse it
    const m = etRepr.match(/(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+):(\d+)/);
    if (!m) break;
    const etDate = new Date(Date.UTC(+m[3], +m[1]-1, +m[2], +m[4], +m[5], +m[6]));
    const target = new Date(wallClockStr + "Z");
    const diff = target.getTime() - etDate.getTime();
    utcGuess = new Date(utcGuess.getTime() + diff);
  }

  return utcGuess.getTime();
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
      const diff = getNextSunday830ET() - Date.now();
      if (diff <= 0) return;
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
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
          className="flex flex-col items-center glass-dark rounded-xl px-4 py-3 min-w-[56px]"
        >
          <span
            className="font-condensed font-900 text-white tabular-nums"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", lineHeight: 1 }}
          >
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-fg-on-dark-muted text-[10px] tracking-widest uppercase mt-1">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
