"use client";

import { useMemo, useState } from "react";
import type { LifeGroup } from "@/lib/pco-groups";

const inputClass =
  "border border-border-strong rounded-xl px-4 py-3 w-full text-fg bg-surface-raised placeholder:text-fg-muted transition";

// Calendar order, not alphabetical — "Sunday" belongs first regardless of
// where it falls in a sorted string list.
const DAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Display order for Stage of Life, matching the order Josiah's screenshots
// of PCO admin (Groups → Settings → Tags, 2026-10-06) showed them in —
// life-stage labels first, then decade bands.
const STAGE_ORDER = [
  "Multigenerational", "College", "Young Adult", "Single", "Married", "Widowed", "With Kids",
  "20s", "30s", "40s", "50s", "60s", "70s + up",
];

// Matches SermonGrid.tsx's reusable Select — same look, same component
// shape, just not worth extracting to a shared file yet for one more use.
function PlainSelect({
  value,
  onChange,
  options,
  anyLabel,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  anyLabel: string;
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-surface-raised border border-border-strong text-fg-muted text-xs font-semibold rounded-lg pl-3 pr-7 py-2.5 cursor-pointer hover:border-border-strong focus:border-accent transition shadow-sm"
        aria-label={ariaLabel}
      >
        <option value="">{anyLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
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
  const [stage, setStage] = useState("");
  const [gender, setGender] = useState("");

  // Only offer values that at least one group actually carries — no point
  // showing "Friday" or "Widowed" in a dropdown if nothing's there to find.
  const availableDays = useMemo(() => {
    const present = new Set(groups.map((g) => g.dayOfWeek).filter((d): d is string => Boolean(d)));
    return DAY_ORDER.filter((d) => present.has(d));
  }, [groups]);

  const availableStages = useMemo(() => {
    const present = new Set(groups.flatMap((g) => g.stageOfLifeTags));
    return STAGE_ORDER.filter((s) => present.has(s));
  }, [groups]);

  const availableGenders = useMemo(() => {
    const present = new Set(groups.map((g) => g.genderSpecific).filter((g): g is string => Boolean(g)));
    return ["Men Only", "Women Only"].filter((g) => present.has(g));
  }, [groups]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups.filter((g) => {
      const matchesQuery = !q || g.name.toLowerCase().includes(q) || g.schedule.toLowerCase().includes(q);
      const matchesDay = !day || g.dayOfWeek === day;
      const matchesStage = !stage || g.stageOfLifeTags.includes(stage);
      const matchesGender = !gender || g.genderSpecific === gender;
      return matchesQuery && matchesDay && matchesStage && matchesGender;
    });
  }, [groups, query, day, stage, gender]);

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
        <div className="flex gap-3 flex-wrap">
          {availableDays.length > 0 && (
            <PlainSelect value={day} onChange={setDay} options={availableDays} anyLabel="Any day" ariaLabel="Filter by day of the week" />
          )}
          {availableStages.length > 0 && (
            <PlainSelect value={stage} onChange={setStage} options={availableStages} anyLabel="Any stage of life" ariaLabel="Filter by stage of life" />
          )}
          {availableGenders.length > 0 && (
            <PlainSelect value={gender} onChange={setGender} options={availableGenders} anyLabel="Men & women" ariaLabel="Filter by gender-specific group" />
          )}
        </div>
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
              {(g.genderSpecific || g.stageOfLifeTags.length > 0) && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {g.genderSpecific && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-fg-muted bg-surface-sunken rounded-full px-2 py-0.5">
                      {g.genderSpecific}
                    </span>
                  )}
                  {g.stageOfLifeTags.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold uppercase tracking-wide text-fg-muted bg-surface-sunken rounded-full px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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
