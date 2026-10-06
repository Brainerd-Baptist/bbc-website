"use client";

import { useMemo, useState } from "react";
import type { LifeGroup } from "@/lib/pco-groups";

const inputClass =
  "border border-border-strong rounded-xl px-4 py-3 w-full text-fg bg-surface-raised placeholder:text-fg-muted transition";

// Calendar order, not alphabetical — "Sunday" belongs first regardless of
// where it falls in a sorted string list.
const DAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Matches SermonGrid.tsx's reusable Select — same look, same component
// shape, just not worth extracting to a shared file yet for one more use.
function DaySelect({
  value,
  onChange,
  days,
}: {
  value: string;
  onChange: (v: string) => void;
  days: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-surface-raised border border-border-strong text-fg-muted text-xs font-semibold rounded-lg pl-3 pr-7 py-2.5 cursor-pointer hover:border-border-strong focus:border-accent transition shadow-sm"
        aria-label="Filter by day of the week"
      >
        <option value="">Any day</option>
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none"
        width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5"
      >
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </div>
  );
}

export default function GroupBrowser({ groups }: { groups: LifeGroup[] }) {
  const [query, setQuery] = useState("");
  const [day, setDay] = useState("");

  // Only offer days that at least one group actually meets on — no point
  // showing "Friday" in the dropdown if nothing's there to find.
  const availableDays = useMemo(() => {
    const present = new Set(groups.map((g) => g.dayOfWeek).filter((d): d is string => Boolean(d)));
    return DAY_ORDER.filter((d) => present.has(d));
  }, [groups]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups.filter((g) => {
      const matchesQuery = !q || g.name.toLowerCase().includes(q) || g.schedule.toLowerCase().includes(q);
      const matchesDay = !day || g.dayOfWeek === day;
      return matchesQuery && matchesDay;
    });
  }, [groups, query, day]);

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by day, time, or building — e.g. &ldquo;Tuesday&rdquo; or &ldquo;BX&rdquo;"
          className={`${inputClass} sm:flex-1`}
          aria-label="Search Life Groups"
        />
        {availableDays.length > 0 && (
          <DaySelect value={day} onChange={setDay} days={availableDays} />
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-fg-muted text-sm py-8 text-center">
          No groups matched that search. Try a different word, or reach out below and we&apos;ll help you find one.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <div key={g.id} className="glass rounded-2xl p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-condensed font-800 text-fg text-lg leading-tight">
                  {g.name}
                </h3>
                {g.dayOfWeek && (
                  <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-accent-text bg-accent/10 rounded-full px-2 py-0.5 mt-0.5">
                    {g.dayOfWeek}
                  </span>
                )}
              </div>
              <p className="text-fg-muted text-sm leading-relaxed mb-4 flex-1">{g.schedule}</p>
              {g.churchCenterUrl ? (
                <a
                  href={g.churchCenterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-accent-text hover:underline text-sm font-semibold"
                >
                  View details &amp; request to join
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7h8M8 4l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ) : (
                <p className="text-fg-subtle text-xs">Ask at Connect for details</p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-fg-subtle text-xs mt-6 text-center">
        Showing {filtered.length} of {groups.length} active Life Groups. &ldquo;View details &amp; request to
        join&rdquo; opens the group&apos;s own page on Planning Center Church Center, where you can see the
        full description and request to join directly.
      </p>
    </div>
  );
}
